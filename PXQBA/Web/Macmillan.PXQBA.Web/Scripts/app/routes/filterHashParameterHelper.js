﻿filterHashParameterHelper = (function () {
    self.emptyValue = '_';
    var emptyValue = self.emptyValue;
    var fieldsSeparator = '+';
    var valuesSeparator = '|';
    var fieldValueSeparator = ':';

    self.parse = function (filterUrlHash) {
        if (filterUrlHash == emptyValue) {
            return null;
        }
        var fieldFilters = filterUrlHash.split(fieldsSeparator);
        var gilterItems = [];
        for (var i = 0; i < fieldFilters.length; i++) {
            gilterItems.push(new FilterItem(fieldFilters[i], valuesSeparator, fieldValueSeparator));
        }
        return gilterItems;
    };

    self.toUrlHash = function(filterItems) {
        var stringItems = [];
        for (var i = 0; i < filterItems.length; i++) {
            stringItems.push(filterItems[i].toUrlString());
        }

        return stringItems.join(fieldsSeparator);
    };

    return self;
}());
