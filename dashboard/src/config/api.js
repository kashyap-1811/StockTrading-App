const appMode =
  process.env.REACT_APP_APP_MODE || process.env.REACT_APP_BACKEND_MODE || "deployed";

const localBackendUrl =
  process.env.REACT_APP_BACKEND_URL_LOCAL || "http://localhost:8000";

const deployedBackendUrl =
  process.env.REACT_APP_BACKEND_URL_DEPLOYED || localBackendUrl;

const localFrontendUrl =
  process.env.REACT_APP_FRONTEND_URL_LOCAL || "http://localhost:5173";

const deployedFrontendUrl =
  process.env.REACT_APP_FRONTEND_URL_DEPLOYED || localFrontendUrl;

const selectedBackendUrl =
  appMode === "local" ? localBackendUrl : deployedBackendUrl;

const selectedFrontendUrl =
  appMode === "local" ? localFrontendUrl : deployedFrontendUrl;

export const API_BASE_URL = selectedBackendUrl.replace(/\/$/, "");
export const FRONTEND_URL = selectedFrontendUrl.replace(/\/$/, "");
