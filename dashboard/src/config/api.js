const backendMode = process.env.REACT_APP_BACKEND_MODE || "deployed";

const localBackendUrl =
  process.env.REACT_APP_BACKEND_URL_LOCAL || "http://localhost:8000";

const deployedBackendUrl =
  process.env.REACT_APP_BACKEND_URL_DEPLOYED ||
  "https://stocktrading-app-lp0z.onrender.com";

const selectedBackendUrl =
  backendMode === "local" ? localBackendUrl : deployedBackendUrl;

export const API_BASE_URL = selectedBackendUrl.replace(/\/$/, "");
