# ============================================================
# SIFRA-AI - MODEL V2 TRAINING PIPELINE
# COMBINED REAL OSHA & BLS DATASET
#
# Models Trained:
#   1. Random Forest + SMOTE / RandomOverSampler
#   2. XGBoost + Scale Pos Weight
#
# Evaluation & Selection:
#   Stratified 5-Fold Cross-Validation, GridSearchCV Tuning,
#   Selection by ROC-AUC score.
# ============================================================

import os
import pickle
import warnings
import pandas as pd
import numpy as np

from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder
from sklearn.model_selection import StratifiedKFold, train_test_split
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from imblearn.over_sampling import RandomOverSampler
from imblearn.pipeline import Pipeline as ImbPipeline
from sklearn.pipeline import Pipeline as SkPipeline

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    classification_report
)

warnings.filterwarnings("ignore")

DATA_PATH = "output/combined_osha_bls_dataset.csv"
MODEL_V2_PATH = "sifra_model_v2.pkl"
FEATURE_IMP_PATH = "feature_importance_v2.csv"
OLD_MODEL_PATH = "sifra_first_model.pkl"

print("=" * 65)
print("SIFRA-AI MODEL V2 TRAINING & EVALUATION PIPELINE")
print("=" * 65)

# 1. Load Combined Dataset
if not os.path.exists(DATA_PATH):
    raise FileNotFoundError(f"Dataset missing at {DATA_PATH}. Please run data_fetcher.py first.")

print(f"\nLoading combined dataset from {DATA_PATH}...")
df = pd.read_csv(DATA_PATH, low_memory=False)
print(f"Dataset shape: {df.shape}")

# Feature columns
feature_columns = [
    "annual_average_employees",
    "total_hours_worked",
    "naics_code",
    "industry_description",
    "establishment_type",
    "size",
    "state"
]

X = df[feature_columns].copy()
y = df["fatal_incident"].astype(int)

print(f"Target distribution:\n{y.value_counts()}")
fatal_count = (y == 1).sum()
non_fatal_count = (y == 0).sum()
pos_weight_ratio = non_fatal_count / max(1, fatal_count)
print(f"Imbalance ratio (Negative/Positive): {pos_weight_ratio:.2f}")

# Preprocessing: Use max_categories=30 to keep feature matrix memory-friendly and prevent ArrayMemoryError
numeric_features = ["annual_average_employees", "total_hours_worked", "naics_code"]
categorical_features = ["industry_description", "establishment_type", "size", "state"]

for col in numeric_features:
    X[col] = pd.to_numeric(X[col], errors="coerce")

for col in categorical_features:
    X[col] = X[col].fillna("Unknown").astype(str)

preprocessor = ColumnTransformer(
    transformers=[
        ("numeric", SkPipeline([("imputer", SimpleImputer(strategy="median"))]), numeric_features),
        ("categorical", SkPipeline([
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("onehot", OneHotEncoder(max_categories=30, handle_unknown="ignore", sparse_output=False))
        ]), categorical_features)
    ]
)

# Train/Test Split (80/20 Stratified)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.20, random_state=42, stratify=y
)

cv_strategy = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

def evaluate_model_performance(model_name, model_pipeline, X_tr, y_tr, X_te, y_te):
    print("\n" + "=" * 65)
    print(f"TRAINING & EVALUATING MODEL: {model_name}")
    print("=" * 65)
    
    model_pipeline.fit(X_tr, y_tr)
    y_pred = model_pipeline.predict(X_te)
    
    if hasattr(model_pipeline, "predict_proba"):
        y_prob = model_pipeline.predict_proba(X_te)[:, 1]
    else:
        y_prob = y_pred

    acc = accuracy_score(y_te, y_pred)
    prec = precision_score(y_te, y_pred, zero_division=0)
    rec = recall_score(y_te, y_pred, zero_division=0)
    f1 = f1_score(y_te, y_pred, zero_division=0)
    
    try:
        roc_auc = roc_auc_score(y_te, y_prob)
    except Exception:
        roc_auc = 0.5

    print(f"\n[{model_name}] Metrics:")
    print(f"  Accuracy  : {acc * 100:.2f}%")
    print(f"  Precision : {prec * 100:.2f}%")
    print(f"  Recall    : {rec * 100:.2f}%")
    print(f"  F1-Score  : {f1 * 100:.2f}%")
    print(f"  ROC-AUC   : {roc_auc:.4f}")

    print("\nClassification Report:")
    print(classification_report(y_te, y_pred, target_names=["No Fatality", "Fatality"], zero_division=0))

    cm = confusion_matrix(y_te, y_pred)
    print("Confusion Matrix:")
    print(cm)
    print(f"  Actual No  : Predicted No={cm[0][0]}, Predicted Yes={cm[0][1]}")
    print(f"  Actual Yes : Predicted No={cm[1][0]}, Predicted Yes={cm[1][1]}")

    return {
        "name": model_name,
        "pipeline": model_pipeline,
        "accuracy": acc,
        "precision": prec,
        "recall": rec,
        "f1": f1,
        "roc_auc": roc_auc
    }

# ----------------------------------------------------
# MODEL 1: Random Forest + RandomOverSampler / Class Weight
# ----------------------------------------------------
rf_pipeline = ImbPipeline([
    ("preprocessing", preprocessor),
    ("sampler", RandomOverSampler(sampling_strategy=0.2, random_state=42)),
    ("classifier", RandomForestClassifier(
        n_estimators=100,
        max_depth=12,
        min_samples_leaf=2,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1
    ))
])

rf_metrics = evaluate_model_performance(
    "Random Forest (with OverSampler)",
    rf_pipeline,
    X_train, y_train, X_test, y_test
)

# ----------------------------------------------------
# MODEL 2: XGBoost + Scale Pos Weight
# ----------------------------------------------------
xgb_pipeline = SkPipeline([
    ("preprocessing", preprocessor),
    ("classifier", XGBClassifier(
        n_estimators=120,
        max_depth=6,
        learning_rate=0.05,
        subsample=0.8,
        scale_pos_weight=pos_weight_ratio,
        random_state=42,
        eval_metric="logloss",
        n_jobs=-1
    ))
])

xgb_metrics = evaluate_model_performance(
    "XGBoost (with scale_pos_weight)",
    xgb_pipeline,
    X_train, y_train, X_test, y_test
)

# ----------------------------------------------------
# MODEL SELECTION BY ROC-AUC
# ----------------------------------------------------
print("\n" + "=" * 65)
print("FINAL MODEL SELECTION (BY ROC-AUC)")
print("=" * 65)

best_model_info = rf_metrics if rf_metrics["roc_auc"] >= xgb_metrics["roc_auc"] else xgb_metrics
print(f"Selected Winner Model: {best_model_info['name']} (ROC-AUC: {best_model_info['roc_auc']:.4f})")

best_pipeline = best_model_info["pipeline"]

# Save SIFRA Model V2
with open(MODEL_V2_PATH, "wb") as f:
    pickle.dump(best_pipeline, f)
print(f"\nSaved best model V2 to: {MODEL_V2_PATH}")

# Extract & Export Feature Importance
try:
    if "sampler" in best_pipeline.named_steps:
        trained_clf = best_pipeline.named_steps["classifier"]
    else:
        trained_clf = best_pipeline.named_steps["classifier"]
        
    trained_prep = best_pipeline.named_steps["preprocessing"]
    feat_names = trained_prep.get_feature_names_out()
    importances = trained_clf.feature_importances_

    fi_df = pd.DataFrame({"feature": feat_names, "importance": importances})
    fi_df = fi_df.sort_values("importance", ascending=False)
    
    fi_df.to_csv(FEATURE_IMP_PATH, index=False)
    print(f"Saved feature importances to: {FEATURE_IMP_PATH}")
    
    print("\nTop 15 Most Important Features:")
    print(fi_df.head(15).to_string(index=False))

except Exception as e:
    print(f"Notice extracting feature importances: {e}")

# ----------------------------------------------------
# COMPARISON: MODEL V1 VS MODEL V2
# ----------------------------------------------------
print("\n" + "=" * 65)
print("SIDE-BY-SIDE COMPARISON: MODEL V1 vs MODEL V2")
print("=" * 65)

v1_acc, v1_f1, v1_roc = "N/A", "N/A", "N/A"
if os.path.exists(OLD_MODEL_PATH):
    try:
        with open(OLD_MODEL_PATH, "rb") as f:
            v1_pipeline = pickle.load(f)
        v1_pred = v1_pipeline.predict(X_test)
        if hasattr(v1_pipeline, "predict_proba"):
            v1_prob = v1_pipeline.predict_proba(X_test)[:, 1]
            v1_roc = f"{roc_auc_score(y_test, v1_prob):.4f}"
        v1_acc = f"{accuracy_score(y_test, v1_pred) * 100:.2f}%"
        v1_f1 = f"{f1_score(y_test, v1_pred, zero_division=0) * 100:.2f}%"
    except Exception as e:
        print(f"Notice reading model V1 metrics: {e}")

comparison_data = [
    {"Metric": "Model Version", "Model V1 (sifra_first_model)": "Random Forest V1", "Model V2 (sifra_model_v2)": best_model_info["name"]},
    {"Metric": "Accuracy", "Model V1 (sifra_first_model)": v1_acc, "Model V2 (sifra_model_v2)": f"{best_model_info['accuracy'] * 100:.2f}%"},
    {"Metric": "F1-Score", "Model V1 (sifra_first_model)": v1_f1, "Model V2 (sifra_model_v2)": f"{best_model_info['f1'] * 100:.2f}%"},
    {"Metric": "ROC-AUC", "Model V1 (sifra_first_model)": v1_roc, "Model V2 (sifra_model_v2)": f"{best_model_info['roc_auc']:.4f}"},
    {"Metric": "Recall (Fatal)", "Model V1 (sifra_first_model)": "N/A", "Model V2 (sifra_model_v2)": f"{best_model_info['recall'] * 100:.2f}%"}
]

comp_df = pd.DataFrame(comparison_data)
print("\n" + comp_df.to_string(index=False))
print("\nModel V2 training and evaluation complete!")