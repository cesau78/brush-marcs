import qs from "qs";
const axios = require("axios").default;
export const lsRefreshTokenKey = "auth0-refresh-token";
const {
  REACT_APP_AUTH0_CLIENT_ID,
  REACT_APP_AUTH0_REDIRECT,
  REACT_APP_AUTH0_DOMAIN,
  REACT_APP_API_BASE,
} = process.env;

const authorizationURL = new URL("/authorization", REACT_APP_API_BASE).href;

//returns refresh token - good for 30 days
export const getRefreshToken = () => {
  const lastToken = localStorage.getItem(lsRefreshTokenKey);
  if (lastToken) {
    //expired?
    return Promise.resolve(lastToken);
  }

  const payload = {
    response_type: "token",
    //access_type: "offline",
    client_id: REACT_APP_AUTH0_CLIENT_ID,
    redirect_uri: REACT_APP_AUTH0_REDIRECT,
    scope: "openid profile", //offline_access provides refresh_token to callback
    state: "not-in-use",
    audience: REACT_APP_API_BASE,
  };
  const redirectLocation = new URL(
    "/authorize",
    `https://${REACT_APP_AUTH0_DOMAIN}`
  );
  Object.entries(payload).forEach(([key, value]) => {
    redirectLocation.searchParams.set(key, value);
  });
  window.location = redirectLocation.href;
  return Promise.reject();
};

//returns access token - good for 30 minutes
export const getAccessToken = (refreshToken) => {
  const body = {
    code: refreshToken,
  };
  const stringifiedPayload = qs.stringify(body);
  return axios.post(authorizationURL, stringifiedPayload);
};

const exports = { getAccessToken, getRefreshToken };
export default exports;
