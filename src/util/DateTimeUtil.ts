import { default as moment } from 'moment-timezone';
import { Moment } from "moment-timezone";
import { i18n } from '../i18n/TKI18nConstants';
import ServiceDeparture from "../model/service/ServiceDeparture";

class DateTimeUtil {

    public static readonly HTML5_DATE_TIME_FORMAT = "YYYY-MM-DDTHH:mm";

    public static timeFormat = (spaced: boolean = true) => {
        return i18n.locale === "ja" ? "HH:mm" : `h:mm${spaced ? " " : ""}A`;
    };

    public static dateFormat = () => {
        return i18n.locale === 'en-US' ? "MM/DD/YYYY" : "DD/MM/YYYY";
    };

    public static dateTimeFormat = () => DateTimeUtil.dateFormat() + ", " + DateTimeUtil.timeFormat();

    public static dayMonthFormat = () => {
        return i18n.locale === 'en-US' ? "MMM DD" : "DD MMM";
    };

    public static defaultTZ = "Etc/UTC";

    public static getNow(timezone = this.defaultTZ) {
        return moment.tz(timezone);
    }

    public static moment(timeS: string, format?: string): Moment {
        return moment(timeS, format);
    }

    public static momentFromStringTZ(timeS: string, timezone: string, format?: string): Moment {
        return format ? moment.tz(timeS, format, timezone) : moment.tz(timeS, timezone);
    }

    public static momentFromStringDefaultTZ(timeS: string, format?: string): Moment {
        return format ? moment.tz(timeS, format, DateTimeUtil.defaultTZ) : moment.tz(timeS, DateTimeUtil.defaultTZ);
    }

    public static momentFromTimeTZ(time: number, timezone: string = DateTimeUtil.defaultTZ): Moment {
        return moment.tz(time, timezone);
    }

    public static momentTZ(datetime: any, timezone: string): Moment {
        return moment.tz(datetime, timezone);
    }

    /**
     * @deprecated Since shouldn't use moment outside DateTimeUtil anymore.
     */
    public static momentFromIsoWithTimezone(datetime: string): Moment {
        return moment.parseZone(datetime);
    }

    public static isoFromMillis(time: number, timezone: string = DateTimeUtil.defaultTZ): string {
        return moment.tz(time, timezone).format();
    }

    public static isoFromSeconds(time: number, timezone: string = DateTimeUtil.defaultTZ): string {
        return this.isoFromMillis(time * 1000, timezone);
    }

    public static isoToMillis(time: string): number {
        return moment(time).valueOf();
    }

    public static isoToSeconds(time: string): number {
        return this.isoToMillis(time) / 1000;
    }

    public static format(timeISO: string, formatS: string): string {
        // Parses the timeISO string and preserves the offset, unlike moment(string) which converts to the local timezone.
        // See doc: https://momentjscom.readthedocs.io/en/latest/moment/01-parsing/14-parse-zone
        return moment.parseZone(timeISO).format(formatS);
    }

    public static durationToBriefString(durationInMinutes: number, space: boolean = true, decimal: boolean = false): string {
        const t = i18n.t;
        durationInMinutes = Math.floor(durationInMinutes);
        if (durationInMinutes === 0) {
            return "0" + (space ? " " : "") + "mins";
        }
        let totalMinutes = durationInMinutes;
        const days = Math.floor(totalMinutes / (60 * 24));
        const twiceTheDays = Math.ceil((2 * totalMinutes / (60 * 24)));
        totalMinutes -= days * 24 * 60;
        const justHours = Math.floor(totalMinutes / 60);
        const twiceTheHours = Math.ceil(2 * (totalMinutes) / 60);
        let justMinutes = totalMinutes % 60;
        if (totalMinutes === 60) {
            justMinutes = 60;
        }

        let result = "";

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
                return twiceTheHours % 2 === 0 ? result += Math.floor(twiceTheHours / 2) + (space ? " " : "") + t("hr") :
                    result + (twiceTheHours / 2).toFixed(1) + (space ? " " : "") + t("hr");
            }
            result += justHours + (space ? " " : "") + t("hr");
        }

        if (result.length !== 0) {
            result += " ";
        }
        result += justMinutes + (space ? " " : "") + t("min");

        return result;
    }

    public static minutesToDepartToString(minutes: number) {
        const t = i18n.t;
        minutes = Math.floor(minutes);
        if (0 <= minutes && minutes < 2) {
            return "Now";
        } else if (-60 <= minutes && minutes < 60) {
            return Math.floor(minutes) + t("min");
        } else if (-24 * 60 <= minutes && minutes < 24 * 60) {
            const durationInHours = Math.floor(minutes / 60);
            return durationInHours + t("hr");
        } else {
            const durationInDays = Math.floor(minutes / (24 * 60));
            return durationInDays + "d";
        }
    }

    public static getRealtimeDiffInMinutes(departure: ServiceDeparture) {
        return Math.floor(departure.actualStartTime / 60 - departure.startTime / 60);
    }

    public static formatRelativeDay(moment: Moment, formatWithDay: string, partialReplace?: string): string {
        const calendarFormat = {
            sameDay: partialReplace ? formatWithDay.replace(partialReplace, "[Today]") : "[Today]",
            nextDay: partialReplace ? formatWithDay.replace(partialReplace, "[Tomorrow]") : "[Tomorrow]",
            nextWeek: formatWithDay,
            lastDay: partialReplace ? formatWithDay.replace(partialReplace, "[Yesterday]") : "[Yesterday]",
            lastWeek: formatWithDay,
            sameElse: formatWithDay,
        };
        return moment.calendar(DateTimeUtil.getNow(), calendarFormat);
    };

}

export default DateTimeUtil;