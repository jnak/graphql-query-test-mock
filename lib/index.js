'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var _exportNames = {
  QueryMock: true
};
exports.QueryMock = void 0;

var _nock = _interopRequireDefault(require('nock'));

var _url = _interopRequireDefault(require('url'));

var _defaults = require('./defaults');

var _getNockRequestHandlerFn = require('./getNockRequestHandlerFn');

var _utils = require('./utils');

var _mockServer = require('./mockServer');

Object.keys(_mockServer).forEach(function(key) {
  if (key === 'default' || key === '__esModule') return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function() {
      return _mockServer[key];
    }
  });
});

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
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

class QueryMock {
  constructor(config) {
    _defineProperty(this, '_calls', []);

    _defineProperty(this, '_queries', {});

    _defineProperty(
      this,
      '_changeServerResponseFn',
      _defaults.defaultChangeServerResponseFn
    );

    if (!config) {
      return;
    }

    const { changeServerResponse } = config;

    if (changeServerResponse) {
      this._changeServerResponseFn = changeServerResponse;
    }
  }

  _addCall(call) {
    this._calls.push(call);
  }

  reset() {
    this._calls = [];
    this._queries = {};
  }

  getCalls() {
    return [...this._calls];
  }

  _getOrCreateMockQueryHolder(id) {
    if (!this._queries[id]) {
      this._queries[id] = [];
    }

    return this._queries[id];
  }

  mockQuery(config) {
    this._getOrCreateMockQueryHolder(config.name).push(
      (0, _utils.createMockGraphQLRecord)(config)
    );
  }

  mockQueryWithControlledResolution(config) {
    let resolver = null;
    const resolveQueryPromise = new Promise(resolve => {
      resolver = resolve;
    });

    const resolveQueryFn = () => {
      let interval = setInterval(() => {
        if (resolver) {
          clearInterval(interval);
          resolver();
        }
      }, 50);
    };

    this._getOrCreateMockQueryHolder(config.name).push(
      (0, _utils.createMockGraphQLRecord)(config, resolveQueryPromise)
    );

    return resolveQueryFn;
  }

  _getQueryMock(name, variables) {
    const queryMockHolder = this._queries[name];

    if (!queryMockHolder || queryMockHolder.length < 1) {
      return null;
    }

    let matchingQueryMock = null;

    for (let i = 0; i <= queryMockHolder.length - 1; i += 1) {
      const thisQueryMock = queryMockHolder[i];
      const {
        matchVariables,
        matchOnVariables,
        ignoreThesePropertiesInVariables
      } = thisQueryMock.queryMockConfig; // Use custom variables match function if it exists

      if (matchVariables && matchVariables(variables || {})) {
        matchingQueryMock = thisQueryMock;
        break;
      } // Bail if this query mock is not configured to match on variables. We handle that case below after the loop.

      if (!matchOnVariables) {
        continue;
      }
      /**
       * Get the ID of this particular mocked query using the provided mock's data.
       * This enables us to check if this mock matches, accounting for any properties
       * that are to be ignored in the mock variables.
       */

      const processedIdForProvidedMockData = (0, _utils.getQueryMockID)(
        name,
        variables,
        ignoreThesePropertiesInVariables || []
      );

      if (processedIdForProvidedMockData === thisQueryMock.id) {
        matchingQueryMock = thisQueryMock;
        break;
      }
    }
    /**
     * If we got all the way here it means we found no matches.
     * We'll check if any of the mocked queries has variable matching off,
     * and if so return that. We start from the latest added queries.
     */

    for (let i = queryMockHolder.length - 1; i >= 0; i -= 1) {
      const thisQueryMock = queryMockHolder[i];

      if (!thisQueryMock.queryMockConfig.matchOnVariables) {
        matchingQueryMock = thisQueryMock;
        break;
      }
    }

    if (matchingQueryMock) {
      return matchingQueryMock.queryMockConfig.persist
        ? matchingQueryMock
        : queryMockHolder
            .splice(queryMockHolder.indexOf(matchingQueryMock), 1)
            .pop();
    }

    return null;
  }

  setup(graphQLURL) {
    this.reset();

    const theUrl = _url.default.parse(graphQLURL);

    (0, _nock.default)(
      `${theUrl.protocol || 'https:'}//${theUrl.host || 'localhost'}`
    )
      .persist()
      .post(theUrl.path || '/')
      .reply((0, _getNockRequestHandlerFn.getNockRequestHandlerFn)(this));
  }

  cleanup() {
    _nock.default.cleanAll();

    _nock.default.enableNetConnect();
  }
}

exports.QueryMock = QueryMock;
