var LocationUtil = /** @class */ (function () {
    function LocationUtil() {
    }
    LocationUtil.getMainText = function (loc) {
        var address = loc.address;
        return address.includes(",") ? address.substr(0, address.indexOf(",")) : address;
    };
    LocationUtil.getSecondaryText = function (loc) {
        var address = loc.address;
        return address.includes(",") ? address.substr(address.indexOf(",") + 1, address.length) : null;
    };
    LocationUtil.equal = function (loc1, loc2) {
        return loc1 === null ? loc2 === null :
            (loc2 !== null && loc1.getKey() === loc2.getKey());
    };
    LocationUtil.computeLevenshteinDistance = function (str1, str2) {
        var distance = new Array(str1.length + 1);
        for (var i = 0; i < str1.length + 1; i++) {
            distance[i] = new Array(str2.length + 1);
        }
        for (var i = 0; i <= str1.length; i++) {
            distance[i][0] = i;
        }
        for (var j = 1; j <= str2.length; j++) {
            distance[0][j] = j;
        }
        for (var i = 1; i <= str1.length; i++) {
            for (var j = 1; j <= str2.length; j++) {
                distance[i][j] = Math.min(distance[i - 1][j] + 1, distance[i][j - 1] + 1, distance[i - 1][j - 1] + ((str1.charAt(i - 1) === str2.charAt(j - 1)) ? 0 : 1));
            }
        }
        return distance[str1.length][str2.length];
    };
    LocationUtil.relevance = function (query, searchResult, preferShorter) {
        if (preferShorter === void 0) { preferShorter = false; }
        query = query.toLowerCase();
        searchResult = searchResult.toLowerCase();
        if (query === searchResult) {
            return 1;
        }
        if (searchResult.includes(",") && query === searchResult.substring(0, searchResult.indexOf(","))) { // query equals to first term
            return .9;
        }
        var searchResultWords = searchResult.split(" ");
        if (searchResult.startsWith(query)) {
            return .85 * (preferShorter ? 40 / (40 + searchResultWords.length) : 1);
        }
        var relevance = 0;
        var queryWords = query.split(" ");
        for (var _i = 0, queryWords_1 = queryWords; _i < queryWords_1.length; _i++) {
            var queryWord = queryWords_1[_i];
            var queryWordInResult = false;
            var queryWordAsPrefix = false;
            for (var _a = 0, searchResultWords_1 = searchResultWords; _a < searchResultWords_1.length; _a++) {
                var searchResultWord = searchResultWords_1[_a];
                if (searchResultWord === queryWord) {
                    queryWordInResult = true;
                    break;
                }
                if (searchResultWord.startsWith(queryWord)) {
                    queryWordAsPrefix = true;
                    break;
                }
            }
            if (queryWordInResult) {
                relevance += .8 / queryWords.length;
            }
            else if (queryWordAsPrefix) {
                relevance += .7 / queryWords.length;
            }
            else if (searchResult.includes(queryWord)) {
                relevance += .6 / queryWords.length;
            }
            else {
                var minDistance = Number.MAX_VALUE;
                for (var _b = 0, searchResultWords_2 = searchResultWords; _b < searchResultWords_2.length; _b++) {
                    var searchResultWord = searchResultWords_2[_b];
                    minDistance = Math.min(minDistance, LocationUtil.computeLevenshteinDistance(queryWord, searchResultWord));
                }
                relevance += .5 / (queryWords.length + minDistance);
            }
        }
        return relevance * (preferShorter ? 40 / (40 + searchResultWords.length) : 1);
    };
    /* This is the Equirectangular approximation. It's a little slower than the Region.distanceInMetres() formula. */
    LocationUtil.distanceInMetres = function (c1, c2) {
        var lngDelta = Math.abs(c1.lng - c2.lng);
        if (lngDelta > 180) {
            lngDelta = 360 - lngDelta;
        }
        var p1 = lngDelta * Math.cos(0.5 * this.radians * (c1.lat + c2.lat));
        var p2 = (c1.lat - c2.lat);
        return this.earthRadius * this.radians * Math.sqrt(p1 * p1 + p2 * p2);
    };
    LocationUtil.earthRadius = 6371000;
    LocationUtil.radians = 3.14159 / 180;
    return LocationUtil;
}());
export default LocationUtil;
//# sourceMappingURL=LocationUtil.js.map