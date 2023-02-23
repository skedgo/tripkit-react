import * as React from "react";
import { Marker, Polyline, Popup, PolylineProps } from "react-leaflet";
import ServiceStopLocation from "../model/ServiceStopLocation";
import L from "leaflet";
import ServiceShape from "../model/trip/ServiceShape";
import { EventEmitter } from "fbemitter";
import { STOP_CLICKED_EVENT } from "../service/TKUIServiceView";
import { renderToStaticMarkup, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import { connect, mapperFromFunction } from "../config/TKConfigHelper";
import ServiceStopPopup from "./ServiceStopPopup";
import { ReactComponent as IconServiceStop } from "../images/ic-service-stop.svg";

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    shapes: ServiceShape[];
    color: string;
    toPolylineProps?: (shapes: ServiceShape[], color: string) => PolylineProps | PolylineProps[];
    id: string; // Since cannot pass key prop. See https://reactjs.org/warnings/special-props.html
    eventBus?: EventEmitter;
    travelledOnly?: boolean;
}

export interface IStyle { }

export type TKUIMapShapesProps = IProps;
export type TKUIMapShapesStyle = IStyle;

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> { }

export const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIMapShapes {...props} />,
    styles: {},
    classNamePrefix: "TKUIMapShapes"
};

class TKUIMapShapes extends React.Component<IProps, {}> {

    private stopToMarker: Map<ServiceStopLocation, L.Marker> = new Map<ServiceStopLocation, L.Marker>();

    constructor(props: IProps) {
        super(props);
        this.openPopup = this.openPopup.bind(this);
        if (props.eventBus) {
            props.eventBus.addListener(STOP_CLICKED_EVENT, this.openPopup)
        }
    }

    private openPopup(stop: ServiceStopLocation) {
        const marker = this.stopToMarker.get(stop);
        if (marker) {
            marker.openPopup();
        }
    }

    /**
     * Shapes to polylineProps
     */
    private toPolylineProps(shapes: ServiceShape[], color: string): PolylineProps | PolylineProps[] {
        const shapesToDisplay = this.props.travelledOnly ? shapes.filter(shape => shape.travelled) : shapes;
        return shapesToDisplay.map((shape: ServiceShape) => {
            return {
                positions: shape.waypoints,
                weight: 9,
                color: shape.travelled ? (this.props.theme.isDark ? "white" : "black") : "lightgray",
                opacity: shape.travelled ? 1 : .5,
            } as PolylineProps
        }).concat(shapesToDisplay.map((shape: ServiceShape) => {
            return {
                positions: shape.waypoints,
                weight: 7,
                color: shape.travelled ? color : "grey",
                opacity: shape.travelled ? 1 : .5,
            } as PolylineProps
        }));
    }

    public render(): React.ReactNode {
        const polylineOptions = this.props.toPolylineProps ? this.props.toPolylineProps(this.props.shapes, this.props.color) :
            this.toPolylineProps(this.props.shapes, this.props.color);
        const polylineOptionsArray = (polylineOptions.constructor === Array ? polylineOptions : [polylineOptions]) as PolylineProps[];
        const polylineArray = polylineOptionsArray
            .map((options: PolylineProps, i: number) => <Polyline {...options} key={this.props.id + "-" + i} />);
        const stopMarkers: any[] = [];
        if (this.props.shapes) {
            for (const shape of this.props.shapes) {
                if (shape.stops && (!this.props.travelledOnly || shape.travelled)) {
                    const stops = shape.stops.slice(1, shape.stops.length - 1);
                    stopMarkers.push(stops.map((stop: ServiceStopLocation, iStop: number) => {
                        const element =
                            <IconServiceStop style={{
                                color: shape.travelled ? this.props.color : "grey",
                                opacity: shape.travelled ? 1 : .5
                            }} />;
                        const iconHTML = renderToStaticMarkup(element);
                        const stopIcon = L.divIcon({
                            html: iconHTML,
                            className: "MapPolyline-stop"
                        });
                        return <Marker icon={stopIcon} position={stop} key={"stop-" + iStop}
                            ref={(elem: Marker | null) => {
                                if (elem) {
                                    this.stopToMarker.set(stop, elem.leafletElement);
                                }
                            }}
                            keyboard={false}
                        >
                            <Popup className={"ServiceStopPopup-popup"}
                                closeButton={false}
                                autoPan={false}
                            >
                                <ServiceStopPopup stop={stop} shape={shape} />
                            </Popup>
                        </Marker>
                    }));
                }
            }
        }
        return [polylineArray, stopMarkers];
    }
}

export default connect((config: TKUIConfig) => config.TKUIMapShapes, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));