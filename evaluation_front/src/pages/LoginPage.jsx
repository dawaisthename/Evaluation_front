import { useMemo, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import "../css/auth.css";

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = useMemo(
    () => location.state?.from ?? "/dashboard",
    [location.state],
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ If already logged in → go back
  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const session = await login({ email, password });
      const user = session.user; // ✅ FIX

      let redirectPath = redirectTo; // default: go where user came from

      // ✅ Role-based redirect
      if (user?.is_admin) {
        redirectPath = "/admin-dashboard";
      } else if (user?.is_manager) {
        redirectPath = "/manager-dashboard";
      } else {
        redirectPath = "/employee-dashboard";
      }

      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.detail || "Login failed. Check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="authShell">
      <div className="authCard">
        <div className="authTitle">Sign in</div>
        <div className="authSub">
          Enter your credentials to access the evaluation portal.
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div
              className="errorBanner"
              style={{ color: "red", marginBottom: "1rem" }}
            >
              {error}
            </div>
          )}

          <label className="field">
            <div className="fieldLabel">Email</div>
            <input
              className="input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
            />
          </label>

          <label className="field" style={{ marginTop: "1rem" }}>
            <div className="fieldLabel">Password</div>
            <input
              className="input"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </label>

          <button
            type="submit"
            className="btn btnPrimary"
            style={{ marginTop: "1.5rem", width: "100%" }}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Continue"}
          </button>
        </form>

        <div className="divider" />

        {/* Dev helper */}
        <div className="quickRow">
          <button
            className="btn btnGhost"
            onClick={() => {
              setEmail("hr@demo.com");
              setPassword("password123");
            }}
          >
            Demo HR
          </button>
        </div>
      </div>
    </div>
  );
}
