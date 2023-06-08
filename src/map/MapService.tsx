import React from "react";
import { Marker } from "react-leaflet";
import ServiceShape from "../model/trip/ServiceShape";
import TKUIMapShapes from "./TKUIMapShapes";
import ServiceDeparture from "../model/service/ServiceDeparture";
import L from "leaflet";
import { IServiceResultsContext, ServiceResultsContext } from "../service/ServiceResultsProvider";
import { TKUIConfig } from "../config/TKUIConfig";
import { TKUIConfigContext, TKUIThemeConsumer } from "../config/TKUIConfigProvider";
import { TKUITransportPin, tKUITransportPinConfig } from "./TKUITransportPin";
import { TKUITheme } from "../jss/TKUITheme";
import TransportUtil from "../trip/TransportUtil";
import { renderToStaticMarkup } from "../jss/StyleHelper";
import { TKRenderOverride } from "../config/TKConfigHelper";

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
            <TKUIThemeConsumer>
                {(theme: TKUITheme) =>
                    <TKUIConfigContext.Consumer>
                        {(config: TKUIConfig) => {
                            const marker =
                                <TKRenderOverride
                                    componentKey={"TKUITransportPin"}
                                    renderOverride={renderProps => {
                                        const render = config["TKUITransportPin"]?.render ?? tKUITransportPinConfig.render;
                                        const transIconHTML = renderToStaticMarkup(render(renderProps));
                                        const icon = L.divIcon({
                                            html: transIconHTML,
                                            className: this.props.segmentIconClassName,
                                            iconSize: [40, 62],
                                            iconAnchor: [20, 62]
                                        });
                                        return <Marker icon={icon} position={startStop!} keyboard={false} />;
                                    }}
                                    key={"pin"}
                                >
                                    {TKUITransportPin.createForService(this.props.serviceDeparture, theme.isDark)}
                                </TKRenderOverride>;
                            let color = TransportUtil.getServiceDepartureColor(serviceDeparture);
                            if (!color) {
                                color = "black";
                            }
                            return [
                                marker,
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
                }
            </TKUIThemeConsumer>
        )
    }
}

export default MapService;