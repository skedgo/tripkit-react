import Location from "../model/Location";
import { Map as LMap, Marker, Popup } from "leaflet";
declare class MapLocationSet {
    private map;
    private locRenderer;
    private popupRenderer?;
    private valueToMarker;
    private showing;
    constructor(map: LMap, locRenderer: (loc: Location) => Marker, popupRenderer?: (loc: Location, maker: Marker) => Popup);
    addValues(values: Location[]): void;
    setShow(show: boolean): void;
}
export default MapLocationSet;
