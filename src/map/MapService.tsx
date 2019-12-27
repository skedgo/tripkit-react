import React from "react";
import {Marker} from "react-leaflet";
import ServiceShape from "../model/trip/ServiceShape";
import {default as ShapesPolyline} from "./ShapesPolyline";
import ServiceDeparture from "../model/service/ServiceDeparture";
import {renderToStaticMarkup} from "react-dom/server";
import L from "leaflet";
import {IServiceResultsContext, ServiceResultsContext} from "../service/ServiceResultsProvider";
import {IMapSegmentRenderer} from "./TKUIMapView";

interface IProps {
    serviceDeparture: ServiceDeparture;
    renderer: IMapSegmentRenderer;
}

class MapService extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        const serviceDeparture = this.props.serviceDeparture;
        const transIconHTML = renderToStaticMarkup(this.props.renderer.renderPinIcon());
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
                <ServiceResultsContext.Consumer>
                    {(serviceContext: IServiceResultsContext) =>
                        <ShapesPolyline key={"map-polyline" + serviceDeparture.serviceTripID}
                                        id={"map-polyline" + serviceDeparture.serviceTripID}
                                        shapes={service.shapes!}
                                        polylineOptions={this.props.renderer.polylineOptions}
                                        renderServiceStop={this.props.renderer.renderServiceStop}
                                        renderServiceStopPopup={this.props.renderer.renderServiceStopPopup}
                                        eventBus={serviceContext.servicesEventBus}
                        />
                    }
                </ServiceResultsContext.Consumer> : undefined
        ]);
    }

    



}

export default MapService;