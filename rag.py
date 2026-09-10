# =====================================================
# SIFRA-AI RAG PIPELINE
# PDF -> Chunking -> Embedding -> FAISS -> Retrieval
# =====================================================

import os
from pypdf import PdfReader

import faiss
import numpy as np

from sentence_transformers import SentenceTransformer


# =====================================================
# 1. LOAD EMBEDDING MODEL
# =====================================================

print("Loading embedding model...")

embedding_model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)

print("Embedding model loaded successfully!")


# =====================================================
# 2. PDF FOLDER
# =====================================================

PDF_FOLDER = "safety_documents"


# =====================================================
# 3. READ PDF FILES
# =====================================================

documents = []


for filename in os.listdir(PDF_FOLDER):

    if filename.endswith(".pdf"):

        file_path = os.path.join(
            PDF_FOLDER,
            filename
        )


        print(
            f"\nReading: {filename}"
        )


        reader = PdfReader(
            file_path
        )


        text = ""


        for page_number, page in enumerate(reader.pages):

            page_text = page.extract_text()


            if page_text:

                documents.append({

                    "text": page_text,

                    "source": filename,

                    "page": page_number + 1

                })


print("\nTotal Pages Loaded:")

print(
    len(documents)
)


# =====================================================
# 4. CHUNKING FUNCTION
# =====================================================

def chunk_text(

    text,

    chunk_size=500,

    chunk_overlap=100

):


    chunks = []


    start = 0


    while start < len(text):


        end = start + chunk_size


        chunk = text[start:end]


        chunks.append(
            chunk
        )


        start += (
            chunk_size - chunk_overlap
        )


    return chunks


# =====================================================
# 5. CREATE CHUNKS
# =====================================================

all_chunks = []


for document in documents:


    text = document["text"]


    chunks = chunk_text(
        text
    )


    for chunk in chunks:


        all_chunks.append({

            "text": chunk,

            "source": document["source"],

            "page": document["page"]

        })


print("\nTotal Chunks Created:")

print(
    len(all_chunks)
)


# =====================================================
# 6. CREATE EMBEDDINGS
# =====================================================

print(
    "\nCreating embeddings..."
)


texts = [

    chunk["text"]

    for chunk in all_chunks

]


embeddings = embedding_model.encode(

    texts,

    show_progress_bar=True

)


embeddings = np.array(

    embeddings

).astype("float32")


print(
    "\nEmbeddings Created!"
)


print(
    "Embedding Shape:",
    embeddings.shape
)


# =====================================================
# 7. CREATE FAISS VECTOR DATABASE
# =====================================================

dimension = embeddings.shape[1]


index = faiss.IndexFlatL2(
    dimension
)


index.add(
    embeddings
)


print(
    "\nFAISS Vector Database Created!"
)


print(
    "Total Vectors:",
    index.ntotal
)


# =====================================================
# 8. USER QUERY FUNCTION
# =====================================================

def search_documents(

    query,

    top_k=3

):


    query_embedding = embedding_model.encode(

        [query]

    )


    query_embedding = np.array(

        query_embedding

    ).astype("float32")


    distances, indices = index.search(

        query_embedding,

        top_k

    )


    results = []


    for i, idx in enumerate(indices[0]):


        results.append({

            "text": all_chunks[idx]["text"],

            "source": all_chunks[idx]["source"],

            "page": all_chunks[idx]["page"],

            "distance": float(
                distances[0][i]
            )

        })


    return results


# =====================================================
# 9. TEST RAG PIPELINE
# =====================================================

print(
    "\n================================="
)

print(
    "SIFRA-AI RAG SYSTEM READY"
)

print(
    "================================="
)


user_query = input(

    "\nEnter your safety question: "

)


results = search_documents(

    user_query,

    top_k=3

)


# =====================================================
# 10. DISPLAY RESULTS
# =====================================================

print(
    "\n================================="
)

print(
    "RELEVANT SAFETY INFORMATION"
)

print(
    "================================="
)


for i, result in enumerate(

    results,

    start=1

):


    print(
        f"\nRESULT {i}"
    )


    print(
        "Source:",
        result["source"]
    )


    print(
        "Page:",
        result["page"]
    )


    print(
        "\nInformation:"
    )


    print(
        result["text"]
    )


    print(
        "\nSimilarity Distance:",
        result["distance"]
    )


    print(
        "\n-------------------------"
    )