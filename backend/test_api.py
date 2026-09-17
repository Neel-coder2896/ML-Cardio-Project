"""
Comprehensive test script for the Cardiovascular Prediction FastAPI Backend.
"""
import sys
from fastapi.testclient import TestClient
from main import app

def run_tests():
    print("=" * 60)
    print(" RUNNING BACKEND API VALIDATION TESTS")
    print("=" * 60)

    client = TestClient(app)

    # Test 1: Root endpoint
    res_root = client.get("/")
    assert res_root.status_code == 200, f"Expected 200, got {res_root.status_code}"
    root_data = res_root.json()
    print(f"[PASS] GET / -> status: {res_root.status_code}, service: '{root_data.get('service')}'")

    # Test 2: Health check
    res_health = client.get("/health")
    assert res_health.status_code == 200, f"Expected 200, got {res_health.status_code}"
    health_data = res_health.json()
    assert health_data["status"] == "healthy", "Expected status to be healthy"
    assert health_data["model_loaded"] is True, "Expected model_loaded to be True"
    print(f"[PASS] GET /health -> status: '{health_data['status']}', model_loaded: {health_data['model_loaded']}")

    # Test 3: Model info endpoint
    res_info = client.get("/model/info")
    assert res_info.status_code == 200, f"Expected 200, got {res_info.status_code}"
    info_data = res_info.json()
    assert info_data["model_type"] == "LogisticRegression"
    print(f"[PASS] GET /model/info -> model_type: '{info_data['model_type']}', features: {info_data['features_count']}")

    # Test 4: Single Patient Prediction (Normal / Low Risk)
    normal_patient = {
        "age": 45,
        "gender": "female",
        "height": 165.0,
        "weight": 60.0,
        "ap_hi": 115.0,
        "ap_lo": 75.0,
        "cholesterol": 1,
        "gluc": 1,
        "smoke": 0,
        "alco": 0,
        "active": 1
    }
    res_pred1 = client.post("/predict", json=normal_patient)
    assert res_pred1.status_code == 200, f"Expected 200, got {res_pred1.status_code}: {res_pred1.text}"
    pred1_data = res_pred1.json()
    print(f"[PASS] POST /predict (Normal patient) -> Risk: {pred1_data['risk_label']}, Probability: {pred1_data['risk_percentage']}%, Level: {pred1_data['risk_level']}")
    print(f"       Metrics: BMI={pred1_data['clinical_metrics']['bmi']} ({pred1_data['clinical_metrics']['bmi_category']}), BP Category='{pred1_data['clinical_metrics']['bp_category']}'")

    # Test 5: Single Patient Prediction (High Risk profile)
    high_risk_patient = {
        "age": 62,
        "gender": "male",
        "height": 170.0,
        "weight": 95.0,
        "ap_hi": 160.0,
        "ap_lo": 100.0,
        "cholesterol": 3,
        "glucose": 3,
        "smoke": 1,
        "alco": 1,
        "active": 0
    }
    res_pred2 = client.post("/predict", json=high_risk_patient)
    assert res_pred2.status_code == 200, f"Expected 200, got {res_pred2.status_code}: {res_pred2.text}"
    pred2_data = res_pred2.json()
    print(f"[PASS] POST /predict (High risk patient) -> Risk: {pred2_data['risk_label']}, Probability: {pred2_data['risk_percentage']}%, Level: {pred2_data['risk_level']}")
    print(f"       Insights count: {len(pred2_data['insights'])}")

    # Test 6: Batch Prediction
    batch_payload = {
        "patients": [normal_patient, high_risk_patient]
    }
    res_batch = client.post("/predict/batch", json=batch_payload)
    assert res_batch.status_code == 200, f"Expected 200, got {res_batch.status_code}: {res_batch.text}"
    batch_data = res_batch.json()
    assert batch_data["total_processed"] == 2
    print(f"[PASS] POST /predict/batch -> Processed: {batch_data['total_processed']}, Positives: {batch_data['positive_cases']}, Negatives: {batch_data['negative_cases']}")

    # Test 7: Direct pre-engineered feature vector
    engineered_sample = {
        "age": 53.0,
        "gender": 0,
        "high_bp": 130.0,
        "low_bp": 85.0,
        "smoke": 0,
        "alco": 0,
        "active": 1,
        "BMI": 27.5,
        "pulse_pressure": 45.0,
        "chol_1": 0,
        "chol_2": 1,
        "chol_3": 0,
        "gluc_1": 1,
        "gluc_2": 0,
        "gluc_3": 0
    }
    res_eng = client.post("/predict/engineered", json=engineered_sample)
    assert res_eng.status_code == 200, f"Expected 200, got {res_eng.status_code}: {res_eng.text}"
    eng_data = res_eng.json()
    print(f"[PASS] POST /predict/engineered -> Risk: {eng_data['risk_label']}, Probability: {eng_data['risk_percentage']}%")

    print("=" * 60)
    print(" ALL BACKEND API TESTS COMPLETED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
