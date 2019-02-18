import * as React from "react";
import "./LeafletMap.css";
import { PolylineProps } from "react-leaflet";
import LatLng from "../model/LatLng";
import Location from "../model/Location";
import BBox from "../model/BBox";
import Trip from "../model/trip/Trip";
import Segment from "../model/trip/Segment";
import { MapLocationType } from "../model/location/MapLocationType";
import { IProps as SegmentPinIconProps } from "./SegmentPinIcon";
import { IProps as SegmentPopupProps } from "./SegmentPopup";
import { IProps as ServiceStopPopupProps } from "./ServiceStopPopup";
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
    renderSegmentPinIcon?: <P extends SegmentPinIconProps>(props: P) => JSX.Element;
    renderSegmentPopup?: <P extends SegmentPopupProps>(props: P) => JSX.Element;
    segmentPolylineOptions?: (segment: Segment) => PolylineProps | PolylineProps[];
    renderServiceStop?: <P extends ServiceStopPopupProps>(props: P) => JSX.Element | undefined;
    renderServiceStopPopup?: <P extends ServiceStopPopupProps>(props: P) => JSX.Element;
}
interface IState {
    mapLayers: Map<MapLocationType, Location[]>;
}
declare class LeafletMap extends React.Component<IProps, IState> {
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
export default LeafletMap;
