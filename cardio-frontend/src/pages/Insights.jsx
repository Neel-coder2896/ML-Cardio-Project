import { useEffect, useState } from "react";
import {
  Activity,
  BrainCircuit,
  CheckCircle2,
  Database,
  Gauge,
  LoaderCircle,
  Server,
  SlidersHorizontal,
} from "lucide-react";

import {
  getHealth,
  getModelInfo,
} from "../services/api";

function Insights() {
  const [modelInfo, setModelInfo] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadModelData();
  }, []);

  const loadModelData = async () => {
    try {
      setLoading(true);
      setError("");

      const [healthData, modelData] = await Promise.all([
        getHealth(),
        getModelInfo(),
      ]);

      setHealth(healthData);
      setModelInfo(modelData);

    } catch (err) {
      console.error(err);

      setError(
        "Unable to load model information. Make sure your FastAPI backend is running."
      );
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <main className="flex min-h-[80vh] items-center justify-center bg-[#f7fafc]">

        <div className="text-center">

          <LoaderCircle
            size={40}
            className="mx-auto animate-spin text-blue-600"
          />

          <p className="mt-4 font-medium text-slate-600">
            Loading model information...
          </p>

        </div>

      </main>
    );
  }


  if (error) {
    return (
      <main className="min-h-screen bg-[#f7fafc] px-6 py-20">

        <div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-red-50 p-8 text-center">

          <Server
            size={40}
            className="mx-auto text-red-600"
          />

          <h1 className="mt-5 text-xl font-bold text-red-900">
            Backend Connection Error
          </h1>

          <p className="mt-3 text-sm leading-6 text-red-700">
            {error}
          </p>

          <button
            onClick={loadModelData}
            className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Try Again
          </button>

        </div>

      </main>
    );
  }


  return (
    <main className="min-h-screen bg-[#f7fafc]">

      {/* ================= HEADER ================= */}

      <section className="border-b border-slate-200 bg-white">

        <div className="mx-auto max-w-7xl px-6 py-16">

          <div className="max-w-3xl">

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">

              <BrainCircuit size={16} />

              Machine Learning Insights

            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
              Understand the Model
            </h1>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              Explore the machine learning model, the features it uses,
              and how cardiovascular risk predictions are generated.
            </p>

          </div>

        </div>

      </section>


      {/* ================= STATUS ================= */}

      <section className="mx-auto max-w-7xl px-6 pt-10">

        <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-5 py-4">

          <CheckCircle2
            size={20}
            className="text-green-600"
          />

          <div>

            <p className="font-semibold text-green-800">
              Model Status:{" "}
              {health?.model_loaded ? "Loaded" : "Not Loaded"}
            </p>

            <p className="text-sm text-green-700">
              FastAPI backend is connected successfully.
            </p>

          </div>

        </div>

      </section>


      {/* ================= MODEL CARDS ================= */}

      <section className="mx-auto max-w-7xl px-6 py-10">

        <div className="grid gap-6 md:grid-cols-3">

          <InfoCard
            icon={<BrainCircuit />}
            title="Model"
            value={modelInfo?.model_type || "Logistic Regression"}
            description="Classification algorithm"
          />

          <InfoCard
            icon={<Database />}
            title="Features"
            value={modelInfo?.features_count || 15}
            description="Input features used"
          />

          <InfoCard
            icon={<SlidersHorizontal />}
            title="Scaler"
            value={modelInfo?.scaler_type || "StandardScaler"}
            description="Feature preprocessing"
          />

        </div>

      </section>


      {/* ================= ML PIPELINE ================= */}

      <section className="mx-auto max-w-7xl px-6 py-10">

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Activity size={22} />
            </div>

            <div>

              <h2 className="text-xl font-bold text-slate-900">
                Prediction Pipeline
              </h2>

              <p className="text-sm text-slate-500">
                How a prediction is generated
              </p>

            </div>

          </div>


          <div className="mt-10 grid gap-4 md:grid-cols-5">

            <PipelineStep
              number="01"
              title="Patient Data"
              description="Health and lifestyle inputs"
            />

            <PipelineStep
              number="02"
              title="Engineering"
              description="BMI, pulse pressure and encoding"
            />

            <PipelineStep
              number="03"
              title="Scaling"
              description="StandardScaler preprocessing"
            />

            <PipelineStep
              number="04"
              title="Logistic Regression"
              description="ML classification"
            />

            <PipelineStep
              number="05"
              title="Risk Result"
              description="Probability and risk level"
            />

          </div>

        </div>

      </section>


      {/* ================= FEATURES ================= */}

      <section className="mx-auto max-w-7xl px-6 py-10">

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 p-8">

            <h2 className="text-2xl font-bold text-slate-900">
              Model Features
            </h2>

            <p className="mt-2 text-slate-500">
              These are the features currently expected by the trained model.
            </p>

          </div>


          <div className="grid gap-3 p-8 sm:grid-cols-2 lg:grid-cols-3">

            {modelInfo?.features_list?.map(
              (feature, index) => (

                <div
                  key={feature}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4"
                >

                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-xs font-bold text-blue-700">
                    {index + 1}
                  </span>

                  <span className="font-medium text-slate-700">
                    {feature}
                  </span>

                </div>

              )
            )}

          </div>

        </div>

      </section>


      {/* ================= COEFFICIENTS ================= */}

      <section className="mx-auto max-w-7xl px-6 py-10">

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 p-8">

            <h2 className="text-2xl font-bold text-slate-900">
              Feature Coefficients
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Logistic Regression coefficients show the direction and
              strength of each feature within the trained model.
            </p>

          </div>


          <div className="divide-y divide-slate-100">

            {modelInfo?.feature_coefficients &&
              Object.entries(
                modelInfo.feature_coefficients
              ).map(([feature, coefficient]) => (

                <CoefficientRow
                  key={feature}
                  feature={feature}
                  coefficient={coefficient}
                />

              ))}

          </div>

        </div>

      </section>


      {/* ================= EXPLANATION ================= */}

      <section className="mx-auto max-w-4xl px-6 py-16">

        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-8">

          <div className="flex gap-4">

            <Gauge
              size={28}
              className="shrink-0 text-blue-600"
            />

            <div>

              <h2 className="text-xl font-bold text-blue-900">
                How to read the coefficients
              </h2>

              <div className="mt-4 space-y-3 text-sm leading-6 text-blue-800">

                <p>
                  <strong>Positive coefficient:</strong> the feature
                  contributes toward a higher predicted probability
                  of cardiovascular disease.
                </p>

                <p>
                  <strong>Negative coefficient:</strong> the feature
                  contributes toward a lower predicted probability
                  within the model.
                </p>

                <p>
                  The coefficient should be interpreted as part of
                  the trained model and not as an individual medical
                  conclusion.
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* DISCLAIMER */}

      <section className="mx-auto max-w-4xl px-6 pb-16 text-center">

        <p className="text-sm leading-6 text-slate-500">
          This application is an educational machine learning project.
          Model predictions should not be used as a medical diagnosis.
        </p>

      </section>

    </main>
  );
}


/* ================= INFO CARD ================= */

function InfoCard({
  icon,
  title,
  value,
  description,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        {icon}
      </div>

      <p className="mt-5 text-sm font-medium text-slate-500">
        {title}
      </p>

      <p className="mt-1 wrap-break-wordcd text-2xl font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-2 text-sm text-slate-500">
        {description}
      </p>

    </div>
  );
}


/* ================= PIPELINE ================= */

function PipelineStep({
  number,
  title,
  description,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">

      <span className="text-xs font-bold text-blue-600">
        {number}
      </span>

      <h3 className="mt-3 font-bold text-slate-900">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-5 text-slate-500">
        {description}
      </p>

    </div>
  );
}


/* ================= COEFFICIENT ================= */

function CoefficientRow({
  feature,
  coefficient,
}) {
  const positive = coefficient >= 0;

  const maxWidth = Math.min(
    Math.abs(coefficient) * 100,
    100
  );

  return (
    <div className="grid gap-3 px-6 py-5 md:grid-cols-[180px_1fr_100px] md:items-center">

      <p className="font-medium text-slate-700">
        {feature}
      </p>

      <div className="h-3 overflow-hidden rounded-full bg-slate-100">

        <div
          className={`h-full rounded-full ${
            positive
              ? "bg-blue-600"
              : "bg-teal-500"
          }`}
          style={{
            width: `${Math.max(maxWidth, 3)}%`,
          }}
        />

      </div>

      <p
        className={`text-right font-bold ${
          positive
            ? "text-blue-600"
            : "text-teal-600"
        }`}
      >
        {coefficient}
      </p>

    </div>
  );
}

export default Insights;