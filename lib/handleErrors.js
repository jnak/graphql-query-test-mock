'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.printNoMockFoundError = printNoMockFoundError;
exports.printVariablesDoesNotMatchError = printVariablesDoesNotMatchError;

var _jestDiff = _interopRequireDefault(require('jest-diff'));

var _index = require('./index');

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

//  strict
function printNoMockFoundError(queryMock, operationName, variables) {
  const errorMessageArray = getNoMockFoundErrorMessageArray(
    queryMock,
    operationName,
    variables
  );
  throw new Error(errorMessageArray.join(''));
}

function getNoMockFoundErrorMessageArray(queryMock, operationName, variables) {
  const mockedQueriesMessageArray = [
    `Could not find matching mock for operation "${operationName}" ` +
      `with variables: ${JSON.stringify(variables)}\n` +
      `Make sure you have mocked the query you are making.\n\n`
  ];

  if (!Object.entries(queryMock._queries).length) {
    mockedQueriesMessageArray.push(`=== No query was mocked ===\n\n`);
    return mockedQueriesMessageArray;
  }

  if (queryMock._queries[operationName]) {
    mockedQueriesMessageArray.push(
      `=== Currently mocked "${operationName}" queries ===\n`
    );

    queryMock._queries[operationName].forEach(({ queryMockConfig }) => {
      mockedQueriesMessageArray.push(
        `Query "variables": ${JSON.stringify(queryMockConfig.variables)}\n` +
          `Diff of "variables":\n` +
          `${(0, _jestDiff.default)(queryMockConfig.variables, variables)}\n\n`
      );
    });
  }

  const otherMockedQueryNames = Object.keys(queryMock._queries).filter(
    queryMockName => operationName !== queryMockName
  );

  if (!otherMockedQueryNames.length) {
    return mockedQueriesMessageArray;
  }

  mockedQueriesMessageArray.push(
    `=== ${
      queryMock._queries[operationName] ? 'Other' : 'All'
    } mocked queries ===\n`
  );
  otherMockedQueryNames.forEach(queryName => {
    mockedQueriesMessageArray.push(`- "${queryName || 'unknown'}"\n`);
  });
  mockedQueriesMessageArray.push(`\n`);
  return mockedQueriesMessageArray;
}

function printVariablesDoesNotMatchError(
  queryMockConfig,
  shouldMatchOnVariables,
  operationName,
  variables
) {
  if (shouldMatchOnVariables) {
    let errorStr = `Variables do not match for operation "${operationName ||
      'unknown'}"`;

    if (queryMockConfig.matchVariables) {
      throw new Error(`${errorStr} due to custom "matchOnVariables" function`);
    } else {
      throw new Error(
        `${errorStr}.\n\nVariables in request VS mocked variables: \n${(0,
        _jestDiff.default)(variables, queryMockConfig.variables)}`
      );
    }
  }
}
