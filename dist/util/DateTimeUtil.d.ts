import * as moment from 'moment-timezone';
import { Moment } from "moment-timezone";
declare class DateTimeUtil {
    static readonly DATE_FORMAT: string;
    static readonly TIME_FORMAT: string;
    static readonly TIME_FORMAT_TRIP: string;
    static readonly DATE_TIME_FORMAT: string;
    static readonly HTML5_DATE_TIME_FORMAT: string;
    static defaultTZ: string;
    static getNow(): moment.Moment;
    static moment(timeS: string, format?: string): Moment;
    static momentTZ(timeS: string, timezone: string, format?: string): Moment;
    static momentDefaultTZ(timeS: string, format?: string): moment.Moment;
    static momentTZTime(time: number): moment.Moment;
    static durationToBriefString(durationInMinutes: number, space?: boolean, decimal?: boolean): string;
}
export default DateTimeUtil;
