import { createRemoteJWKSet } from "jose";

const { REACT_APP_AUTH0_DOMAIN } = process.env;

const auth0PublicKeyURL = new URL(
  "/.well-known/jwks.json",
  `https://${REACT_APP_AUTH0_DOMAIN}/`
);

export const getJwks = () => {
  const JWKS = createRemoteJWKSet(auth0PublicKeyURL);
  return JWKS;
};
export default getJwks;
