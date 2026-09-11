import sys
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)

from sifra_final_ai import predict_fatality, search_documents

print("=" * 60)
print("TESTING SIFRA-AI BACKEND ML MODEL V2 & HYBRID RAG PIPELINE")
print("=" * 60)

try:
    print("\n1. Testing predict_fatality() with sifra_model_v2.pkl...")
    prediction, probability = predict_fatality(
        employees=150,
        hours_worked=300000,
        naics_code=211111,
        industry="Oil and Gas Extraction",
        establishment_type="Operating",
        size="100 to 249",
        state="TX"
    )
    print(f"Prediction: {prediction}, Fatality Risk Probability: {probability:.2f}%")

    print("\n2. Testing hybrid search_documents() (FAISS + BM25 + CrossEncoder)...")
    results = search_documents("pressure surge gas leak valve maintenance LOTO", top_k=2)
    print(f"Retrieved {len(results)} RAG context chunks:")
    for idx, r in enumerate(results, 1):
        score = r.get("rerank_score", r.get("similarity", 0.0))
        rules = ", ".join(r.get("iogp_rules", ["General"]))
        print(f"  [{idx}] Source: {r['source']} (Page {r['page']}) - Score: {score:.4f}")
        print(f"      IOGP Tags: {rules}")
        print(f"      Text: {r['text'][:120]}...")

    print("\nSUCCESS: Both Model V2 predict_fatality() and Hybrid search_documents() run cleanly without errors!")

except Exception as e:
    print(f"\nERROR testing pipeline: {e}")
    import traceback
    traceback.print_exc()
