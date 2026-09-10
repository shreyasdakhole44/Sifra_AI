import pickle

MODEL_PATH = "sifra_first_model.pkl"

with open(MODEL_PATH, "rb") as file:
    loaded_object = pickle.load(file)

print("=" * 50)
print("SIFRA MODEL CHECK")
print("=" * 50)

print("\nObject Type:")
print(type(loaded_object))

print("\nObject Content:")
print(loaded_object)

print("\nHas predict method?")
print(hasattr(loaded_object, "predict"))

print("\nHas predict_proba method?")
print(hasattr(loaded_object, "predict_proba"))