'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.getNockRequestHandlerFn = getNockRequestHandlerFn;

var _deepEqual = _interopRequireDefault(require('deep-equal'));

var _getOperationNameFromQuery = require('./getOperationNameFromQuery');

var _handleErrors = require('./handleErrors');

var _index = require('./index');

var _utils = require('./utils');

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

//  strict
function getNockRequestHandlerFn(queryMock) {
  return function handleNockRequest(uri, data, cb) {
    if (data && typeof data === 'object') {
      const query = String(data.query);
      const operationName = (0,
      _getOperationNameFromQuery.getOperationNameFromQuery)(query);

      if (operationName) {
        const variables =
          data.variables !== null && typeof data.variables === 'object'
            ? data.variables
            : {};

        const mockedQueryRecord = queryMock._getQueryMock(
          operationName,
          variables
        );

        if (mockedQueryRecord) {
          const { queryMockConfig, resolveQueryPromise } = mockedQueryRecord;
          const { status } = queryMockConfig;

          if (status && status >= 400) {
            // Bail early if status is a failure
            throw queryMockConfig.error ||
              new Error(
                `Request for operation "${operationName ||
                  'unknown'}" failed with status ${status}. This is intentional and set up in the mock.`
              );
          }

          const hasVariablesOrMatchFn = !!(
            queryMockConfig.variables || queryMockConfig.matchVariables
          );
          const shouldMatchOnVariables =
            queryMockConfig.matchOnVariables && hasVariablesOrMatchFn;

          if (
            !shouldMatchOnVariables || // Bypass if we should not match on variables
            (queryMockConfig.matchVariables
              ? queryMockConfig.matchVariables(variables)
              : (0, _deepEqual.default)(
                  (0, _utils.getVariables)(
                    variables,
                    queryMockConfig.ignoreThesePropertiesInVariables || []
                  ),
                  (0, _utils.getVariables)(
                    queryMockConfig.variables,
                    queryMockConfig.ignoreThesePropertiesInVariables || []
                  )
                ))
          ) {
            /**
             * We turn our request handler function into an async one at this point and not earlier,
             * because this is the first time we're absolutely sure we will resolve the query and that
             * we won't need to throw an error. Throwing inside the async function will make the Promise swallow
             * the error, which we do not want.
             */
            (async () => {
              const serverResponseData = {
                data: queryMockConfig.data
              };
              /**
               * This is a default function that just returns itself (ie does not change the server response)
               * unless provided a custom function.
               **/

              const changeServerResponseFn =
                queryMockConfig.changeServerResponse ||
                queryMock._changeServerResponseFn;
              const serverResponse = changeServerResponseFn(
                queryMockConfig,
                serverResponseData
              );
              let nockReturnVal = [
                queryMockConfig.status || 200,
                serverResponse
              ];
              const { customHandler } = queryMockConfig;

              if (customHandler) {
                const returnValue = customHandler(this.req, {
                  query,
                  operationName,
                  variables
                });
                nockReturnVal =
                  returnValue instanceof Promise
                    ? await returnValue
                    : returnValue;
              } // Make sure we add the call to our list

              queryMock._addCall({
                id: operationName,
                variables,
                headers: this.req.headers,
                response: nockReturnVal[1]
              }); // Wait for resolution control promise to resolve if it exists

              if (resolveQueryPromise) {
                await resolveQueryPromise;
              }

              cb(null, nockReturnVal);
            })();
          } else {
            // More useful errors
            (0, _handleErrors.printVariablesDoesNotMatchError)(
              queryMockConfig,
              shouldMatchOnVariables,
              operationName,
              variables
            );
          }
        } else {
          (0, _handleErrors.printNoMockFoundError)(
            queryMock,
            operationName,
            variables
          );
        }
      } else {
        throw new Error(
          "Could not find operation name in request. Please make sure you're actually sending the query in your fetch."
        );
      }
    }
  };
}
