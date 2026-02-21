const normalizeUrl = (value) => (value || "").trim().replace(/\/+$/, "");

const localBackendUrl = `http://localhost:${process.env.PORT || 8000}`;
const backendUrl = normalizeUrl(process.env.BACKEND_URL) || localBackendUrl;

const frontendUrl =
  normalizeUrl(process.env.FRONTEND_URL) || "http://localhost:5173";
const dashboardUrl =
  normalizeUrl(process.env.DASHBOARD_URL) || "http://localhost:3000";

const corsAllowedOrigins = Array.from(
  new Set(
    [
      frontendUrl,
      dashboardUrl,
      ...(process.env.CORS_ALLOWED_ORIGINS || "")
        .split(",")
        .map(normalizeUrl)
        .filter(Boolean),
    ].filter(Boolean)
  )
);

const isProduction = (process.env.NODE_ENV || "").toLowerCase() === "production";

module.exports = {
  backendUrl,
  frontendUrl,
  dashboardUrl,
  corsAllowedOrigins,
  isProduction,
};
