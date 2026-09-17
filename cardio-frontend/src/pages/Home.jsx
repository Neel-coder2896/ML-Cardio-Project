import { Link } from "react-router-dom";

import {
  ArrowRight,
  BrainCircuit,
  ChartNoAxesCombined,
  HeartPulse,
  ShieldCheck,
} from "lucide-react";

import StatCard from "../components/StatCard";
import FeatureCard from "../components/FeatureCard";

function Home() {
  return (
    <main>

      {/* ================= HERO ================= */}

      <section className="relative overflow-hidden bg-[#f7fafc]">

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">

          {/* Hero Text */}

          <div>

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">

              <HeartPulse size={16} />

              AI-Powered Cardiovascular Analysis

            </div>

            <h1 className="max-w-3xl text-5xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-6xl">

              Understand Your Heart.

              <span className="block text-blue-600">
                Predict Your Risk.
              </span>

            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Analyze cardiovascular health factors using a
              Machine Learning model built with Logistic Regression.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">

              <Link
                to="/predict"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
              >
                Start Prediction

                <ArrowRight size={18} />

              </Link>

              <Link
                to="/insights"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-600"
              >
                Explore Model
              </Link>

            </div>

          </div>

          {/* Hero Visual */}

          <div className="relative flex justify-center">

            <div className="absolute h-72 w-72 rounded-full bg-blue-100 blur-3xl" />

            <div className="relative flex h-80 w-80 items-center justify-center rounded-[40px] border border-blue-100 bg-white shadow-2xl shadow-blue-100">

              <div className="flex h-40 w-40 items-center justify-center rounded-full bg-blue-50">

                <HeartPulse
                  size={100}
                  strokeWidth={1.5}
                  className="text-blue-600"
                />

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ================= STATS ================= */}

      <section className="border-y border-slate-200 bg-white">

        <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-slate-200 px-6 sm:grid-cols-3 sm:divide-x sm:divide-y-0">

          <StatCard
            value="70K+"
            label="Dataset Records"
          />

          <StatCard
            value="71.5%"
            label="Model Accuracy"
          />

          <StatCard
            value="15"
            label="ML Features"
          />

        </div>

      </section>


      {/* ================= FEATURES ================= */}

      <section className="mx-auto max-w-7xl px-6 py-20">

        <div className="mx-auto max-w-2xl text-center">

          <p className="font-semibold text-blue-600">
            WHY CARDIOPREDICT
          </p>

          <h2 className="mt-3 text-3xl font-bold text-slate-900 md:text-4xl">
            Data-driven cardiovascular analysis
          </h2>

          <p className="mt-4 text-slate-600">
            Explore health factors and receive a machine-learning-based
            cardiovascular risk prediction.
          </p>

        </div>


        <div className="mt-12 grid gap-6 md:grid-cols-3">

          <FeatureCard
            icon={<BrainCircuit size={24} />}
            title="Machine Learning"
            description="Uses Logistic Regression to analyze cardiovascular health factors."
          />

          <FeatureCard
            icon={<ChartNoAxesCombined size={24} />}
            title="Data Driven"
            description="Built using thousands of cardiovascular health records."
          />

          <FeatureCard
            icon={<ShieldCheck size={24} />}
            title="Clear Insights"
            description="Understand the prediction through health metrics and model insights."
          />

        </div>

      </section>


      {/* ================= HOW IT WORKS ================= */}

      <section className="bg-slate-900 px-6 py-20 text-white">

        <div className="mx-auto max-w-7xl">

          <div className="max-w-2xl">

            <p className="font-semibold text-blue-400">
              HOW IT WORKS
            </p>

            <h2 className="mt-3 text-3xl font-bold md:text-4xl">
              From health data to prediction
            </h2>

          </div>


          <div className="mt-12 grid gap-6 md:grid-cols-4">

            <Step
              number="01"
              title="Enter Health Data"
            />

            <Step
              number="02"
              title="Feature Engineering"
            />

            <Step
              number="03"
              title="ML Prediction"
            />

            <Step
              number="04"
              title="Risk Insights"
            />

          </div>

        </div>

      </section>


      {/* ================= DISCLAIMER ================= */}

      <section className="mx-auto max-w-4xl px-6 py-16 text-center">

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">

          <h3 className="font-bold text-amber-900">
            Educational Disclaimer
          </h3>

          <p className="mt-2 text-sm leading-6 text-amber-800">
            This application is designed for educational and research
            purposes. The prediction is generated by a machine learning
            model and should not be considered a medical diagnosis.
          </p>

        </div>

      </section>

    </main>
  );
}


function Step({ number, title }) {

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-800 p-6">

      <p className="text-sm font-bold text-blue-400">
        {number}
      </p>

      <h3 className="mt-4 text-lg font-semibold">
        {title}
      </h3>

    </div>
  );

}


export default Home;