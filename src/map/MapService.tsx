import React from "react";
import {Marker} from "react-leaflet";
import ServiceShape from "../model/trip/ServiceShape";
import TKUIMapShapes from "./TKUIMapShapes";
import ServiceDeparture from "../model/service/ServiceDeparture";
import L from "leaflet";
import {IServiceResultsContext, ServiceResultsContext} from "../service/ServiceResultsProvider";
import {TKUIConfig} from "../config/TKUIConfig";
import {TKUIConfigContext, default as TKUIConfigProvider, TKUIThemeConsumer} from "../config/TKUIConfigProvider";
import {TKUITransportPin} from "./TKUITransportPin";
import {TKUITheme} from "../jss/TKUITheme";
import TransportUtil from "../trip/TransportUtil";
import { renderToStaticMarkup } from "../jss/StyleHelper";

interface IProps {
    serviceDeparture: ServiceDeparture;
    segmentIconClassName?: string;
}

class MapService extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        const serviceDeparture = this.props.serviceDeparture;
        const service = serviceDeparture.serviceDetail!;
        const firstTravelledShape = service.shapes && service.shapes.find((shape: ServiceShape) => shape.travelled);
        const startStop = firstTravelledShape && firstTravelledShape.stops && firstTravelledShape.stops[0];
        return (
            <TKUIConfigContext.Consumer>
                {(config: TKUIConfig) => {
                    const transIconHTML = renderToStaticMarkup(
                        <TKUIConfigProvider config={config}>
                            <TKUIThemeConsumer>
                                {(theme: TKUITheme) =>
                                TKUITransportPin.createForService(this.props.serviceDeparture, theme.isDark)}
                            </TKUIThemeConsumer>
                        </TKUIConfigProvider>
                    );
                    const icon = L.divIcon({
                        html: transIconHTML,
                        className: this.props.segmentIconClassName,
                        iconSize: [40, 62],
                        iconAnchor: [20, 62]
                    });
                    let color = TransportUtil.getServiceDepartureColor(serviceDeparture);
                    if (!color) {
                        color = "black";
                    }
                    return [
                        <Marker icon={icon} position={startStop!} key={"pin"} keyboard={false}/>,
                        service.shapes ?
                            <ServiceResultsContext.Consumer
                                key={"map-polyline" + serviceDeparture.serviceTripID}
                            >
                                {(serviceContext: IServiceResultsContext) =>
                                    <TKUIMapShapes id={"map-polyline" + serviceDeparture.serviceTripID}
                                                   color={color}
                                                   shapes={service.shapes!}
                                                   eventBus={serviceContext.servicesEventBus}
                                    />
                                }
                            </ServiceResultsContext.Consumer> : undefined
                    ];
                }}
            </TKUIConfigContext.Consumer>
        );
    }

    



}

export default MapService;