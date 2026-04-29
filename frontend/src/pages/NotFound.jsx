import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <div className="text-center">
        <div className="text-6xl font-bold text-brand-600">404</div>
        <h1 className="mt-2 text-xl font-semibold">Page not found</h1>
        <p className="mt-1 text-sm text-slate-500">
          The page you're looking for doesn't exist.
        </p>
        <Link to="/dashboard" className="mt-4 inline-block text-sm font-medium text-brand-600 hover:underline">
          ← Back to dashboard
        </Link>
      </div>
    </div>
  );
}
