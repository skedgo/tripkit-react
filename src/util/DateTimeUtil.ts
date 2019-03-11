import * as moment from 'moment-timezone';
import {Moment} from "moment-timezone";

class DateTimeUtil {

    public static readonly DATE_FORMAT = "DD/MM/YYYY";
    public static readonly TIME_FORMAT = "h:mm A";
    public static readonly TIME_FORMAT_TRIP = "h:mma";
    public static readonly DATE_TIME_FORMAT = DateTimeUtil.DATE_FORMAT + ", " + DateTimeUtil.TIME_FORMAT;
    public static readonly HTML5_DATE_TIME_FORMAT = "YYYY-MM-DDTHH:mm";

    public static defaultTZ = "Australia/ACT";

    public static getNow() {
        return moment.tz(this.defaultTZ);
    }

    public static moment(timeS: string, format?: string): Moment {
        return moment(timeS, format);
    }

    public static momentTZ(timeS: string, timezone: string, format?: string): Moment {
        return format ? moment.tz(timeS, format, timezone) : moment.tz(timeS, timezone);
    }

    public static momentDefaultTZ(timeS: string, format?: string) {
        return format ? moment.tz(timeS, format, DateTimeUtil.defaultTZ) : moment.tz(timeS, DateTimeUtil.defaultTZ);
    }

    public static momentTZTime(time: number) {
        return moment.tz(time, DateTimeUtil.defaultTZ);
    }

    public static durationToBriefString(durationInMinutes: number, space: boolean = true, decimal: boolean = false): string {
        if (durationInMinutes === 0) {
            return "0" + (space ? " " : "") + "mins";
        }
        let totalMinutes = durationInMinutes;
        const days = Math.floor(totalMinutes / (60*24));
        const twiceTheDays = Math.ceil((2 * totalMinutes / (60 * 24)));
        totalMinutes -= days*24*60;
        const justHours = Math.floor(totalMinutes / 60);
        const twiceTheHours = Math.ceil(2 * (totalMinutes) / 60);
        let justMinutes = totalMinutes % 60;
        if (totalMinutes === 60) {
            justMinutes = 60;
        }

        let result = "";

        if (days > 0) {
            if (decimal && (days > 1 || justHours % 12 === 0)) {
                return twiceTheDays % 2 === 0 ? result + days + "d" : result + (twiceTheDays/2).toFixed(1) + "d";
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
    }

    public static minutesToDepartToString(minutes: number) {
        if (0 <= minutes && minutes < 2) {
            return "now";
        } else if (-60 <= minutes && minutes < 60) {
            return Math.floor(minutes) + "min";
        } else if (-24*60 <= minutes && minutes < 24*60) {
            const durationInHours = Math.floor(minutes / 60);
            return durationInHours + "h";
        } else {
            const durationInDays = Math.floor(minutes / (24*60));
            return durationInDays + "d";
        }
    }

}

export default DateTimeUtil;