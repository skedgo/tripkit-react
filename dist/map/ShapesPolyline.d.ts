import * as React from "react";
import { PolylineProps } from "react-leaflet";
import ServiceStopLocation from "../model/ServiceStopLocation";
import ServiceShape from "../model/trip/ServiceShape";
import { EventEmitter } from "fbemitter";
interface IProps {
    shapes: ServiceShape[];
    polylineOptions: PolylineProps | PolylineProps[];
    renderServiceStop: (stop: ServiceStopLocation, shape: ServiceShape) => JSX.Element | undefined;
    renderServiceStopPopup: (stop: ServiceStopLocation, shape: ServiceShape) => JSX.Element;
    id: string;
    eventBus?: EventEmitter;
}
export interface IServiceStopProps {
    stop: ServiceStopLocation;
    shape: ServiceShape;
}
declare class ShapesPolyline extends React.Component<IProps, {}> {
    private stopToMarker;
    constructor(props: IProps);
    private openPopup;
    render(): React.ReactNode;
}
export default ShapesPolyline;
