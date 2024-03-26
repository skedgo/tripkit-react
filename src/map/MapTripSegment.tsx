import * as React from "react";
import Segment from "../model/trip/Segment";
import { Marker, Popup } from "react-leaflet";
import { Visibility } from "../model/trip/SegmentTemplate";
import L from "leaflet";
import LatLng from "../model/LatLng";
import TKUIMapStreets from "./TKUIMapStreets";
import TKUIMapShapes from "./TKUIMapShapes";
import { TKUIMapViewClass } from "./TKUIMapView";
import TKUIRealtimeVehicle, { tKUIRealtimeVehicleConfig } from "./TKUIRealtimeVehicle";
import { TKUIConfig } from "../config/TKUIConfig";
import { TKUIConfigContext, TKUIThemeConsumer } from "../config/TKUIConfigProvider";
import { TKUITransportPin, tKUITransportPinConfig } from "./TKUITransportPin";
import { TKUITheme } from "../jss/TKUITheme";
import SegmentPopup from "./SegmentPopup";
import { TranslationFunction } from "../i18n/TKI18nProvider";
import { renderToStaticMarkup } from "../jss/StyleHelper";
import { TKRenderOverride } from "../config/TKConfigHelper";

interface IProps {
    segment: Segment;
    ondragend?: (latLng: LatLng) => void;
    segmentIconClassName?: string;
    vehicleClassName?: string;
    t: TranslationFunction;
    onLocationAction?: () => void;
}

class MapTripSegment extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        const segment = this.props.segment;
        return (
            <TKUIThemeConsumer>
                {(theme: TKUITheme) =>
                    <TKUIConfigContext.Consumer>
                        {(config: TKUIConfig) => {
                            return [
                                segment.hasVisibility(Visibility.ON_MAP) &&
                                <TKRenderOverride
                                    key={"pin"}
                                    componentKey={"TKUITransportPin"}
                                    renderOverride={renderProps => {
                                        const render = config["TKUITransportPin"]?.render ?? tKUITransportPinConfig.render;
                                        const transIconHTML = renderToStaticMarkup(render(renderProps, tKUITransportPinConfig.render));
                                        const icon = L.divIcon({
                                            html: transIconHTML,
                                            className: this.props.segmentIconClassName,
                                            iconSize: [40, 62],
                                            iconAnchor: [20, 62]
                                        });
                                        return <Marker
                                            icon={icon}
                                            position={segment.from}
                                            draggable={this.props.ondragend !== undefined}
                                            riseOnHover={segment.isFirst(Visibility.IN_SUMMARY)}
                                            ondragend={(event: L.DragEndEvent) => {
                                                if (this.props.ondragend) {
                                                    const latLng = event.target.getLatLng();
                                                    this.props.ondragend(LatLng.createLatLng(latLng.lat, latLng.lng));
                                                }
                                            }}
                                            keyboard={false}
                                        >
                                            <Popup
                                                offset={[0, -46]}
                                                closeButton={false}
                                                // TODO: disabled auto pan to fit popup on open since it messes with viewport
                                                // (generates infinite (or a lot) setState calls) since it seems the viewport
                                                // doesn't stabilizes. Fix it.
                                                autoPan={false}
                                            >
                                                {<SegmentPopup segment={segment} t={this.props.t} onLocationAction={this.props.onLocationAction} />}
                                            </Popup>
                                        </Marker>;
                                    }
                                    }
                                >
                                    {TKUITransportPin.createForSegment(this.props.segment, theme.isDark)}
                                </TKRenderOverride>,
                                segment.shapes ?
                                    <TKUIMapShapes key={"map-polyline" + segment.trip.getKey() + segment.id}
                                        id={"map-polyline" + segment.trip.getKey() + segment.id}
                                        shapes={segment.shapes}
                                        color={segment.getColor()}
                                    /> :
                                    segment.streets ?
                                        <TKUIMapStreets key={"map-polyline" + segment.trip.getKey() + segment.id}
                                            id={"map-polyline" + segment.trip.getKey() + segment.id}
                                            color={(segment.isWalking() || segment.isBicycle() || segment.isWheelchair())
                                                && segment.streets?.some(street => street.roadTags.length > 0) ?
                                                undefined : segment.getColor()}
                                            modeInfo={segment.modeInfo}
                                            streets={segment.streets}

                                        /> : undefined,
                                segment.realtimeVehicle &&
                                // (DateTimeUtil.getNow().valueOf() / 1000 - segment.realtimeVehicle.lastUpdate) < 120 &&
                                <TKRenderOverride
                                    key={"vehicle"}
                                    componentKey={"TKUIRealtimeVehicle"}
                                    renderOverride={renderProps => {
                                        const render = config["TKUIRealtimeVehicle"]?.render ?? tKUIRealtimeVehicleConfig.render;
                                        return <Marker
                                            position={segment.realtimeVehicle!.location}
                                            icon={L.divIcon({
                                                html: renderToStaticMarkup(render(renderProps, tKUIRealtimeVehicleConfig.render)),
                                                iconSize: [40, 40],
                                                iconAnchor: [20, 20],
                                                className: this.props.vehicleClassName
                                            })}
                                            riseOnHover={true}
                                            keyboard={false}
                                        >
                                            {segment.modeInfo && segment.serviceNumber &&
                                                TKUIMapViewClass.getPopup(segment.realtimeVehicle!, segment.modeInfo.alt + " " + segment.serviceNumber)}
                                        </Marker>;
                                    }}
                                >
                                    <TKUIRealtimeVehicle
                                        value={segment.realtimeVehicle}
                                        label={segment.serviceNumber || undefined}
                                        color={segment.serviceColor || undefined}
                                    />
                                </TKRenderOverride>
                            ];
                        }}
                    </TKUIConfigContext.Consumer>
                }
            </TKUIThemeConsumer>
        );
    }
}

export default MapTripSegment;