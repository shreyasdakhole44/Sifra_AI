# =====================================================
# SIFRA-AI
# CREATE VECTOR DATABASE
# PDF -> TEXT -> CHUNKS -> EMBEDDINGS -> FAISS
# =====================================================

import os
import json
import pickle

import numpy as np
import faiss

from pypdf import PdfReader
from sentence_transformers import SentenceTransformer


# =====================================================
# CONFIGURATION
# =====================================================

import os


# =====================================================
# BASE DIRECTORY
# =====================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

PDF_FOLDER = os.path.join(
    BASE_DIR,
    "Data",
    "safety_documents"
)

VECTOR_DB_FOLDER = os.path.join(
    BASE_DIR,
    "vector_database"
)

# =====================================================
# FOLDERS
# =====================================================

# =====================================================
# CONFIGURATION
# =====================================================

# =====================================================
# CONFIGURATION
# =====================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


# PDF Folder
PDF_FOLDER = os.path.join(
    BASE_DIR,
    "sefety_documents"
)


# Vector Database Folder
VECTOR_DB_FOLDER = os.path.join(
    BASE_DIR,
    "vector_database"
)


# FAISS Index Path
FAISS_INDEX_PATH = os.path.join(
    VECTOR_DB_FOLDER,
    "sifra_faiss.index"
)


# Chunk Metadata Path
CHUNKS_PATH = os.path.join(
    VECTOR_DB_FOLDER,
    "chunks.pkl"
)

# =====================================================
# CREATE VECTOR DATABASE FOLDER
# =====================================================

os.makedirs(
    VECTOR_DB_FOLDER,
    exist_ok=True
)
# ==========================================================
# Add a Folder Check
# =================================================
print("\nPDF Folder Path:")
print(PDF_FOLDER)

if not os.path.exists(PDF_FOLDER):

    print("\nERROR: PDF folder not found!")

    print("Expected folder:")
    print(PDF_FOLDER)

    exit()

print("\nPDF Folder Found Successfully!")
# =====================================================
# LOAD EMBEDDING MODEL
# =====================================================

print("=" * 50)

print("LOADING EMBEDDING MODEL")

print("=" * 50)


embedding_model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)


print("\nEmbedding model loaded successfully!")


# =====================================================
# READ ALL PDF FILES
# =====================================================

print("\n" + "=" * 50)

print("READING PDF FILES")

print("=" * 50)


documents = []


for filename in os.listdir(PDF_FOLDER):


    if filename.lower().endswith(".pdf"):


        file_path = os.path.join(

            PDF_FOLDER,

            filename

        )


        print(

            f"\nReading: {filename}"

        )


        try:


            reader = PdfReader(

                file_path

            )


            for page_number, page in enumerate(

                reader.pages,

                start=1

            ):


                text = page.extract_text()


                if text:


                    text = text.strip()


                    if len(text) > 0:


                        documents.append({

                            "text": text,

                            "source": filename,

                            "page": page_number

                        })


        except Exception as e:


            print(

                f"Error reading {filename}: {e}"

            )


print("\nTotal Pages Loaded:")

print(

    len(documents)

)


# =====================================================
# CHUNKING FUNCTION
# =====================================================

def chunk_text(

    text,

    chunk_size=600,

    chunk_overlap=100

):


    chunks = []


    start = 0


    text_length = len(text)


    while start < text_length:


        end = min(

            start + chunk_size,

            text_length

        )


        chunk = text[start:end]


        # Avoid empty chunks

        if len(chunk.strip()) > 30:


            chunks.append(

                chunk.strip()

            )


        # Stop at end

        if end == text_length:

            break


        start = end - chunk_overlap


    return chunks


# =====================================================
# CREATE CHUNKS
# =====================================================

print("\n" + "=" * 50)

print("CREATING CHUNKS")

print("=" * 50)


all_chunks = []


for document in documents:


    page_chunks = chunk_text(

        document["text"]

    )


    for chunk_number, chunk in enumerate(

        page_chunks,

        start=1

    ):


        all_chunks.append({

            "text": chunk,

            "source": document["source"],

            "page": document["page"],

            "chunk_id": len(all_chunks),

            "chunk_number": chunk_number

        })


print("\nTotal Chunks Created:")

print(

    len(all_chunks)

)


# =====================================================
# CHECK IF CHUNKS EXIST
# =====================================================

if len(all_chunks) == 0:


    print(

        "\nERROR: No text chunks were created."

    )


    print(

        "Check your PDF files."

    )


    exit()


# =====================================================
# CREATE EMBEDDINGS
# =====================================================

print("\n" + "=" * 50)

print("CREATING EMBEDDINGS")

print("=" * 50)


texts = [


    chunk["text"]


    for chunk in all_chunks


]


embeddings = embedding_model.encode(

    texts,

    show_progress_bar=True,

    convert_to_numpy=True

)


# Convert to float32

embeddings = embeddings.astype(

    "float32"

)


print("\nEmbeddings Created!")

print(

    "Embedding Shape:",

    embeddings.shape

)


# =====================================================
# NORMALIZE EMBEDDINGS
# =====================================================

faiss.normalize_L2(

    embeddings

)


# =====================================================
# CREATE FAISS INDEX
# =====================================================

print("\n" + "=" * 50)

print("CREATING FAISS VECTOR DATABASE")

print("=" * 50)


dimension = embeddings.shape[1]


# Inner Product for cosine similarity

index = faiss.IndexFlatIP(

    dimension

)


# Add embeddings

index.add(

    embeddings

)


print(

    "\nFAISS Index Created!"

)


print(

    "Total Vectors:",

    index.ntotal

)


# =====================================================
# SAVE FAISS INDEX
# =====================================================

faiss.write_index(

    index,

    FAISS_INDEX_PATH

)


print(

    f"\nFAISS Index Saved:"

)

print(

    FAISS_INDEX_PATH

)


# =====================================================
# SAVE CHUNK METADATA
# =====================================================

with open(

    CHUNKS_PATH,

    "wb"

) as file:


    pickle.dump(

        all_chunks,

        file

    )


print(

    f"\nChunk Metadata Saved:"

)

print(

    CHUNKS_PATH

)


# =====================================================
# SAVE DATABASE INFORMATION
# =====================================================

database_info = {


    "embedding_model":

        "all-MiniLM-L6-v2",


    "total_documents":

        len(documents),


    "total_chunks":

        len(all_chunks),


    "embedding_dimension":

        dimension

}


INFO_PATH = os.path.join(

    VECTOR_DB_FOLDER,

    "database_info.json"

)


with open(

    INFO_PATH,

    "w"

) as file:


    json.dump(

        database_info,

        file,

        indent=4

    )


print(

    "\nDatabase Information Saved!"

)


# =====================================================
# COMPLETED
# =====================================================

print("\n" + "=" * 50)

print("SIFRA-AI VECTOR DATABASE CREATED")

print("=" * 50)


print(

    "\nFiles Created:"

)


print(

    "1. sifra_faiss.index"

)


print(

    "2. chunks.pkl"

)


print(

    "3. database_info.json"

)


print(

    "\nYou can now run rag_query.py"

)