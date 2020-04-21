import Location from "../Location";
declare class FacilityLocation extends Location {
    private _facilityType;
    get facilityType(): string;
}
export default FacilityLocation;
