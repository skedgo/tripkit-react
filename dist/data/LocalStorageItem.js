import { JsonConvert } from "json2typescript";
import { EventEmitter } from "fbemitter";
var LocalStorageItem = /** @class */ (function () {
    function LocalStorageItem(classRef, localStorageKey) {
        this.eventEmitter = new EventEmitter();
        this.classRef = classRef;
        this.localStorageKey = localStorageKey;
    }
    LocalStorageItem.prototype.get = function () {
        return this.loadFromLS();
    };
    LocalStorageItem.prototype.save = function (update) {
        var prev = this.get();
        this.saveToLS(update);
        this.fireChangeEvent(update, prev);
    };
    LocalStorageItem.prototype.loadFromLS = function () {
        var itemS = localStorage.getItem(this.localStorageKey);
        if (itemS === null) {
            return new this.classRef();
        }
        try {
            var itemJson = JSON.parse(itemS);
            // return jsonConvert.deserialize(itemJson, this.classRef);
            return this.deserialize(itemJson);
        }
        catch (e) {
            return new this.classRef();
        }
    };
    LocalStorageItem.prototype.deserialize = function (itemJson) {
        var jsonConvert = new JsonConvert();
        return jsonConvert.deserialize(itemJson, this.classRef);
    };
    LocalStorageItem.prototype.saveToLS = function (item) {
        var jsonConvert = new JsonConvert();
        localStorage.setItem(this.localStorageKey, JSON.stringify(jsonConvert.serialize(item)));
    };
    LocalStorageItem.prototype.addChangeListener = function (callback) {
        return this.eventEmitter.addListener('change', callback);
    };
    LocalStorageItem.prototype.fireChangeEvent = function (update, prev) {
        this.eventEmitter.emit('change', update, prev);
    };
    return LocalStorageItem;
}());
export default LocalStorageItem;
//# sourceMappingURL=LocalStorageItem.js.map