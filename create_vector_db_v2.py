import os
import pickle
import re
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
from rank_bm25 import BM25Okapi
import pypdf

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DOCS_FOLDER = os.path.join(BASE_DIR, "sefety_documents")
VECTOR_DB_FOLDER = os.path.join(BASE_DIR, "vector_database")
os.makedirs(VECTOR_DB_FOLDER, exist_ok=True)

FAISS_V2_PATH = os.path.join(VECTOR_DB_FOLDER, "sifra_faiss_v2.index")
CHUNKS_V2_PATH = os.path.join(VECTOR_DB_FOLDER, "chunks_v2.pkl")
BM25_CORPUS_PATH = os.path.join(VECTOR_DB_FOLDER, "bm25_corpus.pkl")

# 9 IOGP Life-Saving Rules Keywords for automatic semantic tagging
IOGP_RULES_MAP = {
    "Energy Isolation": ["loto", "lockout", "tagout", "isolation", "zero energy", "de-energize", "bleed", "depressurize"],
    "Hot Work": ["hot work", "welding", "grinding", "spark", "ignition", "lel", "flammable", "fire watch", "permit"],
    "Confined Space": ["confined space", "vessel entry", "oxygen", "toxic gas", "h2s", "attendant", "atmospheric test"],
    "Working at Height": ["height", "scaffolding", "harness", "lanyard", "fall protection", "tie-off", "derrick", "dropped object"],
    "Line of Fire": ["line of fire", "suspended load", "pinch point", "rotating table", "high pressure line", "winch cable", "barricade"],
    "Safe Mechanical Lifting": ["lifting", "crane", "rigging", "swl", "hoist", "tagline", "suspended load"],
    "Driving": ["driving", "vehicle", "seatbelt", "speed limit", "fatigue", "transportation", "journey management"],
    "Bypassing Safety Controls": ["bypass", "override", "defeat", "esd", "relief valve", "interlock", "safety critical"],
    "Management of Change": ["moc", "management of change", "modification", "procedure change", "authorization"]
}

def tag_iogp_rules(text):
    text_lower = text.lower()
    matched_rules = []
    for rule_name, keywords in IOGP_RULES_MAP.items():
        if any(kw in text_lower for kw in keywords):
            matched_rules.append(rule_name)
    return matched_rules if matched_rules else ["General Safety Observation"]

def semantic_chunking(text, target_tokens=350, overlap_tokens=50):
    words = text.split()
    chunks = []
    if len(words) <= target_tokens:
        return [text]
    
    start = 0
    while start < len(words):
        end = start + target_tokens
        chunk_words = words[start:end]
        chunks.append(" ".join(chunk_words))
        if end >= len(words):
            break
        start += (target_tokens - overlap_tokens)
    return chunks

print("=" * 65)
print("SIFRA-AI ENHANCED VECTOR DB & BM25 CORPUS GENERATOR")
print("=" * 65)

print("\nExtracting & Semantic Chunking Safety Documents...")
all_chunks = []

if os.path.exists(DOCS_FOLDER):
    files = os.listdir(DOCS_FOLDER)
    for fname in files:
        fpath = os.path.join(DOCS_FOLDER, fname)
        
        # Parse PDF
        if fname.lower().endswith(".pdf"):
            print(f"Reading PDF: {fname}")
            try:
                reader = pypdf.PdfReader(fpath)
                for page_num, page in enumerate(reader.pages, start=1):
                    p_text = page.extract_text()
                    if not p_text or len(p_text.strip()) < 10:
                        continue
                    chunks = semantic_chunking(p_text, target_tokens=350, overlap_tokens=50)
                    for c_idx, chunk in enumerate(chunks):
                        iogp_tags = tag_iogp_rules(chunk)
                        all_chunks.append({
                            "text": chunk,
                            "source": fname,
                            "page": page_num,
                            "chunk_id": f"{fname}_p{page_num}_c{c_idx}",
                            "iogp_rules": iogp_tags,
                            "doc_type": "PDF Manual"
                        })
            except Exception as e:
                print(f"Error reading PDF {fname}: {e}")

        # Parse Text File
        elif fname.lower().endswith(".txt"):
            print(f"Reading Text Document: {fname}")
            try:
                with open(fpath, "r", encoding="utf-8", errors="ignore") as f:
                    t_text = f.read()
                chunks = semantic_chunking(t_text, target_tokens=350, overlap_tokens=50)
                for c_idx, chunk in enumerate(chunks):
                    iogp_tags = tag_iogp_rules(chunk)
                    all_chunks.append({
                        "text": chunk,
                        "source": fname,
                        "page": 1,
                        "chunk_id": f"{fname}_c{c_idx}",
                        "iogp_rules": iogp_tags,
                        "doc_type": "IOGP Standard Grounding"
                    })
            except Exception as e:
                print(f"Error reading TXT {fname}: {e}")

print(f"\nTotal Semantic Chunks Created: {len(all_chunks)}")

# 1. FAISS Dense Embedding Index
print("\nEncoding chunks with SentenceTransformer (all-MiniLM-L6-v2)...")
embedder = SentenceTransformer("all-MiniLM-L6-v2")
chunk_texts = [c["text"] for c in all_chunks]
embeddings = embedder.encode(chunk_texts, convert_to_numpy=True)
embeddings = embeddings.astype("float32")
faiss.normalize_L2(embeddings)

dimension = embeddings.shape[1]
index_v2 = faiss.IndexFlatIP(dimension)
index_v2.add(embeddings)

faiss.write_index(index_v2, FAISS_V2_PATH)
print(f"Saved FAISS V2 Index to: {FAISS_V2_PATH}")

# 2. BM25 Keyword Search Corpus
print("\nTokenizing corpus for BM25 Keyword Indexing...")
tokenized_corpus = [re.findall(r'\w+', text.lower()) for text in chunk_texts]
bm25_index = BM25Okapi(tokenized_corpus)

with open(BM25_CORPUS_PATH, "wb") as f:
    pickle.dump({"bm25": bm25_index, "tokenized_corpus": tokenized_corpus}, f)
print(f"Saved BM25 Corpus to: {BM25_CORPUS_PATH}")

# 3. Save Chunks Metadata
with open(CHUNKS_V2_PATH, "wb") as f:
    pickle.dump(all_chunks, f)
print(f"Saved Chunks Metadata to: {CHUNKS_V2_PATH}")

print("\n" + "=" * 65)
print("VECTOR DB V2 & BM25 BUILD COMPLETE!")
print("=" * 65)
