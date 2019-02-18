import Color from "../trip/Color";
declare class ModeIdentifier {
    private _title;
    private _color;
    private _icon;
    private _identifier;
    static readonly SCHOOLBUS_ID: string;
    static readonly UBER_ID: string;
    static readonly CAR_RENTAL_SW_ID: string;
    static readonly TAXI_ID: string;
    static readonly PUBLIC_TRANSPORT_ID: string;
    static readonly TRAM_ID: string;
    /**
     * Empty constructor, necessary for Util.clone
     */
    constructor();
    title: string;
    color: Color | null;
    icon: string | null;
    identifier: string;
}
export default ModeIdentifier;
