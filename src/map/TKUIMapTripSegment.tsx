import React from "react";
import Segment from "../model/trip/Segment";
import { Marker, Popup } from "react-leaflet";
import { Visibility } from "../model/trip/SegmentTemplate";
import L from "leaflet";
import LatLng from "../model/LatLng";
import TKUIMapStreets from "./TKUIMapStreets";
import TKUIMapShapes from "./TKUIMapShapes";
import { TKUIMapViewClass } from "./TKUIMapView";
import TKUIRealtimeVehicle, { tKUIRealtimeVehicleConfig } from "./TKUIRealtimeVehicle";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import { TKUIConfigContext, TKUIThemeConsumer } from "../config/TKUIConfigProvider";
import { TKUITransportPin, tKUITransportPinConfig } from "./TKUITransportPin";
import { TKUITheme } from "../jss/TKUITheme";
import SegmentPopup from "./SegmentPopup";
import { renderToStaticMarkup, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { connect, mapperFromFunction, TKRenderOverride } from "../config/TKConfigHelper";

const tKUIMapTripSegmentDefaultStyle = (theme: TKUITheme) => ({
    main: {}
});

type IStyle = ReturnType<typeof tKUIMapTripSegmentDefaultStyle>;
interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    segment: Segment;
    ondragend?: (latLng: LatLng) => void;
    segmentIconClassName?: string;
    vehicleClassName?: string;
    onLocationAction?: () => void;
    onClick?: (segment: Segment) => void;
}
interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> { }

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <MapTripSegment {...props} />,
    styles: tKUIMapTripSegmentDefaultStyle,
    classNamePrefix: "TKUIMapTripSegment"
};

export type TKUIMapTripSegmentProps = IProps;
export type TKUIMapTripSegmentStyle = IStyle;

const MapTripSegment: React.FC<IProps> = ({ segment, ondragend, segmentIconClassName, vehicleClassName, t, onLocationAction, onClick, classes }) => {
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
                                        className: segmentIconClassName,
                                        iconSize: [40, 57],
                                        iconAnchor: [20, 57]
                                    });
                                    return <Marker
                                        icon={icon}
                                        position={segment.from}
                                        draggable={ondragend !== undefined}
                                        riseOnHover={segment.isFirst(Visibility.IN_SUMMARY)}
                                        ondragend={(event: L.DragEndEvent) => {
                                            if (ondragend) {
                                                const latLng = event.target.getLatLng();
                                                ondragend(LatLng.createLatLng(latLng.lat, latLng.lng));
                                            }
                                        }}
                                        keyboard={false}
                                        onclick={onClick ? () => onClick(segment) : undefined}
                                        className={classes.main}
                                    >
                                        <Popup
                                            offset={[0, -46]}
                                            closeButton={false}
                                            // TODO: disabled auto pan to fit popup on open since it messes with viewport
                                            // (generates infinite (or a lot) setState calls) since it seems the viewport
                                            // doesn't stabilizes. Fix it.
                                            autoPan={false}
                                        >
                                            {<SegmentPopup segment={segment} t={t} onLocationAction={onLocationAction} />}
                                        </Popup>
                                    </Marker>;
                                }
                                }
                            >
                                {TKUITransportPin.createForSegment(segment, theme.isDark)}
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
                                            className: vehicleClassName
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

export default connect((config: TKUIConfig) => config.TKUIMapTripSegment, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));