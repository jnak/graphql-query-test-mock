'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.getOperationNameFromQuery = getOperationNameFromQuery;

var _parser = require('graphql/language/parser');

//  strict
function getOperationNameFromQuery(query) {
  try {
    const { definitions } = (0, _parser.parse)(query);
    const definition = definitions.length > 0 ? definitions[0] : null;
    const operationName =
      definition && definition.name && definition.name.value
        ? definition.name.value
        : null;

    if (!operationName) {
      throw new Error();
    }

    return String(operationName);
  } catch (e) {
    throw new Error('Could not find query name.');
  }
}
