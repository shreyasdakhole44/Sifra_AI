import os
import pickle
import re
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
VECTOR_DB_FOLDER = os.path.join(BASE_DIR, "vector_database")

FAISS_V2_PATH = os.path.join(VECTOR_DB_FOLDER, "sifra_faiss_v2.index")
CHUNKS_V2_PATH = os.path.join(VECTOR_DB_FOLDER, "chunks_v2.pkl")
BM25_CORPUS_PATH = os.path.join(VECTOR_DB_FOLDER, "bm25_corpus.pkl")

# Global singletons
embedding_model = None
cross_encoder_model = None
index_v2 = None
all_chunks_v2 = None
bm25_obj = None

def load_hybrid_rag_resources():
    global embedding_model, cross_encoder_model, index_v2, all_chunks_v2, bm25_obj
    
    if embedding_model is None:
        print("Loading Dense Embedding Model (all-MiniLM-L6-v2)...")
        embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
        
    if cross_encoder_model is None:
        try:
            from sentence_transformers import CrossEncoder
            print("Loading CrossEncoder Reranker (cross-encoder/ms-marco-MiniLM-L-6-v2)...")
            cross_encoder_model = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")
        except Exception as e:
            print(f"Notice: CrossEncoder loading deferred/bypassed: {e}")
            cross_encoder_model = None

    if index_v2 is None and os.path.exists(FAISS_V2_PATH):
        print("Loading FAISS V2 Index...")
        index_v2 = faiss.read_index(FAISS_V2_PATH)

    if all_chunks_v2 is None and os.path.exists(CHUNKS_V2_PATH):
        with open(CHUNKS_V2_PATH, "rb") as f:
            all_chunks_v2 = pickle.load(f)

    if bm25_obj is None and os.path.exists(BM25_CORPUS_PATH):
        with open(BM25_CORPUS_PATH, "rb") as f:
            data = pickle.load(f)
            bm25_obj = data["bm25"]

def reciprocal_rank_fusion(faiss_results, bm25_results, k=60):
    """
    RRF score = 1 / (k + faiss_rank) + 1 / (k + bm25_rank)
    """
    scores = {}
    doc_map = {}

    for rank, item in enumerate(faiss_results, start=1):
        idx = item["idx"]
        scores[idx] = scores.get(idx, 0.0) + (1.0 / (k + rank))
        doc_map[idx] = item["chunk"]

    for rank, item in enumerate(bm25_results, start=1):
        idx = item["idx"]
        scores[idx] = scores.get(idx, 0.0) + (1.0 / (k + rank))
        doc_map[idx] = item["chunk"]

    sorted_indices = sorted(scores.keys(), key=lambda x: scores[x], reverse=True)
    return [doc_map[idx] for idx in sorted_indices]

def hybrid_search_documents(query, top_k=3, candidate_k=10):
    load_hybrid_rag_resources()

    if index_v2 is None or all_chunks_v2 is None:
        raise FileNotFoundError("Hybrid vector database not found. Please run create_vector_db_v2.py first.")

    # 1. FAISS Dense Retrieval
    query_emb = embedding_model.encode([query], convert_to_numpy=True).astype("float32")
    faiss.normalize_L2(query_emb)
    similarities, indices = index_v2.search(query_emb, candidate_k)

    faiss_candidates = []
    for sim, idx in zip(similarities[0], indices[0]):
        if idx != -1:
            faiss_candidates.append({"idx": idx, "chunk": all_chunks_v2[idx], "similarity": float(sim)})

    # 2. BM25 Keyword Sparse Retrieval
    tokens = re.findall(r'\w+', query.lower())
    if bm25_obj:
        bm25_scores = bm25_obj.get_scores(tokens)
        bm25_top_indices = np.argsort(bm25_scores)[::-1][:candidate_k]

        bm25_candidates = []
        for idx in bm25_top_indices:
            bm25_candidates.append({"idx": idx, "chunk": all_chunks_v2[idx], "score": float(bm25_scores[idx])})

        # 3. Reciprocal Rank Fusion (RRF)
        hybrid_candidates = reciprocal_rank_fusion(faiss_candidates, bm25_candidates, k=60)[:candidate_k]
    else:
        hybrid_candidates = [c["chunk"] for c in faiss_candidates[:candidate_k]]

    # 4. CrossEncoder Neural Reranking over top candidate chunks (if available)
    final_ranked_chunks = hybrid_candidates
    if cross_encoder_model:
        try:
            pairs = [[query, c["text"]] for c in hybrid_candidates]
            rerank_scores = cross_encoder_model.predict(pairs)
            for i, score in enumerate(rerank_scores):
                hybrid_candidates[i]["rerank_score"] = float(score)
            final_ranked_chunks = sorted(hybrid_candidates, key=lambda x: x.get("rerank_score", 0.0), reverse=True)
        except Exception as ex:
            print(f"Notice: CrossEncoder reranking fallback: {ex}")

    results = []
    for chunk in final_ranked_chunks[:top_k]:
        results.append({
            "text": chunk.get("text", ""),
            "source": chunk.get("source", "Unknown Document"),
            "page": chunk.get("page", 1),
            "iogp_rules": chunk.get("iogp_rules", ["General Safety Observation"]),
            "doc_type": chunk.get("doc_type", "Manual"),
            "rerank_score": float(chunk.get("rerank_score", chunk.get("similarity", 0.85)))
        })

    return results

if __name__ == "__main__":
    print("Testing Hybrid Search Pipeline...")
    res = hybrid_search_documents("BOP lock-out during pressure surge gas purge", top_k=3)
    for idx, r in enumerate(res, 1):
        print(f"\n[{idx}] {r['source']} (Page {r['page']}) | Rerank Score: {r['rerank_score']:.4f}")
        print(f"    IOGP Rules Tagged: {', '.join(r['iogp_rules'])}")
        print(f"    Text: {r['text'][:140]}...")
