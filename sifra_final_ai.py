# =====================================================
# SIFRA-AI
# FINAL ML + RAG + NVIDIA LLM SYSTEM
# =====================================================

import os
import pickle

import pandas as pd
import faiss

from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
from groq import Groq


# =====================================================
# LOAD ENVIRONMENT VARIABLES
# =====================================================

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:

    print("ERROR: GROQ_API_KEYnot found.")
    print("Create a .env file and add your API key.")

    exit()


# =====================================================
# BASE DIRECTORY
# =====================================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)


# =====================================================
# PATHS
# =====================================================

MODEL_PATH = os.path.join(
    BASE_DIR,
    "sifra_first_model.pkl"
)


VECTOR_DB_FOLDER = os.path.join(
    BASE_DIR,
    "vector_database"
)


FAISS_INDEX_PATH = os.path.join(
    VECTOR_DB_FOLDER,
    "sifra_faiss.index"
)


CHUNKS_PATH = os.path.join(
    VECTOR_DB_FOLDER,
    "chunks.pkl"
)


# =====================================================
# GROUQ LLM CLIENT
# =====================================================

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

client = Groq(
    api_key=GROQ_API_KEY
)

# =====================================================
# MODEL NAME
# =====================================================

LLM_MODEL = "openai/gpt-oss-20b"


# =====================================================
# LOAD ML MODEL
# =====================================================

print("\nLoading SIFRA ML Model...")


with open(MODEL_PATH, "rb") as file:

    ml_model = pickle.load(file)


print("ML Model Loaded Successfully!")


# =====================================================
# LOAD EMBEDDING MODEL
# =====================================================

print("Loading Embedding Model...")


embedding_model = SentenceTransformer(

    "all-MiniLM-L6-v2"

)


print("Embedding Model Loaded Successfully!")


# =====================================================
# LOAD FAISS
# =====================================================

print("Loading FAISS Vector Database...")


index = faiss.read_index(

    FAISS_INDEX_PATH

)


with open(CHUNKS_PATH, "rb") as file:

    all_chunks = pickle.load(file)


print("FAISS Vector Database Loaded Successfully!")

print("Total Knowledge Chunks:", index.ntotal)


# =====================================================
# ML PREDICTION
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


    input_data = pd.DataFrame({

        "annual_average_employees":

            [employees],

        "total_hours_worked":

            [hours_worked],

        "naics_code":

            [naics_code],

        "industry_description":

            [industry],

        "establishment_type":

            [establishment_type],

        "size":

            [size],

        "state":

            [state]

    })


    prediction = ml_model.predict(

        input_data

    )[0]


    probabilities = ml_model.predict_proba(

        input_data

    )[0]


    fatality_probability = probabilities[1] * 100


    prediction_text = (

        "YES"

        if prediction == 1

        else "NO"

    )


    return prediction_text, fatality_probability


# =====================================================
# RAG SEARCH
# =====================================================

def search_documents(

    query,
    top_k=3

):


    query_embedding = embedding_model.encode(

        [query],

        convert_to_numpy=True

    )


    query_embedding = query_embedding.astype(

        "float32"

    )


    faiss.normalize_L2(

        query_embedding

    )


    similarities, indices = index.search(

        query_embedding,

        top_k

    )


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

            "similarity":

                float(similarity)

        })


    return results


# =====================================================
# CREATE RAG CONTEXT
# =====================================================

def create_rag_context(

    results

):


    context = ""


    for number, result in enumerate(

        results,

        start=1

    ):


        context += f"""

SOURCE {number}

Document:
{result['source']}

Page:
{result['page']}

Safety Information:
{result['text']}

"""


    return context


# =====================================================
# GENERATE FINAL LLM RESPONSE
# =====================================================

def generate_sifra_response(

    incident,
    prediction,
    probability,
    rag_context

):


    prompt = f"""
You are SIFRA-AI, an industrial safety information assistant.

Analyze the incident using ONLY the provided ML prediction
and retrieved safety knowledge.

IMPORTANT:
- Do not invent facts.
- Clearly distinguish ML prediction from retrieved information.
- If the retrieved context does not contain enough information,
  say that the knowledge base does not provide enough detail.
- Do not claim that a fatality will occur.
- The ML probability is a model estimate, not a certainty.
- Give general safety analysis only.

INCIDENT:
{incident}

ML MODEL RESULT:
Fatality Indicator: {prediction}
Fatality Probability: {probability:.2f}%

RETRIEVED SAFETY KNOWLEDGE:
{rag_context}

Provide the response in this format:

1. INCIDENT SUMMARY
2. ML RISK ESTIMATE
3. UA / UC ANALYSIS
4. RELEVANT HAZARDS
5. CRITICAL BARRIERS
6. SAFETY OBSERVATIONS FROM KNOWLEDGE BASE
7. LIMITATIONS

Keep the answer clear and concise.
"""


    response = client.chat.completions.create(

        model=LLM_MODEL,

        messages=[

            {

                "role": "system",

                "content":
                "You are a careful industrial safety analysis assistant."

            },

            {

                "role": "user",

                "content": prompt

            }

        ],

        temperature=0.2,

        max_tokens=1000

    )


    return response.choices[0].message.content


# =====================================================
# MAIN SYSTEM
# =====================================================

print("\n")

print("=" * 65)

print("SIFRA-AI FINAL SYSTEM")

print("ML + RAG + NVIDIA LLM")

print("=" * 65)


while True:


    print("\n")

    print("-" * 65)

    print("ENTER INCIDENT INFORMATION")

    print("-" * 65)


    incident = input(

        "\nDescribe the incident "
        "(or type 'exit'): "

    )


    if incident.lower() == "exit":

        print("\nSIFRA-AI System Closed.")

        break


    # =================================================
    # INPUT FEATURES
    # =================================================

    print("\nEnter Establishment Information")


    employees = float(

        input(
            "Annual Average Employees: "
        )

    )


    hours_worked = float(

        input(
            "Total Hours Worked: "
        )

    )


    naics_code = float(

        input(
            "NAICS Code: "
        )

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

    print("\nRunning ML Model...")


    prediction, probability = predict_fatality(

        employees,
        hours_worked,
        naics_code,
        industry,
        establishment_type,
        size,
        state

    )


    print("ML Prediction Completed!")


    # =================================================
    # RAG SEARCH
    # =================================================

    print("Searching Safety Knowledge Base...")


    rag_results = search_documents(

        incident,

        top_k=3

    )


    rag_context = create_rag_context(

        rag_results

    )


    print("Relevant Safety Information Retrieved!")


    # =================================================
    # NVIDIA LLM
    # =================================================

    print("Generating AI Safety Analysis...")


    try:


        final_response = generate_sifra_response(

            incident,

            prediction,

            probability,

            rag_context

        )


        print("\n")

        print("=" * 65)

        print("SIFRA-AI FINAL SAFETY ANALYSIS")

        print("=" * 65)


        print(

            "\n" + final_response

        )


        print("\n")

        print("=" * 65)


    except Exception as e:


        print(

            "\nLLM ERROR:"

        )


        print(e)