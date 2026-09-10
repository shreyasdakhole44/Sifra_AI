# =====================================================
# SIFRA-AI
# ML MODEL + RAG INTEGRATION
# =====================================================

import os
import pickle

import numpy as np
import pandas as pd
import faiss

from sentence_transformers import SentenceTransformer


# =====================================================
# CONFIGURATION
# =====================================================

MODEL_PATH = "sifra_first_model.pkl"

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
# 1. LOAD ML MODEL
# =====================================================

print("=" * 60)

print("LOADING SIFRA-AI ML MODEL")

print("=" * 60)


with open(MODEL_PATH, "rb") as file:

    ml_model = pickle.load(file)


print("\nML Model Loaded Successfully!")


# =====================================================
# 2. LOAD EMBEDDING MODEL
# =====================================================

print("\n" + "=" * 60)

print("LOADING EMBEDDING MODEL")

print("=" * 60)


embedding_model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)


print("\nEmbedding Model Loaded Successfully!")


# =====================================================
# 3. LOAD FAISS VECTOR DATABASE
# =====================================================

print("\n" + "=" * 60)

print("LOADING FAISS VECTOR DATABASE")

print("=" * 60)


index = faiss.read_index(
    FAISS_INDEX_PATH
)


print("\nFAISS Database Loaded!")

print(
    "Total Vectors:",
    index.ntotal
)


# =====================================================
# 4. LOAD CHUNK METADATA
# =====================================================

with open(CHUNKS_PATH, "rb") as file:

    all_chunks = pickle.load(file)


print(
    "Chunk Metadata Loaded!"
)


# =====================================================
# 5. RAG SEARCH FUNCTION
# =====================================================

def search_documents(
    query,
    top_k=3
):

    # Create embedding for user query

    query_embedding = embedding_model.encode(

        [query],

        convert_to_numpy=True

    )


    query_embedding = query_embedding.astype(
        "float32"
    )


    # Normalize for cosine similarity

    faiss.normalize_L2(
        query_embedding
    )


    # Search FAISS

    similarities, indices = index.search(

        query_embedding,

        top_k

    )


    results = []


    # Store retrieved results

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

            "similarity":
                float(similarity)

        })


    return results


# =====================================================
# 6. ML PREDICTION FUNCTION
# =====================================================

def predict_fatality(
    employees,
    hours_worked,
    naics_code,
    industry,
    establishment_type,
    size,
    state
):

    # Create input data with EXACT training features

    input_data = pd.DataFrame({

        "annual_average_employees": [employees],

        "total_hours_worked": [hours_worked],

        "naics_code": [naics_code],

        "industry_description": [industry],

        "establishment_type": [establishment_type],

        "size": [size],

        "state": [state]

    })


    # Prediction

    prediction = ml_model.predict(
        input_data
    )[0]


    # Probability

    probabilities = ml_model.predict_proba(
        input_data
    )[0]


    # Get probability for class 1 (Fatality)

    fatality_probability = probabilities[1] * 100


    # Convert prediction

    if prediction == 1:

        result = "YES"

    else:

        result = "NO"


    return result, fatality_probability

# =====================================================
# 7. DISPLAY ML RESULT
# =====================================================

def display_ml_result(
    prediction,
    probability
):

    print("\n")

    print("=" * 60)

    print("ML MODEL RESULT")

    print("=" * 60)


    print(

        f"\nFatality Indicator : {prediction}"

    )


    print(

        f"Probability        : {probability:.2f}%"

    )


# =====================================================
# 8. DISPLAY RAG RESULT
# =====================================================

def display_rag_results(
    results
):

    print("\n")

    print("=" * 60)

    print("RAG RETRIEVED SAFETY INFORMATION")

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

            f"Similarity : {result['similarity']:.4f}"

        )


        print(

            "\nInformation:"

        )


        print(

            result["text"]

        )


# =====================================================
# 9. MAIN SIFRA-AI SYSTEM
# =====================================================

print("\n")

print("=" * 60)

print("SIFRA-AI")

print("ML MODEL + RAG SYSTEM READY")

print("=" * 60)


while True:


    print("\n")

    print("-" * 60)

    print("ENTER INCIDENT INFORMATION")

    print("-" * 60)


    # ---------------------------------------------
    # USER INCIDENT DESCRIPTION
    # ---------------------------------------------

    incident = input(

        "\nDescribe the incident\n"
        "(or type 'exit'): "

    )


    # Exit

    if incident.lower() == "exit":

        print(

            "\nSIFRA-AI System Closed."

        )

        break


    # ---------------------------------------------
    # ML MODEL INPUTS
    # ---------------------------------------------
    print("\nEnter Establishment Information")


    employees = float(
    input("Annual Average Employees: ")
    )


    hours_worked = float(
    input("Total Hours Worked: ")
    )


    naics_code = float(
    input("NAICS Code: ")
    )


    industry = input(
    "Industry Description: "
    )


    establishment_type = input(
    "Establishment Type: "
    )


    size = input(
    "Establishment Size: "
    )


    state = input(
    "State: "
    )
    # =================================================
    # ML PREDICTION
    # =================================================

    print("\n")

    print("Running ML Model...")


    prediction, probability = predict_fatality(

    employees,

    hours_worked,

    naics_code,

    industry,

    establishment_type,

    size,

    state

    )


    # =================================================
    # RAG SEARCH
    # =================================================

    print(

        "Searching Safety Knowledge Base..."

    )


    rag_results = search_documents(

        incident,

        top_k=3

    )


    # =================================================
    # DISPLAY FINAL COMBINED OUTPUT
    # =================================================

    print("\n")

    print("#" * 60)

    print("SIFRA-AI COMBINED ANALYSIS")

    print("#" * 60)


    # ML OUTPUT

    display_ml_result(

        prediction,

        probability

    )


    # RAG OUTPUT

    display_rag_results(

        rag_results

    )


    print("\n")

    print("#" * 60)

    print("ANALYSIS COMPLETED")

    print("#" * 60)