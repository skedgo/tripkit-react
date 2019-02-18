import * as React from "react";
import "./ReactMap.css";
import LatLng from "../model/LatLng";
import Location from "../model/Location";
import BBox from "../model/BBox";
import Trip from "../model/trip/Trip";
import { MapLocationType } from "../model/location/MapLocationType";
interface IProps {
    from?: Location;
    to?: Location;
    trip?: Trip;
    showLocations?: boolean;
    viewport?: {
        center?: LatLng;
        zoom?: number;
    };
    bounds?: BBox;
    onclick?: (latLng: LatLng) => void;
    ondragend?: (from: boolean, latLng: LatLng) => void;
    onViewportChanged?: (viewport: {
        center?: LatLng;
        zoom?: number;
    }) => void;
    attributionControl?: boolean;
}
interface IState {
    mapLayers: Map<MapLocationType, Location[]>;
}
declare class ReactMap extends React.Component<IProps, IState> {
    private readonly ZOOM_ALL_LOCATIONS;
    private readonly ZOOM_PARENT_LOCATIONS;
    private leafletElement;
    private wasDoubleClick;
    constructor(props: Readonly<IProps>);
    private onMoveEnd;
    private onLocationsChanged;
    private refreshMapLocations;
    private isShowLocType;
    private getLocMarker;
    render(): React.ReactNode;
    componentWillMount(): void;
    componentDidMount(): void;
    fitBounds(bounds: BBox): void;
    alreadyFits(bounds: BBox): boolean;
    onResize(): void;
}
export default ReactMap;
