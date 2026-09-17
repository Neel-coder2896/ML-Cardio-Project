function ResultCard({ result }) {
  if (!result) {
    return null;
  }

  const riskColor =
    result.risk_level === "High"
      ? "text-red-600 bg-red-50 border-red-200"
      : result.risk_level === "Moderate"
      ? "text-amber-600 bg-amber-50 border-amber-200"
      : "text-green-600 bg-green-50 border-green-200";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">

      <div className="text-center">

        <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
          Cardiovascular Risk
        </p>

        <p className="mt-3 text-5xl font-extrabold text-slate-900">
          {result.risk_percentage}%
        </p>

        <div
          className={`mx-auto mt-4 w-fit rounded-full border px-5 py-2 text-sm font-bold ${riskColor}`}
        >
          {result.risk_label}
        </div>

      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">

        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Risk Level</p>
          <p className="mt-1 font-bold text-slate-900">
            {result.risk_level}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-sm text-slate-500">BMI</p>
          <p className="mt-1 font-bold text-slate-900">
            {result.clinical_metrics.bmi}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Blood Pressure</p>
          <p className="mt-1 font-bold text-slate-900">
            {result.clinical_metrics.bp_category}
          </p>
        </div>

      </div>

      {result.insights?.length > 0 && (
        <div className="mt-8">

          <h3 className="text-lg font-bold text-slate-900">
            Health Insights
          </h3>

          <div className="mt-4 space-y-3">

            {result.insights.map((insight, index) => (
              <div
                key={index}
                className="rounded-xl bg-blue-50 p-4 text-sm leading-6 text-slate-700"
              >
                {insight}
              </div>
            ))}

          </div>

        </div>
      )}

    </div>
  );
}

export default ResultCard;