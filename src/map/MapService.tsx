import React from "react";
import {Marker, PolylineProps} from "react-leaflet";
import ServiceShape from "../model/trip/ServiceShape";
import {IProps as ServiceStopPopupProps} from "./ServiceStopPopup";
import {IServiceStopProps, default as ShapesPolyline} from "./ShapesPolyline";
import ServiceDeparture from "../model/service/ServiceDeparture";
import {renderToStaticMarkup} from "react-dom/server";
import L from "leaflet";
import {EventEmitter} from "fbemitter";

interface IProps {
    serviceDeparture: ServiceDeparture;
    renderPinIcon: (service: ServiceDeparture) => JSX.Element;
    shapePolylineOptions: (shapes: ServiceShape[], color: string) => PolylineProps | PolylineProps[];
    renderServiceStop: <P extends IServiceStopProps>(props: P) => JSX.Element | undefined;
    renderServiceStopPopup: <P extends ServiceStopPopupProps>(props: P) => JSX.Element;
    eventBus?: EventEmitter;
}

class MapService extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        const serviceDeparture = this.props.serviceDeparture;
        const transIconHTML = renderToStaticMarkup(this.props.renderPinIcon(serviceDeparture));
        const icon = L.divIcon({
            html: transIconHTML,
            className: "MapTripSegment-icon-container"
        });
        const service = serviceDeparture.serviceDetail!;
        const firstTravelledShape = service.shapes && service.shapes.find((shape: ServiceShape) => shape.travelled);
        const startStop = firstTravelledShape && firstTravelledShape.stops && firstTravelledShape.stops[0];
        return ([
            <Marker icon={icon} position={startStop!} key={"pin"}/>,
            service.shapes ?
                <ShapesPolyline key={"map-polyline" + serviceDeparture.serviceTripID}
                                id={"map-polyline" + serviceDeparture.serviceTripID}
                                color={serviceDeparture.serviceColor ? serviceDeparture.serviceColor.toHex() : "black"}
                                shapes={service.shapes}
                                polylineOptions={this.props.shapePolylineOptions}
                                renderServiceStop={this.props.renderServiceStop}
                                renderServiceStopPopup={this.props.renderServiceStopPopup}
                                eventBus={this.props.eventBus}
                /> : undefined
        ]);
    }

    



}

export default MapService;