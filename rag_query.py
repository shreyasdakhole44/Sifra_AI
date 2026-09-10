# =====================================================
# SIFRA-AI
# RAG DOCUMENT RETRIEVAL SYSTEM
# =====================================================

import os
import pickle

import numpy as np
import faiss

from sentence_transformers import SentenceTransformer


# =====================================================
# CONFIGURATION
# =====================================================

VECTOR_DB_FOLDER = "vector_database"


FAISS_INDEX_PATH = os.path.join(

    VECTOR_DB_FOLDER,

    "sifra_faiss.index"

)


CHUNKS_PATH = os.path.join(

    VECTOR_DB_FOLDER,

    "chunks.pkl"

)


# =====================================================
# LOAD EMBEDDING MODEL
# =====================================================

print("\nLoading embedding model...")


embedding_model = SentenceTransformer(

    "all-MiniLM-L6-v2"

)


print(

    "Embedding model loaded!"

)


# =====================================================
# LOAD FAISS DATABASE
# =====================================================

print(

    "\nLoading FAISS Vector Database..."

)


index = faiss.read_index(

    FAISS_INDEX_PATH

)


print(

    "FAISS Database loaded!"

)


print(

    "Total Vectors:",

    index.ntotal

)


# =====================================================
# LOAD CHUNK METADATA
# =====================================================

with open(

    CHUNKS_PATH,

    "rb"

) as file:


    all_chunks = pickle.load(

        file

    )


print(

    "Chunk metadata loaded!"

)


# =====================================================
# SEARCH FUNCTION
# =====================================================

def search_documents(

    query,

    top_k=5

):


    # -----------------------------------------
    # CREATE QUERY EMBEDDING
    # -----------------------------------------

    query_embedding = embedding_model.encode(

        [query],

        convert_to_numpy=True

    )


    query_embedding = query_embedding.astype(

        "float32"

    )


    # -----------------------------------------
    # NORMALIZE QUERY
    # -----------------------------------------

    faiss.normalize_L2(

        query_embedding

    )


    # -----------------------------------------
    # SEARCH VECTOR DATABASE
    # -----------------------------------------

    similarities, indices = index.search(

        query_embedding,

        top_k

    )


    # -----------------------------------------
    # STORE RESULTS
    # -----------------------------------------

    results = []


    for similarity, idx in zip(

        similarities[0],

        indices[0]

    ):


        if idx == -1:

            continue


        chunk = all_chunks[idx]


        results.append({


            "text":

                chunk["text"],


            "source":

                chunk["source"],


            "page":

                chunk["page"],


            "chunk_id":

                chunk["chunk_id"],


            "similarity":

                float(similarity)

        })


    return results


# =====================================================
# DISPLAY RESULTS
# =====================================================

def display_results(

    results

):


    print("\n")

    print("=" * 60)

    print("RELEVANT SAFETY INFORMATION")

    print("=" * 60)


    for number, result in enumerate(

        results,

        start=1

    ):


        print(

            f"\nRESULT {number}"

        )


        print(

            "-" * 40

        )


        print(

            f"Source     : {result['source']}"

        )


        print(

            f"Page       : {result['page']}"

        )


        print(

            f"Chunk ID   : {result['chunk_id']}"

        )


        print(

            f"Similarity : {result['similarity']:.4f}"

        )


        print(

            "\nInformation:"

        )


        print(

            result["text"]

        )


        print(

            "\n"

        )


# =====================================================
# INTERACTIVE RAG LOOP
# =====================================================

print("\n" + "=" * 60)

print("SIFRA-AI RAG SYSTEM READY")

print("=" * 60)


print(

    "\nType 'exit' to stop."

)


while True:


    user_query = input(

        "\nAsk a safety question: "

    )


    if user_query.lower() == "exit":


        print(

            "\nSIFRA-AI RAG System Closed."

        )


        break


    if len(user_query.strip()) == 0:


        print(

            "Please enter a valid question."

        )


        continue


    # -----------------------------------------
    # SEARCH DOCUMENTS
    # -----------------------------------------

    results = search_documents(

        user_query,

        top_k=5

    )


    # -----------------------------------------
    # DISPLAY RESULTS
    # -----------------------------------------

    display_results(

        results

    )