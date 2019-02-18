import * as moment from 'moment-timezone';
var DateTimeUtil = /** @class */ (function () {
    function DateTimeUtil() {
    }
    DateTimeUtil.getNow = function () {
        return moment.tz(this.defaultTZ);
    };
    DateTimeUtil.moment = function (timeS, format) {
        return moment(timeS, format);
    };
    DateTimeUtil.momentTZ = function (timeS, timezone, format) {
        return format ? moment.tz(timeS, format, timezone) : moment.tz(timeS, timezone);
    };
    DateTimeUtil.momentDefaultTZ = function (timeS, format) {
        return format ? moment.tz(timeS, format, DateTimeUtil.defaultTZ) : moment.tz(timeS, DateTimeUtil.defaultTZ);
    };
    DateTimeUtil.momentTZTime = function (time) {
        return moment.tz(time, DateTimeUtil.defaultTZ);
    };
    DateTimeUtil.durationToBriefString = function (durationInMinutes, space, decimal) {
        if (space === void 0) { space = true; }
        if (decimal === void 0) { decimal = false; }
        if (durationInMinutes === 0) {
            return "0" + (space ? " " : "") + "mins";
        }
        var totalMinutes = durationInMinutes;
        var days = Math.floor(totalMinutes / (60 * 24));
        var twiceTheDays = Math.ceil((2 * totalMinutes / (60 * 24)));
        totalMinutes -= days * 24 * 60;
        var justHours = Math.floor(totalMinutes / 60);
        var twiceTheHours = Math.ceil(2 * (totalMinutes) / 60);
        var justMinutes = totalMinutes % 60;
        if (totalMinutes === 60) {
            justMinutes = 60;
        }
        var result = "";
        if (days > 0) {
            if (decimal && (days > 1 || justHours % 12 === 0)) {
                return twiceTheDays % 2 === 0 ? result + days + "d" : result + (twiceTheDays / 2).toFixed(1) + "d";
            }
            result += days + (space ? " " : "") + "d";
        }
        if (totalMinutes > 60) {
            if (result.length !== 0) {
                result += " ";
            }
            if (decimal && (justHours > 1 || justMinutes % 30 === 0)) {
                return twiceTheHours % 2 === 0 ? result += Math.floor(twiceTheHours / 2) + (space ? " " : "") + "h" :
                    result + (twiceTheHours / 2).toFixed(1) + (space ? " " : "") + "h";
            }
            result += justHours + (space ? " " : "") + "h";
        }
        if (result.length !== 0) {
            result += " ";
        }
        result += justMinutes + (space ? " " : "") + "min";
        return result;
    };
    DateTimeUtil.DATE_FORMAT = "DD/MM/YYYY";
    DateTimeUtil.TIME_FORMAT = "h:mm A";
    DateTimeUtil.TIME_FORMAT_TRIP = "h:mma";
    DateTimeUtil.DATE_TIME_FORMAT = DateTimeUtil.DATE_FORMAT + ", " + DateTimeUtil.TIME_FORMAT;
    DateTimeUtil.HTML5_DATE_TIME_FORMAT = "YYYY-MM-DDTHH:mm";
    DateTimeUtil.defaultTZ = "Australia/ACT";
    return DateTimeUtil;
}());
export default DateTimeUtil;
//# sourceMappingURL=DateTimeUtil.js.map