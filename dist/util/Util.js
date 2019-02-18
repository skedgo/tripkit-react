var Util = /** @class */ (function () {
    function Util() {
    }
    Util.getWindowHeight = function () {
        return "innerHeight" in window ? window.innerHeight : document.documentElement.offsetHeight;
    };
    /**
     * Generic clone, requires T to have a default constructor
     */
    Util.clone = function (instance) {
        return Object.assign(new instance.constructor(), instance);
    };
    /**
     * Generic immutable assign, requires T to have a default constructor Util.clone can be used.
     */
    Util.iAssign = function (target, source) {
        return Object.assign(Util.clone(target), source);
    };
    /**
     * Needed this since Set type does not allow to specify a custom equality comparator:
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set.
     * Mutable.
     */
    Util.addNoRep = function (array, elem, equal) {
        if (!array.find(function (e) { return equal(elem, e); })) {
            array.push(elem);
        }
        return array;
    };
    Util.addAllNoRep = function (array, elems, equal) {
        for (var _i = 0, elems_1 = elems; _i < elems_1.length; _i++) {
            var elem = elems_1[_i];
            this.addNoRep(array, elem, equal);
        }
        return array;
    };
    // must cast as any to set property on window
    Util.global = (window /* browser */ || global /* node */);
    return Util;
}());
export default Util;
//# sourceMappingURL=Util.js.map