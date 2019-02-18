import * as React from "react";
import Segment from "../model/trip/Segment";
import { PolylineProps } from "react-leaflet";
import LatLng from "../model/LatLng";
import { IProps as SegmentPinIconProps } from "./SegmentPinIcon";
import { IProps as SegmentPopupProps } from "./SegmentPopup";
import { IProps as ServiceStopPopupProps } from "./ServiceStopPopup";
interface IProps {
    segment: Segment;
    ondragend?: (latLng: LatLng) => void;
    renderPinIcon: <P extends SegmentPinIconProps>(props: P) => JSX.Element;
    renderPopup: <P extends SegmentPopupProps>(props: P) => JSX.Element;
    polylineOptions: (segment: Segment) => PolylineProps | PolylineProps[];
    renderServiceStop: <P extends ServiceStopPopupProps>(props: P) => JSX.Element | undefined;
    renderServiceStopPopup: <P extends ServiceStopPopupProps>(props: P) => JSX.Element;
}
declare class MapTripSegment extends React.Component<IProps, {}> {
    render(): React.ReactNode;
}
export default MapTripSegment;
