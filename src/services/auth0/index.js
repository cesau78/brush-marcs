import { jwtVerify } from "jose";
import getJwks from "./jwks";
import { pages } from "../../common";

export const lsAccessTokenKey = "auth0-access-token";

const {
  REACT_APP_AUTH0_CLIENT_ID,
  REACT_APP_AUTH0_DOMAIN,
  REACT_APP_API_BASE,
} = process.env;

export const permissions = {
  configRead: "read:config",
  configWrite: "write:config",
};

const authorizationURL = new URL(
  "/authorize?",
  `https://${REACT_APP_AUTH0_DOMAIN}/`
);
const logoutURL = new URL(
  `/v2/logout?client_id=${REACT_APP_AUTH0_CLIENT_ID}&returnTo=${window.location.origin}`,
  `https://${REACT_APP_AUTH0_DOMAIN}/`
);

const callbackURL = new URL(
  pages.auth0callback.location,
  window.location.origin
);

const authorizationURLParams = {
  response_type: "token",
  client_id: REACT_APP_AUTH0_CLIENT_ID,
  redirect_uri: callbackURL.href,
  scope: "openid profile",
  //state: //set at execution time
  audience: REACT_APP_API_BASE,
};
Object.entries(authorizationURLParams).forEach(([key, value]) => {
  authorizationURL.searchParams.set(key, value);
});

export const signInToAuth0 = (
  returnToAfterCallback = window.location.pathname,
  startWithRegistration = false
) => {
  authorizationURL.searchParams.set("state", returnToAfterCallback);
  if (startWithRegistration) {
    authorizationURL.searchParams.set("screen_hint", "signup");
  }
  window.location = authorizationURL.href;
};
export const signOut = () => {
  localStorage.removeItem(lsAccessTokenKey);
  window.location = logoutURL.href;
};

//returns access token - good for 2 hours
export const getAccessToken = (redirectOnError = true) => {
  const lastToken = localStorage.getItem(lsAccessTokenKey);
  if (lastToken) {
    return verifyAccessToken(lastToken)
      .then((decoded) => {
        return { accessToken: lastToken, decoded };
      })
      .catch((err) => {
        redirectOnError && signInToAuth0();
        console.error(err);
        throw new Error("Invalid Access Token");
      });
  }
  //no previous token set
  redirectOnError && signInToAuth0();
  return Promise.reject("No Access Token Set");
};
export const setAccessToken = (accessToken) => {
  return verifyAccessToken(accessToken)
    .then((decoded) => {
      //only set token if valid
      localStorage.setItem(lsAccessTokenKey, accessToken);
      return { accessToken, decoded };
    })
    .catch((err) => {
      console.error(err);
      throw new Error("Invalid Access Token");
    });
};

const verifyAccessToken = (accessToken) => {
  const jwks = getJwks();

  const options = {
    audience: REACT_APP_API_BASE, //verify audience of api server
    issuer: `https://${REACT_APP_AUTH0_DOMAIN}/`,
    algorithms: ["RS256"],
  };

  return jwtVerify(accessToken, jwks, options);
};

export const hasPermission = (permission) => {
  return getAccessToken().then((token) => {
    const permissions = token?.decoded?.payload?.permissions || [];
    return permissions.includes(permission);
  });
};
