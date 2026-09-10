# ============================================================
# SIFRA-AI - FIRST ML MODEL
# OSHA ITA 2016 DATA
#
# Target:
#   Fatal Incident Indicator
#
# 0 = Establishment reported no deaths
# 1 = Establishment reported one or more deaths
#
# NOTE:
# This is a first tabular ML prototype.
# It is NOT yet the final SIF precursor NLP model.
# ============================================================

import os
import pickle
import warnings

import joblib
import numpy as np
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report,
    roc_auc_score
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder


warnings.filterwarnings("ignore")


# ============================================================
# 1. CONFIGURATION
# ============================================================

DATA_PATH = "output/cleaned_ITA_Data_CY_2016.csv"

MODEL_PATH = "sifra_first_model.pkl"


# ============================================================
# 2. LOAD DATA
# ============================================================

print("\n==============================================")
print("        SIFRA-AI FIRST ML MODEL")
print("==============================================")

print("\nLoading dataset...")

if not os.path.exists(DATA_PATH):
    raise FileNotFoundError(
        f"\nDataset not found:\n{DATA_PATH}\n"
        "Make sure ITA Data CY 2016.csv is inside the Data folder."
    )

df = pd.read_csv(DATA_PATH)

print("Dataset loaded successfully!")

print("\nDataset shape:")
print(df.shape)


# ============================================================
# 3. SHOW COLUMNS
# ============================================================

print("\nAvailable columns:")

for column in df.columns:
    print(" -", column)


# ============================================================
# 4. CREATE TARGET
# ============================================================

# total_deaths is an aggregate establishment-level field.
#
# 0 = no reported deaths
# 1 = one or more reported deaths

if "total_deaths" not in df.columns:
    raise ValueError(
        "Column 'total_deaths' was not found in the dataset."
    )

df["fatal_incident"] = (
    pd.to_numeric(
        df["total_deaths"],
        errors="coerce"
    )
    .fillna(0)
    > 0
).astype(int)


# ============================================================
# 5. CHECK TARGET
# ============================================================

print("\n==============================================")
print("TARGET DISTRIBUTION")
print("==============================================")

target_counts = df["fatal_incident"].value_counts()

print(target_counts)

print("\nTarget percentages:")

print(
    df["fatal_incident"]
    .value_counts(normalize=True)
    .mul(100)
    .round(2)
)


# Make sure there are two classes
if df["fatal_incident"].nunique() < 2:
    raise ValueError(
        "\nERROR: The dataset contains only one target class.\n"
        "The model cannot learn a binary classification problem."
    )


# ============================================================
# 6. SELECT FEATURES
# ============================================================

# These are workplace/establishment characteristics.

feature_columns = [
    "annual_average_employees",
    "total_hours_worked",
    "naics_code",
    "industry_description",
    "establishment_type",
    "size",
    "state"
]


# Check that all features exist

missing_features = [
    column
    for column in feature_columns
    if column not in df.columns
]

if missing_features:

    raise ValueError(
        "\nMissing feature columns:\n"
        + "\n".join(missing_features)
    )


X = df[feature_columns].copy()

y = df["fatal_incident"].copy()


# ============================================================
# 7. CLEAN NUMERIC FEATURES
# ============================================================

numeric_features = [
    "annual_average_employees",
    "total_hours_worked",
    "naics_code"
]


categorical_features = [
    "industry_description",
    "establishment_type",
    "size",
    "state"
]


# Convert numeric columns

for column in numeric_features:

    X[column] = pd.to_numeric(
        X[column],
        errors="coerce"
    )


# Convert categorical columns to string

for column in categorical_features:

    X[column] = X[column].fillna(
        "Unknown"
    ).astype(str)


# ============================================================
# 8. PREPROCESSING
# ============================================================

numeric_pipeline = Pipeline(
    steps=[
        (
            "imputer",
            SimpleImputer(
                strategy="median"
            )
        )
    ]
)


categorical_pipeline = Pipeline(
    steps=[
        (
            "imputer",
            SimpleImputer(
                strategy="most_frequent"
            )
        ),

        (
            "onehot",
            OneHotEncoder(
                handle_unknown="ignore"
            )
        )
    ]
)


preprocessor = ColumnTransformer(

    transformers=[

        (
            "numeric",
            numeric_pipeline,
            numeric_features
        ),

        (
            "categorical",
            categorical_pipeline,
            categorical_features
        )

    ]
)


# ============================================================
# 9. TRAIN / TEST SPLIT
# ============================================================

print("\n==============================================")
print("TRAIN / TEST SPLIT")
print("==============================================")


X_train, X_test, y_train, y_test = train_test_split(

    X,
    y,

    test_size=0.20,

    random_state=42,

    stratify=y
)


print("Training samples:", len(X_train))

print("Testing samples :", len(X_test))


# ============================================================
# 10. RANDOM FOREST MODEL
# ============================================================

model = RandomForestClassifier(

    n_estimators=200,

    max_depth=15,

    min_samples_leaf=2,

    class_weight="balanced",

    random_state=42,

    n_jobs=-1
)


# ============================================================
# 11. COMPLETE PIPELINE
# ============================================================

pipeline = Pipeline(

    steps=[

        (
            "preprocessing",
            preprocessor
        ),

        (
            "model",
            model
        )

    ]

)


# ============================================================
# 12. TRAIN
# ============================================================

print("\n==============================================")
print("TRAINING RANDOM FOREST")
print("==============================================")

print("\nTraining started...")

pipeline.fit(

    X_train,

    y_train

)

print("\nTraining completed!")


# ============================================================
# 13. PREDICTION
# ============================================================

print("\nMaking predictions...")

y_pred = pipeline.predict(

    X_test

)


y_probability = pipeline.predict_proba(

    X_test
)[:, 1]


# ============================================================
# 14. EVALUATION
# ============================================================

accuracy = accuracy_score(

    y_test,

    y_pred

)


precision = precision_score(

    y_test,

    y_pred,

    zero_division=0

)


recall = recall_score(

    y_test,

    y_pred,

    zero_division=0

)


f1 = f1_score(

    y_test,

    y_pred,

    zero_division=0

)


try:

    roc_auc = roc_auc_score(

        y_test,

        y_probability

    )

except ValueError:

    roc_auc = 0.0


print("\n==============================================")
print("MODEL PERFORMANCE")
print("==============================================")


print(
    f"\nAccuracy  : {accuracy * 100:.2f}%"
)

print(
    f"Precision : {precision * 100:.2f}%"
)

print(
    f"Recall    : {recall * 100:.2f}%"
)

print(
    f"F1 Score  : {f1 * 100:.2f}%"
)

print(
    f"ROC-AUC   : {roc_auc:.4f}"
)


# ============================================================
# 15. CLASSIFICATION REPORT
# ============================================================

print("\n==============================================")
print("CLASSIFICATION REPORT")
print("==============================================")

print(

    classification_report(

        y_test,

        y_pred,

        target_names=[
            "No Fatality",
            "Fatality"
        ],

        zero_division=0

    )

)


# ============================================================
# 16. CONFUSION MATRIX
# ============================================================

cm = confusion_matrix(

    y_test,

    y_pred

)


print("\n==============================================")
print("CONFUSION MATRIX")
print("==============================================")

print(cm)


print("\nMeaning:")

print(
    "Rows    = Actual"
)

print(
    "Columns = Predicted"
)

print(
    "\n             Predicted"
)

print(
    "             No     Yes"
)

print(
    f"Actual No   {cm[0][0]:6d} {cm[0][1]:6d}"
)

print(
    f"Actual Yes  {cm[1][0]:6d} {cm[1][1]:6d}"
)


# ============================================================
# 17. FEATURE IMPORTANCE
# ============================================================

print("\n==============================================")
print("FEATURE IMPORTANCE")
print("==============================================")


trained_model = pipeline.named_steps["model"]

trained_preprocessor = (
    pipeline.named_steps["preprocessing"]
)


feature_names = (
    trained_preprocessor
    .get_feature_names_out()
)


importance = trained_model.feature_importances_


feature_importance = pd.DataFrame({

    "feature": feature_names,

    "importance": importance

})


feature_importance = (

    feature_importance

    .sort_values(

        "importance",

        ascending=False

    )

)


print("\nTop 20 important features:\n")

print(

    feature_importance.head(20)
    .to_string(index=False)

)


# ============================================================
# 18. SAVE FEATURE IMPORTANCE
# ============================================================

feature_importance.to_csv(

    "feature_importance.csv",

    index=False

)


# ============================================================
# 19. SAVE MODEL
# ============================================================

with open("sifra_first_model.pkl", "wb") as file:
    pickle.dump(pipeline, file)

print("Trained model saved successfully!")


print("\n==============================================")
print("MODEL SAVED")
print("==============================================")

print(
    f"\nSaved model: {MODEL_PATH}"
)

print(
    "Saved feature importance: feature_importance.csv"
)


# ============================================================
# 20. TEST WITH ONE EXAMPLE
# ============================================================

print("\n==============================================")
print("TEST PREDICTION")
print("==============================================")


example = pd.DataFrame({

    "annual_average_employees": [
        250
    ],

    "total_hours_worked": [
        500000
    ],

    "naics_code": [
        211120
    ],

    "industry_description": [
        "Crude Petroleum Extraction"
    ],

    "establishment_type": [
        "Single-establishment"
    ],

    "size": [
        "Large"
    ],

    "state": [
        "TX"
    ]

})


prediction = pipeline.predict(

    example

)[0]


probability = pipeline.predict_proba(

    example

)[0][1]


if prediction == 1:

    prediction_text = "YES"

else:

    prediction_text = "NO"


print("\nEstablishment Information")
print("--------------------------------")

print(
    "Industry    :",
    example["industry_description"].iloc[0]
)

print(
    "Employees   :",
    example["annual_average_employees"].iloc[0]
)

print(
    "Hours Worked:",
    example["total_hours_worked"].iloc[0]
)

print(
    "State       :",
    example["state"].iloc[0]
)


print("\nMODEL RESULT")
print("--------------------------------")

print(
    "Fatality Indicator :",
    prediction_text
)

print(
    f"Probability        : {probability * 100:.2f}%"
)


print("\n==============================================")
print("SIFRA FIRST MODEL COMPLETED")
print("==============================================")