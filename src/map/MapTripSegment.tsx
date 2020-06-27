import * as React from "react";
import Segment from "../model/trip/Segment";
import {Marker, Popup} from "react-leaflet";
import {Visibility} from "../model/trip/SegmentTemplate";
import L from "leaflet";
import LatLng from "../model/LatLng";
import {renderToStaticMarkup} from "react-dom/server";
import StreetsPolyline from "./StreetsPolyline";
import ShapesPolyline from "./ShapesPolyline";
import {IMapSegmentRenderer, TKUIMapViewClass} from "./TKUIMapView";
import TKUIRealtimeVehicle from "./TKUIRealtimeVehicle";
import {TKUIConfig} from "../config/TKUIConfig";
import {TKUIConfigContext, default as TKUIConfigProvider, TKUIThemeConsumer} from "../config/TKUIConfigProvider";
import {TKUITransportPin} from "./TKUITransportPin";
import {TKUITheme} from "../jss/TKUITheme";

interface IProps {
    segment: Segment;
    ondragend?: (latLng: LatLng) => void;
    renderer: IMapSegmentRenderer;
    segmentIconClassName?: string;
    vehicleClassName?: string;
}

class MapTripSegment extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        const segment = this.props.segment;
        return (
            <TKUIThemeConsumer>
                {(theme: TKUITheme) =>
                    <TKUIConfigContext.Consumer>
                        {(config: TKUIConfig) => {
                            const transIconHTML = renderToStaticMarkup(
                                <TKUIConfigProvider config={config}>
                                    {TKUITransportPin.createForSegment(this.props.segment, theme.isDark)}
                                </TKUIConfigProvider>
                            );
                            const icon = L.divIcon({
                                html: transIconHTML,
                                className: this.props.segmentIconClassName,
                                iconSize: [40, 62],
                                iconAnchor: [20, 62]
                            });
                            return [
                                segment.hasVisibility(Visibility.ON_MAP) &&
                                <Marker icon={icon} position={segment.from} key={"pin"}
                                        draggable={this.props.ondragend !== undefined}
                                        riseOnHover={segment.isFirst(Visibility.IN_SUMMARY)}
                                        ondragend={(event: L.DragEndEvent) => {
                                            if (this.props.ondragend) {
                                                const latLng = event.target.getLatLng();
                                                this.props.ondragend(LatLng.createLatLng(latLng.lat, latLng.lng));
                                            }
                                        }}
                                >
                                    {this.props.renderer.renderPopup &&
                                    <Popup offset={[0, -46]}
                                           closeButton={false}
                                    >
                                        {this.props.renderer.renderPopup()}
                                    </Popup>
                                    }
                                </Marker>,
                                segment.shapes ?
                                    <ShapesPolyline key={"map-polyline" + segment.trip.getKey() + segment.id}
                                                    id={"map-polyline" + segment.trip.getKey() + segment.id}
                                                    shapes={segment.shapes}
                                                    polylineOptions={this.props.renderer.polylineOptions}
                                                    renderServiceStop={this.props.renderer.renderServiceStop}
                                                    renderServiceStopPopup={this.props.renderer.renderServiceStopPopup}
                                    /> :
                                    segment.streets ?
                                        <StreetsPolyline key={"map-polyline" + segment.trip.getKey() + segment.id}
                                                         id={"map-polyline" + segment.trip.getKey() + segment.id}
                                                         color={segment.isWalking() ? "#20ce6e" : segment.getColor()}
                                                         modeInfo={segment.modeInfo}
                                                         streets={segment.streets}
                                                         polylineOptions={this.props.renderer.polylineOptions}

                                        /> : undefined,
                                segment.realtimeVehicle &&
                                // (DateTimeUtil.getNow().valueOf() / 1000 - segment.realtimeVehicle.lastUpdate) < 120 &&
                                <Marker position={segment.realtimeVehicle.location}
                                        key={"vehicle"}
                                        icon={L.divIcon({
                                            html: renderToStaticMarkup(
                                                <TKUIConfigProvider config={config}>
                                                    <TKUIRealtimeVehicle
                                                        value={segment.realtimeVehicle}
                                                        label={segment.serviceNumber || undefined}
                                                        color={segment.serviceColor || undefined}
                                                    />
                                                </TKUIConfigProvider>
                                            ),
                                            iconSize: [40, 40],
                                            iconAnchor: [20, 20],
                                            className: this.props.vehicleClassName
                                        })}
                                        riseOnHover={true}
                                >
                                    {segment.modeInfo && segment.serviceNumber &&
                                    TKUIMapViewClass.getPopup(segment.realtimeVehicle, segment.modeInfo.alt + " " + segment.serviceNumber)}
                                </Marker>
                            ];
                        }}
                    </TKUIConfigContext.Consumer>
                }
            </TKUIThemeConsumer>
        );
    }
}

export default MapTripSegment;