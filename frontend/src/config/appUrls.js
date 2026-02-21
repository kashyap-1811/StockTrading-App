const normalizeUrl = (value) => (value || "").trim().replace(/\/+$/, "");

const appMode =
  import.meta.env.VITE_APP_MODE || import.meta.env.VITE_BACKEND_MODE || "deployed";

const backendLocalUrl =
  import.meta.env.VITE_BACKEND_URL_LOCAL || "http://localhost:8000";
const backendDeployedUrl =
  import.meta.env.VITE_BACKEND_URL_DEPLOYED || backendLocalUrl;

const dashboardLocalUrl =
  import.meta.env.VITE_DASHBOARD_URL_LOCAL || "http://localhost:3000";
const dashboardDeployedUrl =
  import.meta.env.VITE_DASHBOARD_URL_DEPLOYED || dashboardLocalUrl;

const frontendLocalUrl =
  import.meta.env.VITE_FRONTEND_URL_LOCAL || "http://localhost:5173";
const frontendDeployedUrl =
  import.meta.env.VITE_FRONTEND_URL_DEPLOYED || frontendLocalUrl;

const pickByMode = (localUrl, deployedUrl) =>
  appMode === "local" ? localUrl : deployedUrl;

export const API_BASE_URL = normalizeUrl(
  pickByMode(backendLocalUrl, backendDeployedUrl)
);
export const DASHBOARD_URL = normalizeUrl(
  pickByMode(dashboardLocalUrl, dashboardDeployedUrl)
);
export const FRONTEND_URL = normalizeUrl(
  pickByMode(frontendLocalUrl, frontendDeployedUrl)
);
