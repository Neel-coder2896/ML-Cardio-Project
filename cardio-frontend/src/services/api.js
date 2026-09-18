import axios from "axios";

const api = axios.create({
  baseURL: "https://ml-cardio-project.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
});

export const predictCardiovascularRisk = async (patientData) => {
  const response = await api.post("/predict", patientData);
  return response.data;
};

export const getHealth = async () => {
  const response = await api.get("/health");
  return response.data;
};

export const getModelInfo = async () => {
  const response = await api.get("/model/info");
  return response.data;
};

export default api;