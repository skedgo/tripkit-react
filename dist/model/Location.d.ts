import LatLng from '../model/LatLng';
declare class Location extends LatLng {
    class: string;
    private _address;
    private _name;
    private _id;
    source: string | undefined;
    suggestion?: any;
    hasDetail?: boolean;
    timezone: string;
    static create(latlng: LatLng, address: string, id: string, name: string, source?: string): Location;
    private static readonly currLocText;
    static createCurrLoc(): Location;
    private static readonly droppedPinText;
    static createDroppedPin(latLng: LatLng): Location;
    /**
     * Empty constructor, necessary for Util.clone
     */
    constructor();
    isResolved(): boolean;
    get address(): string;
    set address(value: string);
    get name(): string;
    set name(value: string);
    get id(): string;
    set id(value: string);
    getDisplayString(): string;
    isCurrLoc(): boolean;
    isDroppedPin(): boolean;
    toJson(): object;
    equals(other: any): boolean;
}
export default Location;
