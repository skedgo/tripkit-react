import * as React from "react";
import Segment from "../model/trip/Segment";
import { PolylineProps } from "react-leaflet";
import { IProps as ServiceStopPopupProps } from "./ServiceStopPopup";
interface IProps {
    segment: Segment;
    polylineOptions: (segment: Segment) => PolylineProps | PolylineProps[];
    renderServiceStop: <P extends ServiceStopPopupProps>(props: P) => JSX.Element | undefined;
    renderServiceStopPopup: <P extends ServiceStopPopupProps>(props: P) => JSX.Element;
}
declare class MapPolyline extends React.Component<IProps, {}> {
    render(): React.ReactNode;
}
export default MapPolyline;
