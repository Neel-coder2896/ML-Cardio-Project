import { Link, NavLink } from "react-router-dom";
import { HeartPulse } from "lucide-react";

function Navbar() {
  const navClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${
      isActive
        ? "text-blue-600"
        : "text-slate-600 hover:text-blue-600"
    }`;

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-200">
            <HeartPulse size={22} />
          </div>

          <div>
            <h1 className="text-lg font-bold text-slate-900">
              Cardio<span className="text-blue-600">Predict</span>
            </h1>

            <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500">
              AI Health Intelligence
            </p>
          </div>

        </Link>

        {/* Navigation */}
        <div className="hidden items-center gap-8 md:flex">

          <NavLink to="/" className={navClass}>
            Home
          </NavLink>

          <NavLink to="/predict" className={navClass}>
            Predict
          </NavLink>

          <NavLink to="/insights" className={navClass}>
            Insights
          </NavLink>

        </div>

        {/* Button */}
        <Link
          to="/predict"
          className="hidden rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 md:block"
        >
          Start Prediction
        </Link>

      </div>
    </nav>
  );
}

export default Navbar;