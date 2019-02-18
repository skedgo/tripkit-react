import Location from "../Location";
declare class City extends Location {
    private _title;
    private _timezone;
    readonly name: string;
    readonly timezone: string;
}
export default City;
