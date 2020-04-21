import * as React from "react";
import { PolylineProps } from "react-leaflet";
import L from "leaflet";
import LatLng from "../model/LatLng";
import Location from "../model/Location";
import BBox from "../model/BBox";
import Trip from "../model/trip/Trip";
import Segment from "../model/trip/Segment";
import { MapLocationType } from "../model/location/MapLocationType";
import ServiceShape from "../model/trip/ServiceShape";
import ServiceDeparture from "../model/service/ServiceDeparture";
import ServiceStopLocation from "../model/ServiceStopLocation";
import { CSSProps, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { TKUIConfig } from "../config/TKUIConfig";
import "./TKUIMapViewCss.css";
import { TKUIViewportUtilProps } from "../util/TKUIResponsiveUtil";
import RealTimeVehicle from "../model/service/RealTimeVehicle";
import { TKUserPosition } from "../util/GeolocationUtil";
export declare type TKUIMapPadding = {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
};
interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    hideLocations?: boolean;
    bounds?: BBox;
    padding?: TKUIMapPadding;
    children: any;
    attributionControl?: boolean;
    segmentRenderer?: (segment: Segment) => IMapSegmentRenderer;
    serviceRenderer?: (service: ServiceDeparture) => IMapSegmentRenderer;
    onLocAction?: (locType: MapLocationType, loc: Location) => void;
}
export interface IStyle {
    main: CSSProps<IProps>;
    leaflet: CSSProps<IProps>;
    menuPopup: CSSProps<IProps>;
    menuPopupContent: CSSProps<IProps>;
    menuPopupItem: CSSProps<IProps>;
    menuPopupBelow: CSSProps<IProps>;
    menuPopupAbove: CSSProps<IProps>;
    menuPopupLeft: CSSProps<IProps>;
    menuPopupRight: CSSProps<IProps>;
    currentLocMarker: CSSProps<IProps>;
    currentLocBtn: CSSProps<IProps>;
    currentLocBtnLandscape: CSSProps<IProps>;
    currentLocBtnPortrait: CSSProps<IProps>;
    resolvingCurrLoc: CSSProps<IProps>;
    vehicle: CSSProps<IProps>;
    segmentIconClassName: CSSProps<IProps>;
    vehicleClassName: CSSProps<IProps>;
}
interface IConsumedProps extends TKUIViewportUtilProps {
    from?: Location;
    to?: Location;
    trip?: Trip;
    service?: ServiceDeparture;
    onClick?: (latLng: LatLng) => void;
    onDragEnd?: (from: boolean, latLng: LatLng) => void;
    viewport?: {
        center?: LatLng;
        zoom?: number;
    };
    onViewportChange?: (viewport: {
        center?: LatLng;
        zoom?: number;
    }) => void;
    directionsView?: boolean;
    onDirectionsFrom: (latLng: LatLng) => void;
    onDirectionsTo: (latLng: LatLng) => void;
    onWhatsHere: (latLng: LatLng) => void;
    config: TKUIConfig;
}
interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> {
}
export declare type TKUIMapViewProps = IProps;
export declare type TKUIMapViewStyle = IStyle;
interface IState {
    mapLayers: Map<MapLocationType, Location[]>;
    menuPopupPosition?: L.LeafletMouseEvent;
    userLocation?: TKUserPosition;
    userLocationTooltip?: string;
}
export interface IMapSegmentRenderer {
    renderPopup?: () => JSX.Element;
    polylineOptions: PolylineProps | PolylineProps[];
    renderServiceStop: (stop: ServiceStopLocation, shape: ServiceShape) => JSX.Element | undefined;
    renderServiceStopPopup: (stop: ServiceStopLocation, shape: ServiceShape) => JSX.Element;
}
declare class TKUIMapView extends React.Component<IProps, IState> {
    private leafletElement?;
    private wasDoubleClick;
    private userLocTooltipRef?;
    constructor(props: Readonly<IProps>);
    private onMoveEnd;
    /**
     * if color === null show friendliness (which makes sense for bicycle and wheelchair segments)
     */
    private streetsRenderer;
    private shapesRenderer;
    private checkFitLocation;
    private fitMap;
    private onViewportChange;
    private userLocationSubscription?;
    private onTrackUserLocation;
    private showUserLocTooltip;
    private currentLocation;
    render(): React.ReactNode;
    static getPopup(realTimeVehicle: RealTimeVehicle, title: string): JSX.Element;
    private getLocationPopup;
    componentDidMount(): void;
    componentDidUpdate(prevProps: IProps): void;
    fitBounds(bounds: BBox): void;
    alreadyFits(bounds: BBox): boolean;
    onResize(): void;
}
declare const _default: (props: IClientProps) => JSX.Element;
export default _default;
export { TKUIMapView as TKUIMapViewClass };
