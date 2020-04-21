import { default as moment } from 'moment-timezone';
import { Moment } from "moment-timezone";
declare class DateTimeUtil {
    static readonly DATE_FORMAT = "DD/MM/YYYY";
    static readonly TIME_FORMAT = "h:mm A";
    static readonly TIME_FORMAT_TRIP = "h:mma";
    static readonly DATE_TIME_FORMAT: string;
    static readonly HTML5_DATE_TIME_FORMAT = "YYYY-MM-DDTHH:mm";
    static defaultTZ: string;
    static getNow(): moment.Moment;
    static moment(timeS: string, format?: string): Moment;
    static momentFromStringTZ(timeS: string, timezone: string, format?: string): Moment;
    static momentFromStringDefaultTZ(timeS: string, format?: string): Moment;
    static momentFromTimeTZ(time: number, timezone?: string): Moment;
    static durationToBriefString(durationInMinutes: number, space?: boolean, decimal?: boolean): string;
    static minutesToDepartToString(minutes: number): string;
}
export default DateTimeUtil;
