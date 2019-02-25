'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.getQueryMockID = getQueryMockID;
exports.getVariables = getVariables;
exports.createMockGraphQLRecord = createMockGraphQLRecord;

var _objectHash = _interopRequireDefault(require('object-hash'));

var _defaults = require('./defaults');

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    var ownKeys = Object.keys(source);
    if (typeof Object.getOwnPropertySymbols === 'function') {
      ownKeys = ownKeys.concat(
        Object.getOwnPropertySymbols(source).filter(function(sym) {
          return Object.getOwnPropertyDescriptor(source, sym).enumerable;
        })
      );
    }
    ownKeys.forEach(function(key) {
      _defineProperty(target, key, source[key]);
    });
  }
  return target;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}

function getQueryMockID(
  queryName,
  variables,
  ignoreThesePropertiesInVariables
) {
  const processedVariables = getVariables(
    variables,
    ignoreThesePropertiesInVariables
  );
  return `${queryName}__${_objectHash.default.sha1(processedVariables)}`;
}

function getVariables(variables, ignoreThesePropertiesInVariables) {
  const vars = _objectSpread({}, variables);

  ignoreThesePropertiesInVariables.forEach(propName => {
    delete vars[propName];
  });
  return vars;
}

function createMockGraphQLRecord(config, resolveQueryPromise) {
  const queryMockConfig = _objectSpread(
    {
      variables: {}
    },
    _defaults.DEFAULT_CONFIG,
    config
  );

  let ignoreThesePropertiesInVariables =
    queryMockConfig.ignoreThesePropertiesInVariables || [];

  if (!queryMockConfig.matchOnVariables && !queryMockConfig.matchVariables) {
    ignoreThesePropertiesInVariables = Object.keys(
      queryMockConfig.variables || {}
    );
  }

  return {
    id: getQueryMockID(
      queryMockConfig.name,
      queryMockConfig.variables,
      ignoreThesePropertiesInVariables
    ),
    queryMockConfig: _objectSpread({}, queryMockConfig, {
      ignoreThesePropertiesInVariables
    }),
    resolveQueryPromise
  };
}
