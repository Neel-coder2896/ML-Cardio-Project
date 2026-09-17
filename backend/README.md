# Cardiovascular Disease Prediction - Backend API

Production-ready FastAPI backend for serving the Cardiovascular Disease Prediction machine learning model (`cardio_model_lr.pkl`).

---

## 📁 Directory Structure

```
ML_NEW/
├── backend/
│   ├── main.py            # Main FastAPI application and API routes
│   ├── test_api.py        # End-to-end integration and endpoint test suite
│   ├── requirements.txt   # Backend Python package requirements
│   └── README.md          # Backend documentation
└── cardio_model_lr.pkl    # Trained Logistic Regression model & StandardScaler tuple
```

---

## 🚀 How to Run the Backend

### Option 1: Direct Python Execution
```bash
python backend/main.py
```

### Option 2: Using Uvicorn (with hot-reload)
```bash
uvicorn backend.main:app --reload --port 8000
```

Once started, open your browser:
- **Interactive Swagger Documentation**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Alternative ReDoc UI**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
- **Health Check**: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

---

## 🧪 Running the Tests

To run the built-in test suite:
```bash
python backend/test_api.py
```

---

## 📡 Key API Endpoints

### 1. `POST /predict` - Single Patient Prediction
Accepts clinical and lifestyle features, automatically computes derived features (BMI, pulse pressure, cholesterol/glucose one-hot dummies), scales them, and returns predictions with clinical insights.

#### Sample Request:
```json
{
  "age": 52,
  "gender": "female",
  "height": 165.0,
  "weight": 78.0,
  "ap_hi": 135.0,
  "ap_lo": 85.0,
  "cholesterol": 2,
  "gluc": 1,
  "smoke": 0,
  "alco": 0,
  "active": 1
}
```

#### Sample Response:
```json
{
  "cardio_prediction": 1,
  "risk_label": "High Risk",
  "cardio_probability": 0.6384,
  "risk_percentage": 63.84,
  "risk_level": "High",
  "clinical_metrics": {
    "bmi": 28.65,
    "bmi_category": "Overweight",
    "pulse_pressure": 50.0,
    "bp_category": "Stage 1 Hypertension"
  },
  "insights": [
    "High cardiovascular risk indicated. Clinical consultation and preventive screening recommended.",
    "Elevated blood pressure observed (135/85 mmHg). Consider sodium reduction and BP monitoring.",
    "Cholesterol levels are elevated above normal. Dietary adjustments or lipid screening recommended."
  ],
  "input_features_transformed": {
    "age": 52.0,
    "gender": 0.0,
    "high_bp": 135.0,
    "low_bp": 85.0,
    "smoke": 0.0,
    "alco": 0.0,
    "active": 1.0,
    "BMI": 28.65,
    "pulse_pressure": 50.0,
    "chol_1": 0.0,
    "chol_2": 1.0,
    "chol_3": 0.0,
    "gluc_1": 1.0,
    "gluc_2": 0.0,
    "gluc_3": 0.0
  }
}
```

---

### 2. `POST /predict/batch` - Batch Patient Prediction
Accepts an array of patient records for multi-patient screening in a single API call.

---

### 3. `GET /model/info` - Model Metadata
Returns the model type (`LogisticRegression`), hyperparameter configuration, feature coefficients, and scaler parameters.
