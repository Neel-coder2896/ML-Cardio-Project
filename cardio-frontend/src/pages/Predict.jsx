import { useState } from "react";
import {
  Activity,
  ArrowRight,
  HeartPulse,
  LoaderCircle,
  RotateCcw,
  Scale,
  UserRound,
} from "lucide-react";

import InputField from "../components/InputField";
import ResultCard from "../components/ResultCard";
import { predictCardiovascularRisk } from "../services/api";

function Predict() {
  const initialForm = {
    age: "",
    gender: "",
    height: "",
    weight: "",
    ap_hi: "",
    ap_lo: "",
    cholesterol: "",
    gluc: "",
    smoke: "0",
    alco: "0",
    active: "1",
  };

  const [formData, setFormData] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setResult(null);

    // Basic validation
    if (
      !formData.age ||
      !formData.gender ||
      !formData.height ||
      !formData.weight ||
      !formData.ap_hi ||
      !formData.ap_lo ||
      !formData.cholesterol ||
      !formData.gluc
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    const patientData = {
      age: Number(formData.age),
      gender: Number(formData.gender),
      height: Number(formData.height),
      weight: Number(formData.weight),
      ap_hi: Number(formData.ap_hi),
      ap_lo: Number(formData.ap_lo),
      cholesterol: Number(formData.cholesterol),
      gluc: Number(formData.gluc),
      smoke: Number(formData.smoke),
      alco: Number(formData.alco),
      active: Number(formData.active),
    };

    try {
      setLoading(true);

      const prediction = await predictCardiovascularRisk(patientData);

      setResult(prediction);

      // Scroll to result
      setTimeout(() => {
        document
          .getElementById("prediction-result")
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      }, 100);
    } catch (err) {
      console.error(err);

      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError(
          "Unable to connect to the prediction server. Make sure your FastAPI backend is running."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData(initialForm);
    setResult(null);
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <main className="min-h-screen bg-[#f7fafc]">

      {/* ================= HEADER ================= */}

      <section className="border-b border-slate-200 bg-white">

        <div className="mx-auto max-w-7xl px-6 py-14">

          <div className="max-w-3xl">

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
              <HeartPulse size={16} />
              Cardiovascular Risk Assessment
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
              Predict Your Cardiovascular Risk
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Enter your health and lifestyle information. Our
              Logistic Regression model will analyze the information
              and estimate your cardiovascular disease risk.
            </p>

          </div>

        </div>

      </section>


      {/* ================= FORM ================= */}

      <section className="mx-auto max-w-5xl px-6 py-12">

        <form onSubmit={handleSubmit}>

          {/* PERSONAL INFORMATION */}

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-200 px-6 py-5">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <UserRound size={20} />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    Personal Information
                  </h2>

                  <p className="text-sm text-slate-500">
                    Basic physical information
                  </p>
                </div>

              </div>

            </div>


            <div className="grid gap-6 p-6 md:grid-cols-2">

              <InputField
                label="Age"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleChange}
                placeholder="e.g. 50"
                min="1"
                max="120"
              />


              <SelectField
                label="Gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                options={[
                  { value: "0", label: "Female" },
                  { value: "1", label: "Male" },
                ]}
                placeholder="Select gender"
              />


              <InputField
                label="Height (cm)"
                name="height"
                type="number"
                value={formData.height}
                onChange={handleChange}
                placeholder="e.g. 170"
                min="50"
                max="250"
              />


              <InputField
                label="Weight (kg)"
                name="weight"
                type="number"
                value={formData.weight}
                onChange={handleChange}
                placeholder="e.g. 70"
                min="20"
                max="300"
                step="0.1"
              />

            </div>

          </div>


          {/* BLOOD PRESSURE */}

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-200 px-6 py-5">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                  <Activity size={20} />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    Blood Pressure
                  </h2>

                  <p className="text-sm text-slate-500">
                    Enter your blood pressure measurements
                  </p>
                </div>

              </div>

            </div>


            <div className="grid gap-6 p-6 md:grid-cols-2">

              <InputField
                label="Systolic Blood Pressure"
                name="ap_hi"
                type="number"
                value={formData.ap_hi}
                onChange={handleChange}
                placeholder="e.g. 120"
                min="50"
                max="250"
              />

              <InputField
                label="Diastolic Blood Pressure"
                name="ap_lo"
                type="number"
                value={formData.ap_lo}
                onChange={handleChange}
                placeholder="e.g. 80"
                min="30"
                max="200"
              />

            </div>

          </div>


          {/* HEALTH INFORMATION */}

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-200 px-6 py-5">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Scale size={20} />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    Health Information
                  </h2>

                  <p className="text-sm text-slate-500">
                    Clinical measurements
                  </p>
                </div>

              </div>

            </div>


            <div className="grid gap-6 p-6 md:grid-cols-2">

              <SelectField
                label="Cholesterol Level"
                name="cholesterol"
                value={formData.cholesterol}
                onChange={handleChange}
                options={[
                  {
                    value: "1",
                    label: "Normal",
                  },
                  {
                    value: "2",
                    label: "Above Normal",
                  },
                  {
                    value: "3",
                    label: "Well Above Normal",
                  },
                ]}
                placeholder="Select cholesterol level"
              />


              <SelectField
                label="Glucose Level"
                name="gluc"
                value={formData.gluc}
                onChange={handleChange}
                options={[
                  {
                    value: "1",
                    label: "Normal",
                  },
                  {
                    value: "2",
                    label: "Above Normal",
                  },
                  {
                    value: "3",
                    label: "Well Above Normal",
                  },
                ]}
                placeholder="Select glucose level"
              />

            </div>

          </div>


          {/* LIFESTYLE */}

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-200 px-6 py-5">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
                  <HeartPulse size={20} />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    Lifestyle
                  </h2>

                  <p className="text-sm text-slate-500">
                    Your daily habits and activities
                  </p>
                </div>

              </div>

            </div>


            <div className="grid gap-6 p-6 md:grid-cols-3">

              <SelectField
                label="Do you smoke?"
                name="smoke"
                value={formData.smoke}
                onChange={handleChange}
                options={[
                  {
                    value: "0",
                    label: "No",
                  },
                  {
                    value: "1",
                    label: "Yes",
                  },
                ]}
              />


              <SelectField
                label="Alcohol Consumption"
                name="alco"
                value={formData.alco}
                onChange={handleChange}
                options={[
                  {
                    value: "0",
                    label: "No",
                  },
                  {
                    value: "1",
                    label: "Yes",
                  },
                ]}
              />


              <SelectField
                label="Physical Activity"
                name="active"
                value={formData.active}
                onChange={handleChange}
                options={[
                  {
                    value: "1",
                    label: "Active",
                  },
                  {
                    value: "0",
                    label: "Inactive",
                  },
                ]}
              />

            </div>

          </div>


          {/* ERROR */}

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
              {error}
            </div>
          )}


          {/* BUTTONS */}

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              <RotateCcw size={18} />
              Reset
            </button>


            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {loading ? (
                <>
                  <LoaderCircle
                    size={19}
                    className="animate-spin"
                  />

                  Analyzing...
                </>
              ) : (
                <>
                  Predict My Risk
                  <ArrowRight size={19} />
                </>
              )}

            </button>

          </div>

        </form>


        {/* ================= RESULT ================= */}

        {result && (
          <div
            id="prediction-result"
            className="mt-12 scroll-mt-24"
          >

            <ResultCard result={result} />

          </div>
        )}

      </section>


      {/* DISCLAIMER */}

      <section className="mx-auto max-w-4xl px-6 pb-16">

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">

          <p className="text-sm leading-6 text-amber-800">
            This prediction is intended for educational and research
            purposes only. It is not a medical diagnosis and should
            not replace professional medical advice.
          </p>

        </div>

      </section>

    </main>
  );
}


/* ================= SELECT COMPONENT ================= */

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  placeholder,
}) {
  return (
    <div className="flex flex-col gap-2">

      <label
        htmlFor={name}
        className="text-sm font-semibold text-slate-700"
      >
        {label}
      </label>

      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      >

        {placeholder && (
          <option value="">
            {placeholder}
          </option>
        )}

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}

      </select>

    </div>
  );
}

export default Predict;