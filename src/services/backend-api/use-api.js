import { getApiClient } from ".";
import { getAccessToken } from "../auth0";
/**
 * Applies entries in a given object to a url that has path parameters, such as :someId
 * Example:
 *            url:  /path/to/:someId
 *         params:  { "someId": 212 }
 *        returns:  /path/to/212
 * @param {*} url : A url path with identifiers starting with a colon
 * @param {*} params : an object with keys matching the colon-prefixed identifiers in the url
 * @returns A string with the result of applying the params object to the url
 */
const applyPathParamsFromObject = (url, params) => {
  return Object.entries(params).reduce((aggUrl, [key, value]) => {
    return aggUrl.replace(`:${key}`, value);
  }, url);
};

export const useApi = (
  url,
  params = {},
  { anonymous = false, customErrorHandler } = {}
) => {
  const resourceUrl = applyPathParamsFromObject(url, params);
  const get = (query, urlPathParams = undefined) => {
    const accessTokenPromise = anonymous
      ? () => Promise.resolve({ accessToken: undefined })
      : getAccessToken;
    return accessTokenPromise().then(({ accessToken } = {}) => {
      const apiClient = getApiClient({ accessToken });
      const resourceUrlApplied = urlPathParams
        ? applyPathParamsFromObject(resourceUrl, urlPathParams)
        : resourceUrl;
      return apiClient
        .get(resourceUrlApplied, { params: query })
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          if (customErrorHandler) {
            return customErrorHandler(err);
          }
          throw err;
        })
        .catch((err) => {
          const responseStatus = err?.response?.request?.status || 0;
          if (responseStatus >= 400 && responseStatus < 500) {
            const errors = err?.response?.data?.error;

            if (errors?.length && errors?.length > 0) {
              throw errors[0];
            }

            if (errors?.message) {
              throw errors;
            }
            throw err;
          }

          //Auto retry 502 error - api server (lambda) timeout clashed with api gateway timeout
          return apiClient
            .get(resourceUrlApplied, { params: query })
            .then((res) => {
              return res.data;
            })
            .catch((err) => {
              if (customErrorHandler) {
                return customErrorHandler(err);
              }
              throw err;
            })
            .catch((err2) => {
              throw err2;
            });
        });
    });
  };

  const post = (data, urlPathParams = undefined) => {
    return getAccessToken().then(({ accessToken }) => {
      const apiClient = getApiClient({ accessToken });
      const resourceUrlApplied = urlPathParams
        ? applyPathParamsFromObject(resourceUrl, urlPathParams)
        : resourceUrl;
      return apiClient
        .post(resourceUrlApplied, data)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          //400... errors dont need to be retried:
          //      (eg: bad request, unauthenticated, unauthorized)
          //  result wont change with a 2nd request
          const responseStatus = err?.response?.request?.status || 0;
          if (responseStatus >= 400 && responseStatus < 500) {
            const errors = err?.response?.data?.error;

            if (errors?.length && errors?.length > 0) {
              throw errors[0];
            }

            if (errors?.message) {
              throw errors;
            }
            throw err;
          }

          //500 errors... can change with a 500 result, espectially 502 in aws
          //Auto retry 502 error - api server (lambda) timeout clashed with api gateway timeout
          return apiClient
            .post(resourceUrlApplied, data)
            .then((res) => {
              return res.data;
            })
            .catch((err2) => {
              const errors = err2?.response?.data?.error;

              if (errors?.length && errors?.length > 0) {
                throw errors[0];
              }

              if (errors?.message) {
                throw errors;
              }
              throw err2;
            });
        });
    });
  };

  const patch = (data, urlPathParams = undefined) => {
    return getAccessToken().then(({ accessToken }) => {
      const apiClient = getApiClient({ accessToken });
      const resourceUrlApplied = urlPathParams
        ? applyPathParamsFromObject(resourceUrl, urlPathParams)
        : resourceUrl;
      return apiClient
        .patch(resourceUrlApplied, data)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          //400... errors dont need to be retried:
          //      (eg: bad request, unauthenticated, unauthorized)
          //  result wont change with a 2nd request
          const responseStatus = err?.response?.request?.status || 0;
          if (responseStatus >= 400 && responseStatus < 500) {
            const errors = err?.response?.data?.error;

            if (errors?.length && errors?.length > 0) {
              throw errors[0];
            }

            if (errors?.message) {
              throw errors;
            }
            throw err;
          }

          //Auto retry 502 error - api server (lambda) timeout clashed with api gateway timeout
          return apiClient
            .patch(resourceUrlApplied, data)
            .then((res) => {
              return res.data;
            })
            .catch((err2) => {
              throw err2;
            });
        });
    });
  };

  const destroy = (data, urlPathParams = undefined) => {
    return getAccessToken().then(({ accessToken }) => {
      const apiClient = getApiClient({ accessToken });
      const resourceUrlApplied = urlPathParams
        ? applyPathParamsFromObject(resourceUrl, urlPathParams)
        : resourceUrl;
      return apiClient
        .delete(resourceUrlApplied, data)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          //400... errors dont need to be retried:
          //      (eg: bad request, unauthenticated, unauthorized)
          //  result wont change with a 2nd request
          const responseStatus = err?.response?.request?.status || 0;
          if (responseStatus >= 400 && responseStatus < 500) {
            const errors = err?.response?.data?.error;

            if (errors?.length && errors?.length > 0) {
              throw errors[0];
            }

            if (errors?.message) {
              throw errors;
            }
            throw err;
          }

          //Auto retry 502 error - api server (lambda) timeout clashed with api gateway timeout
          return apiClient
            .delete(resourceUrlApplied, data)
            .then((res) => {
              return res.data;
            })
            .catch((err2) => {
              throw err2;
            });
        });
    });
  };

  return {
    get,
    patch,
    post,
    destroy,
  };
};
