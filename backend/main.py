import os
import pickle
from pathlib import Path
from typing import List, Optional, Union, Dict, Any
from contextlib import asynccontextmanager

import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator
import uvicorn

# ==============================================================================
# Model Loading & Global State
# ==============================================================================

class ModelHolder:
    model: Any = None
    scaler: Any = None
    feature_names: List[str] = [
        'age', 'gender', 'high_bp', 'low_bp', 'smoke', 'alco', 'active',
        'BMI', 'pulse_pressure', 'chol_1', 'chol_2', 'chol_3', 'gluc_1', 'gluc_2', 'gluc_3'
    ]
    model_path: Optional[Path] = None

state = ModelHolder()

def locate_model_file() -> Path:
    """Find the cardio_model_lr.pkl file in standard locations."""
    env_path = os.getenv("MODEL_PATH")
    if env_path and Path(env_path).exists():
        return Path(env_path)

    current_dir = Path(__file__).resolve().parent
    candidates = [
        current_dir / "cardio_model_lr.pkl",
        current_dir.parent / "cardio_model_lr.pkl",
        Path.cwd() / "cardio_model_lr.pkl",
        Path.cwd() / "backend" / "cardio_model_lr.pkl",
    ]
    for p in candidates:
        if p.exists():
            return p
    raise FileNotFoundError(
        "Could not find 'cardio_model_lr.pkl'. Please place it in the backend folder or project root."
    )

def load_cardio_model():
    """Loads the trained model and standard scaler from the pickle file."""
    model_file = locate_model_file()
    with open(model_file, "rb") as f:
        loaded = pickle.load(f)
        if isinstance(loaded, (tuple, list)) and len(loaded) == 2:
            model, scaler = loaded
        else:
            raise ValueError("Expected pickle file to contain a tuple of (model, scaler).")
    
    state.model = model
    state.scaler = scaler
    state.model_path = model_file
    if hasattr(scaler, "feature_names_in_"):
        state.feature_names = list(scaler.feature_names_in_)
    print(f"[INFO] Model and Scaler successfully loaded from: {model_file}")

def ensure_model_loaded():
    """Ensures model is loaded on demand if not already loaded."""
    if state.model is None or state.scaler is None:
        load_cardio_model()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Load ML model
    try:
        load_cardio_model()
    except Exception as e:
        print(f"[WARNING] Model could not be loaded at startup: {e}")
    yield
    # Shutdown: Clean up if needed

# ==============================================================================
# FastAPI Application Configuration
# ==============================================================================

app = FastAPI(
    title="Cardiovascular Disease Prediction API",
    description=(
        "Production-ready backend API powered by Scikit-Learn Logistic Regression "
        "and StandardScaler to predict cardiovascular disease risk."
    ),
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for all frontends
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================================================================
# Pydantic Request & Response Schemas
# ==============================================================================

class PatientData(BaseModel):
    """Clinical and lifestyle input features for a single patient."""
    age: float = Field(
        ...,
        description="Patient age in years (e.g. 50) or days (e.g. 18250).",
        examples=[50]
    )
    gender: Union[int, str] = Field(
        ...,
        description="Patient gender: 0/1, 1/2, 'female'/'male', 'f'/'m'. (0: Female, 1: Male in model)",
        examples=["female"]
    )
    height: float = Field(
        ...,
        gt=50,
        lt=250,
        description="Height in centimeters (cm).",
        examples=[165.0]
    )
    weight: float = Field(
        ...,
        gt=20,
        lt=300,
        description="Weight in kilograms (kg).",
        examples=[68.0]
    )
    ap_hi: Optional[float] = Field(
        None,
        description="Systolic blood pressure (high_bp).",
        examples=[120.0]
    )
    ap_lo: Optional[float] = Field(
        None,
        description="Diastolic blood pressure (low_bp).",
        examples=[80.0]
    )
    high_bp: Optional[float] = Field(
        None,
        description="Alternative alias for systolic blood pressure.",
        examples=[120.0]
    )
    low_bp: Optional[float] = Field(
        None,
        description="Alternative alias for diastolic blood pressure.",
        examples=[80.0]
    )
    cholesterol: int = Field(
        ...,
        ge=1,
        le=3,
        description="Cholesterol level: 1 = Normal, 2 = Above normal, 3 = Well above normal.",
        examples=[1]
    )
    gluc: Optional[int] = Field(
        None,
        ge=1,
        le=3,
        description="Glucose level: 1 = Normal, 2 = Above normal, 3 = Well above normal.",
        examples=[1]
    )
    glucose: Optional[int] = Field(
        None,
        ge=1,
        le=3,
        description="Alternative alias for glucose level (1, 2, or 3).",
        examples=[1]
    )
    smoke: Union[int, bool] = Field(
        0,
        description="Smoking status (0 = Non-smoker, 1 = Smoker).",
        examples=[0]
    )
    alco: Union[int, bool] = Field(
        0,
        description="Alcohol intake status (0 = No, 1 = Yes).",
        examples=[0]
    )
    active: Union[int, bool] = Field(
        1,
        description="Physical activity (0 = Inactive, 1 = Active).",
        examples=[1]
    )

    @field_validator("gender", mode="before")
    @classmethod
    def parse_gender(cls, v: Any) -> int:
        if isinstance(v, str):
            v_lower = v.strip().lower()
            if v_lower in ("female", "f", "0", "woman"):
                return 0
            elif v_lower in ("male", "m", "1", "man"):
                return 1
            elif v_lower == "2": # Raw dataset encoding 2 = Male
                return 1
        elif isinstance(v, (int, float)):
            val = int(v)
            if val in (0, 1):
                return val
            if val == 2:  # Map raw cardio_train gender: 1->0 (female), 2->1 (male)
                return 1
        return 0

class EngineeredFeaturesInput(BaseModel):
    """Direct input of pre-engineered features."""
    age: float = Field(..., description="Age in years")
    gender: int = Field(..., description="0 = Female, 1 = Male")
    high_bp: float = Field(..., description="Systolic blood pressure")
    low_bp: float = Field(..., description="Diastolic blood pressure")
    smoke: int = Field(..., description="0 or 1")
    alco: int = Field(..., description="0 or 1")
    active: int = Field(..., description="0 or 1")
    BMI: float = Field(..., description="Body Mass Index")
    pulse_pressure: float = Field(..., description="high_bp - low_bp")
    chol_1: int = Field(..., description="Cholesterol 1 dummy")
    chol_2: int = Field(..., description="Cholesterol 2 dummy")
    chol_3: int = Field(..., description="Cholesterol 3 dummy")
    gluc_1: int = Field(..., description="Glucose 1 dummy")
    gluc_2: int = Field(..., description="Glucose 2 dummy")
    gluc_3: int = Field(..., description="Glucose 3 dummy")

class ClinicalMetrics(BaseModel):
    bmi: float
    bmi_category: str
    pulse_pressure: float
    bp_category: str

class PredictionResponse(BaseModel):
    cardio_prediction: int = Field(..., description="0 = Low Risk (Negative), 1 = High Risk (Positive)")
    risk_label: str = Field(..., description="'Low Risk' or 'High Risk'")
    cardio_probability: float = Field(..., description="Probability of cardiovascular disease (0.0 to 1.0)")
    risk_percentage: float = Field(..., description="Probability as percentage (0% to 100%)")
    risk_level: str = Field(..., description="'Low', 'Moderate', or 'High'")
    clinical_metrics: ClinicalMetrics
    insights: List[str]
    input_features_transformed: Dict[str, float]

class BatchPatientData(BaseModel):
    patients: List[PatientData]

class BatchPredictionResponse(BaseModel):
    total_processed: int
    positive_cases: int
    negative_cases: int
    results: List[PredictionResponse]

# ==============================================================================
# Helper Functions: Feature Preprocessing & Clinical Rules
# ==============================================================================

def preprocess_patient(data: PatientData) -> Dict[str, float]:
    """
    Transforms raw clinical inputs into the exact 15 features expected
    by the trained StandardScaler and LogisticRegression model.
    """
    # 1. Age (convert from days to years if necessary)
    age_val = float(data.age)
    if age_val > 120:
        age_val = round(age_val / 365.25)

    # 2. Gender (0 = Female, 1 = Male)
    gender_val = 1 if data.gender == 1 else 0

    # 3. Blood Pressure
    high_bp_val = data.high_bp if data.high_bp is not None else (data.ap_hi if data.ap_hi is not None else 120.0)
    low_bp_val = data.low_bp if data.low_bp is not None else (data.ap_lo if data.ap_lo is not None else 80.0)

    # 4. Lifestyle Binary Flags
    smoke_val = 1 if int(data.smoke) == 1 else 0
    alco_val = 1 if int(data.alco) == 1 else 0
    active_val = 1 if int(data.active) == 1 else 0

    # 5. BMI calculation & clipping (13 to 55)
    height_m = data.height / 100.0
    raw_bmi = data.weight / (height_m ** 2)
    bmi_val = float(np.clip(raw_bmi, 13.0, 55.0))

    # 6. Pulse Pressure (systolic - diastolic)
    pulse_pressure_val = float(high_bp_val - low_bp_val)

    # 7. One-hot encoding for Cholesterol (1, 2, 3)
    chol = int(data.cholesterol)
    chol_1 = 1 if chol == 1 else 0
    chol_2 = 1 if chol == 2 else 0
    chol_3 = 1 if chol == 3 else 0

    # 8. One-hot encoding for Glucose (1, 2, 3)
    gluc = data.glucose if data.glucose is not None else (data.gluc if data.gluc is not None else 1)
    gluc = int(gluc)
    gluc_1 = 1 if gluc == 1 else 0
    gluc_2 = 1 if gluc == 2 else 0
    gluc_3 = 1 if gluc == 3 else 0

    return {
        'age': float(age_val),
        'gender': float(gender_val),
        'high_bp': float(high_bp_val),
        'low_bp': float(low_bp_val),
        'smoke': float(smoke_val),
        'alco': float(alco_val),
        'active': float(active_val),
        'BMI': float(bmi_val),
        'pulse_pressure': float(pulse_pressure_val),
        'chol_1': float(chol_1),
        'chol_2': float(chol_2),
        'chol_3': float(chol_3),
        'gluc_1': float(gluc_1),
        'gluc_2': float(gluc_2),
        'gluc_3': float(gluc_3)
    }

def get_clinical_insights(features: Dict[str, float], proba: float) -> tuple[ClinicalMetrics, List[str]]:
    """Generates health insights and categorizations based on input features."""
    bmi = features['BMI']
    if bmi < 18.5:
        bmi_cat = "Underweight"
    elif bmi < 25.0:
        bmi_cat = "Normal weight"
    elif bmi < 30.0:
        bmi_cat = "Overweight"
    else:
        bmi_cat = "Obese"

    high_bp = features['high_bp']
    low_bp = features['low_bp']
    if high_bp < 120 and low_bp < 80:
        bp_cat = "Normal Blood Pressure"
    elif 120 <= high_bp <= 129 and low_bp < 80:
        bp_cat = "Elevated Blood Pressure"
    elif (130 <= high_bp <= 139) or (80 <= low_bp <= 89):
        bp_cat = "Stage 1 Hypertension"
    else:
        bp_cat = "Stage 2 Hypertension"

    metrics = ClinicalMetrics(
        bmi=round(bmi, 2),
        bmi_category=bmi_cat,
        pulse_pressure=round(features['pulse_pressure'], 2),
        bp_category=bp_cat
    )

    insights = []
    if proba >= 0.6:
        insights.append("High cardiovascular risk indicated. Clinical consultation and preventive screening recommended.")
    elif proba >= 0.4:
        insights.append("Moderate cardiovascular risk. Proactive lifestyle modifications are recommended.")
    else:
        insights.append("Low cardiovascular risk based on current profile. Continue regular healthy habits.")

    if features['high_bp'] >= 130 or features['low_bp'] >= 85:
        insights.append(f"Elevated blood pressure observed ({int(high_bp)}/{int(low_bp)} mmHg). Consider sodium reduction and BP monitoring.")
    if features['BMI'] >= 30:
        insights.append(f"BMI is in the obese category ({round(bmi, 1)}). Weight management can significantly lower cardiac workload.")
    if features['chol_2'] == 1 or features['chol_3'] == 1:
        insights.append("Cholesterol levels are elevated above normal. Dietary adjustments or lipid screening recommended.")
    if features['gluc_2'] == 1 or features['gluc_3'] == 1:
        insights.append("Glucose levels are above normal range. Fasting blood sugar evaluation recommended.")
    if features['smoke'] == 1:
        insights.append("Active smoking is a strong independent risk multiplier for cardiovascular disease.")
    if features['active'] == 0:
        insights.append("Lack of regular physical activity detected. 150 minutes of moderate weekly exercise is beneficial.")

    return metrics, insights

def predict_single_vector(feat_dict: Dict[str, float]) -> PredictionResponse:
    """Performs inference using the loaded scaler and model."""
    if state.model is None or state.scaler is None:
        load_cardio_model()

    df = pd.DataFrame([feat_dict], columns=state.feature_names)
    scaled_array = state.scaler.transform(df)
    
    pred = int(state.model.predict(scaled_array)[0])
    probabilities = state.model.predict_proba(scaled_array)[0]
    prob_disease = float(probabilities[1])

    if prob_disease < 0.40:
        risk_lvl = "Low"
    elif prob_disease <= 0.60:
        risk_lvl = "Moderate"
    else:
        risk_lvl = "High"

    metrics, insights = get_clinical_insights(feat_dict, prob_disease)

    return PredictionResponse(
        cardio_prediction=pred,
        risk_label="High Risk" if pred == 1 else "Low Risk",
        cardio_probability=round(prob_disease, 4),
        risk_percentage=round(prob_disease * 100, 2),
        risk_level=risk_lvl,
        clinical_metrics=metrics,
        insights=insights,
        input_features_transformed=feat_dict
    )

# ==============================================================================
# API Endpoints
# ==============================================================================

@app.get("/", tags=["General"])
def root():
    """API Root index with health overview and quick links."""
    try:
        ensure_model_loaded()
    except Exception:
        pass
    return {
        "service": "Cardiovascular Disease Prediction API",
        "status": "online",
        "docs_url": "/docs",
        "redoc_url": "/redoc",
        "model_loaded": state.model is not None,
        "features_expected": state.feature_names
    }

@app.get("/health", tags=["General"])
def health_check():
    """Health check endpoint to verify backend and model readiness."""
    try:
        ensure_model_loaded()
    except Exception:
        pass
    return {
        "status": "healthy" if state.model is not None else "degraded",
        "model_loaded": state.model is not None,
        "model_path": str(state.model_path) if state.model_path else None
    }

@app.get("/model/info", tags=["Model"])
def get_model_info():
    """Returns metadata and feature coefficients of the trained model."""
    ensure_model_loaded()
    if state.model is None or state.scaler is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model is not currently loaded."
        )

    coef_dict = {}
    if hasattr(state.model, "coef_"):
        coefs = state.model.coef_[0]
        for name, coef in zip(state.feature_names, coefs):
            coef_dict[name] = round(float(coef), 4)

    return {
        "model_type": type(state.model).__name__,
        "hyperparameters": state.model.get_params() if hasattr(state.model, "get_params") else {},
        "features_count": len(state.feature_names),
        "features_list": state.feature_names,
        "feature_coefficients": coef_dict,
        "scaler_type": type(state.scaler).__name__,
        "scaler_means": state.scaler.mean_.tolist() if hasattr(state.scaler, "mean_") else None
    }

@app.post("/predict", response_model=PredictionResponse, tags=["Prediction"])
def predict_cardiovascular_risk(patient: PatientData):
    """
    Predict cardiovascular disease risk for a single patient.
    Accepts raw clinical inputs (height, weight, blood pressure, cholesterol, glucose, lifestyle).
    """
    try:
        features = preprocess_patient(patient)
        return predict_single_vector(features)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Prediction error: {str(e)}"
        )

@app.post("/predict/engineered", response_model=PredictionResponse, tags=["Prediction"])
def predict_engineered_features(data: EngineeredFeaturesInput):
    """Direct prediction using pre-engineered features vector."""
    try:
        feat_dict = data.model_dump()
        return predict_single_vector(feat_dict)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Inference error: {str(e)}"
        )

@app.post("/predict/batch", response_model=BatchPredictionResponse, tags=["Prediction"])
def predict_batch(batch: BatchPatientData):
    """Batch prediction endpoint for multiple patients at once."""
    if not batch.patients:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Patients list cannot be empty."
        )

    results = []
    positive_count = 0
    negative_count = 0

    for patient in batch.patients:
        features = preprocess_patient(patient)
        res = predict_single_vector(features)
        results.append(res)
        if res.cardio_prediction == 1:
            positive_count += 1
        else:
            negative_count += 1

    return BatchPredictionResponse(
        total_processed=len(results),
        positive_cases=positive_count,
        negative_cases=negative_count,
        results=results
    )

# ==============================================================================
# Server Execution Entry Point
# ==============================================================================

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    print(f"Starting server on http://127.0.0.1:{port} (Interactive docs: http://127.0.0.1:{port}/docs)")
    uvicorn.run(app, host="0.0.0.0", port=port)
