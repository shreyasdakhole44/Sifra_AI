# 🛡️ SIFRA-AI

## Safety Intelligence Framework for Risk Analysis using Artificial Intelligence

SIFRA-AI is an AI-based industrial safety analysis system that combines:

- 🤖 Machine Learning
- 📚 RAG (Retrieval-Augmented Generation)
- 🔍 FAISS Vector Database
- 🧠 Large Language Model (LLM)
- 📄 Safety PDF Knowledge Base

The system analyzes an incident description, retrieves relevant safety information, generates an ML-based risk estimate, and provides an AI-generated safety analysis.

---

# 🚀 Project Architecture

```text
                    USER
                      │
                      ▼
              Incident Description
                      │
                      ▼
              ┌──────────────┐
              │   SIFRA-AI   │
              └──────────────┘
                 │        │
                 │        │
                 ▼        ▼
           ML MODEL       RAG
          Random Forest   FAISS
                 │        │
                 │        │
                 ▼        ▼
          Risk Estimate   PDF Knowledge
                 │        │
                 └────┬───┘
                      │
                      ▼
                  GROQ LLM
                      │
                      ▼
            FINAL SAFETY ANALYSIS
```

---

# 📁 Project Structure

```text
SIFRA-AI/
│
├── Data/
│   └── safety_documents/
│       ├── safety_document_1.pdf
│       └── safety_document_2.pdf
│
├── vector_database/
│   ├── sifra_faiss.index
│   ├── chunks.pkl
│   └── database_info.json
│
├── sifra_first_model.pkl
│
├── create_vector_db.py
│
├── sifra_final_ai.py
│
├── test_groq.py
│
├── check_model.py
│
├── requirements.txt
│
├── .env
│
├── .gitignore
│
└── README.md
```

---

# 🧠 Technologies Used

| Technology | Purpose |
|---|---|
| Python | Main programming language |
| Scikit-learn | Machine Learning model |
| Random Forest | Risk prediction |
| Pandas | Data processing |
| FAISS | Vector database |
| Sentence Transformers | Text embeddings |
| RAG | Retrieve relevant safety information |
| Groq API | Large Language Model |
| GPT-OSS | AI-generated explanation |
| PyPDF | Extract text from PDF files |

---

# 🤖 Machine Learning Model

The project uses a **Random Forest Classifier**.

The ML pipeline includes:

```text
Input Data
    ↓
Data Preprocessing
    ↓
Missing Value Handling
    ↓
Categorical Encoding
    ↓
Random Forest Model
    ↓
Risk Prediction
```

## Input Features

The ML model uses the following features:

### Numerical Features

- Annual Average Employees
- Total Hours Worked
- NAICS Code

### Categorical Features

- Industry Description
- Establishment Type
- Establishment Size
- State

---

# 📊 ML Output

The model generates:

```text
Fatality Indicator

YES / NO
```

and:

```text
Fatality Probability

Example: 52.31%
```

⚠️ The probability is a **machine learning model estimate based on training data**. It is not a guarantee that a real-world incident will occur.

---

# 📚 RAG Pipeline

The RAG system works as follows:

```text
Safety PDF Files
       ↓
Text Extraction
       ↓
Chunking
       ↓
Text Embeddings
       ↓
FAISS Vector Database
       ↓
User Query
       ↓
Similarity Search
       ↓
Relevant Safety Information
```

---

# 📄 Creating the Vector Database

Safety PDF files should be placed inside:

```text
Data/safety_documents/
```

Example:

```text
Data/
└── safety_documents/
    ├── UA_UC_Rules.pdf
    └── Safety_Knowledge_Base.pdf
```

Run:

```bash
python create_vector_db.py
```

This creates:

```text
vector_database/
├── sifra_faiss.index
├── chunks.pkl
└── database_info.json
```

---

# 🔍 FAISS

FAISS is used to store vector embeddings of the safety documents.

When a user describes an incident:

```text
User Incident
      ↓
Convert Text to Embedding
      ↓
FAISS Similarity Search
      ↓
Retrieve Relevant Safety Information
```

---

# 🧠 LLM Integration

The project uses:

```text
Groq API
```

with the model:

```text
openai/gpt-oss-20b
```

The LLM receives:

1. User Incident Description
2. ML Model Prediction
3. ML Probability
4. Relevant RAG Context

Then generates a structured safety analysis.

---

# 🔑 API Key Setup

Create a `.env` file in the main project folder.

```text
GROQ_API_KEY=your_api_key_here
```

⚠️ Never upload your API key to GitHub.

The `.env` file should be included in `.gitignore`.

---

# ▶️ Installation

## 1. Clone Repository

```bash
git clone YOUR_REPOSITORY_URL
```

Move into the project folder:

```bash
cd SIFRA-AI
```

---

## 2. Install Required Libraries

```bash
pip install -r requirements.txt
```

---

# 📦 Required Libraries

Main libraries include:

```text
pandas
numpy
scikit-learn
faiss-cpu
sentence-transformers
pypdf
groq
python-dotenv
```

---

# 📝 Create `requirements.txt`

You can generate it using:

```bash
pip freeze > requirements.txt
```

Or manually add:

```text
pandas
numpy
scikit-learn
faiss-cpu
sentence-transformers
pypdf
groq
python-dotenv
```

---

# 🚀 Running the Project

## Step 1: Create Vector Database

If the vector database does not already exist:

```bash
python create_vector_db.py
```

---

## Step 2: Run SIFRA-AI

```bash
python sifra_final_ai.py
```

---

# 💻 Example Input

```text
Describe the incident:

A worker ignored a safety procedure while
working in a potentially hazardous area.


Annual Average Employees:
123

Total Hours Worked:
500000

NAICS Code:
211120

Industry Description:
Crude Petroleum Extraction

Establishment Type:
1.0

Establishment Size:
2

State:
TX
```

---

# 📋 Example Output

```text
SIFRA-AI FINAL SAFETY ANALYSIS

1. INCIDENT SUMMARY

The system summarizes the user-provided incident.


2. ML RISK ESTIMATE

Fatality Indicator: YES

Fatality Probability: XX.XX%

Note:
This is a model estimate and not a certainty.


3. UA / UC ANALYSIS

Analysis based on the incident description
and retrieved safety knowledge.


4. RELEVANT HAZARDS

Only hazards supported by the incident
description or retrieved knowledge should
be reported.


5. CRITICAL SAFETY BARRIERS

Relevant safety controls and barriers.


6. SAFETY OBSERVATIONS

Information retrieved from the safety
knowledge base.


7. LIMITATIONS

The analysis depends on:

- ML training data
- User-provided information
- Retrieved PDF knowledge
```

---

# 👥 Team Collaboration

This project uses Git branches for collaboration.

```text
main
 │
 ├── ml
 │
 ├── backend
 │
 └── frontend
```

## Branch Rules

⚠️ Do not directly push experimental changes to `main`.

Each team member should work on their own branch.

Example:

```bash
git checkout -b ml
```

Push changes:

```bash
git add .

git commit -m "Add ML model improvements"

git push origin ml
```

After testing, create a **Pull Request** to merge changes into `main`.

---

# 🔐 Important Security Rules

Never upload:

```text
.env
API Keys
Passwords
Private Credentials
```

Make sure `.gitignore` contains:

```text
.env
__pycache__/
*.pyc
venv/
.venv/
```

---

# ⚠️ Limitations

SIFRA-AI is a prototype and research/project system.

The system:

- Does not guarantee real-world outcomes.
- Does not replace professional safety experts.
- Uses historical data for ML estimates.
- Depends on the quality of the safety documents.
- May retrieve incomplete information.
- Should not be used as the sole basis for critical safety decisions.

---

# 🔮 Future Improvements

Possible future improvements:

- [ ] Improve ML model performance
- [ ] Hyperparameter tuning
- [ ] Add XGBoost comparison
- [ ] Increase safety knowledge base
- [ ] Improve document chunking
- [ ] Add source citations in final output
- [ ] Add confidence thresholds for RAG
- [ ] Build a web interface
- [ ] Add user authentication
- [ ] Store incident history in a database
- [ ] Create dashboards and visualizations
- [ ] Add real-time safety monitoring

---

# 👨‍💻 Team

SIFRA-AI is developed as a collaborative team project.

Each team member contributes through separate Git branches and Pull Requests.

---

# 🎯 Project Goal

The goal of SIFRA-AI is to combine:

```text
Machine Learning
        +
Retrieval-Augmented Generation
        +
Large Language Models
        ↓
AI-Assisted Safety Analysis
```

to provide structured and explainable industrial safety information.

---

# 📌 Disclaimer

SIFRA-AI provides AI-assisted analysis for educational and research purposes.

ML predictions are statistical estimates based on training data and should not be interpreted as certain real-world outcomes.

Always follow applicable safety procedures and consult qualified safety professionals for real-world safety decisions.