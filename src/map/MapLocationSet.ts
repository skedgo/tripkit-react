import Location from "../model/Location";
import LocationUtil from "../util/LocationUtil";
import {Map as LMap, Marker, Popup} from "leaflet";

class MapLocationSet {

    private map: LMap;
    private locRenderer: (loc: Location) => Marker;
    private popupRenderer?: (loc: Location, marker: Marker) => Popup;
    // values: Location[] = [];
    private valueToMarker: Map<Location, Marker> = new Map<Location, Marker>();
    private showing: boolean = true;

    constructor(map: LMap, locRenderer: (loc: Location) => Marker,
                popupRenderer?: (loc: Location, maker: Marker) => Popup) {  // receives marker if need to do something on marker.on('popupopen'...
        this.map = map;
        this.locRenderer = locRenderer;
        this.popupRenderer = popupRenderer;
    }

    public addValues(values: Location[]) {
        const currentValues = Array.from(this.valueToMarker.keys());
        for (const value of values) {
            if (currentValues.find((currValue: Location) => LocationUtil.equal(currValue, value))) {
                continue;
            }
            const marker = this.locRenderer(value);
            if (this.popupRenderer) {
                marker.bindPopup(this.popupRenderer(value, marker));
            }
            this.valueToMarker.set(value, marker);
            if (this.showing) {
                marker.addTo(this.map);
            }
        }
    }

    public setShow(show: boolean) {
        if (this.showing === show) {
            return;
        }
        this.showing = show;
        const currentValues = Array.from(this.valueToMarker.keys());
        for (const value of currentValues) {
            if (show) {
                this.valueToMarker.get(value)!.addTo(this.map);
            } else {
                this.map.removeLayer(this.valueToMarker.get(value)!);
            }
        }
    }

}

export default MapLocationSet;