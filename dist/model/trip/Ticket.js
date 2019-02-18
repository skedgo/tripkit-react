var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { JsonObject, JsonProperty } from "json2typescript";
var Ticket = /** @class */ (function () {
    function Ticket() {
        this._cost = undefined;
        this._exchange = undefined;
        this._name = "";
    }
    Object.defineProperty(Ticket.prototype, "cost", {
        get: function () {
            return this._cost;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Ticket.prototype, "exchange", {
        get: function () {
            return this._exchange;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Ticket.prototype, "name", {
        get: function () {
            return this._name;
        },
        enumerable: true,
        configurable: true
    });
    __decorate([
        JsonProperty("cost", Number, true),
        __metadata("design:type", Object)
    ], Ticket.prototype, "_cost", void 0);
    __decorate([
        JsonProperty("exchange", Number, true),
        __metadata("design:type", Object)
    ], Ticket.prototype, "_exchange", void 0);
    __decorate([
        JsonProperty("name", String, true),
        __metadata("design:type", String)
    ], Ticket.prototype, "_name", void 0);
    Ticket = __decorate([
        JsonObject
    ], Ticket);
    return Ticket;
}());
export default Ticket;
//# sourceMappingURL=Ticket.js.map