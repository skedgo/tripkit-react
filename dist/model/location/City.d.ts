import Location from "../Location";
declare class City extends Location {
    constructor();
    title: string;
    timezone: string;
    get name(): string;
}
export default City;
