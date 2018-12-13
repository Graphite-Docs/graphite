"use strict";

var _ = require("lodash");
module.exports = function () {
    var output = {};
    _.toArray(arguments).reverse().forEach(function (item) {
        _.mergeWith(output, item, function (objectValue, sourceValue) {
            return _.isArray(sourceValue) ? sourceValue : undefined;
        });
    });
    return output;
};