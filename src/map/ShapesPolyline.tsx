import * as React from "react";
import {Marker, Polyline, Popup, PolylineProps} from "react-leaflet";
import ServiceStopLocation from "../model/ServiceStopLocation";
import L from "leaflet";
import {renderToStaticMarkup} from "react-dom/server";
import {IProps as ServiceStopPopupProps} from "./ServiceStopPopup";
import ServiceShape from "../model/trip/ServiceShape";
import {EventEmitter} from "fbemitter";
import ServiceDetailView from "../service/ServiceDetailView";
import ModeInfo from "../model/trip/ModeInfo";

interface IProps {
    color: string;
    modeInfo?: ModeInfo;
    shapes: ServiceShape[];
    polylineOptions: (shapes: ServiceShape[], color: string) => PolylineProps | PolylineProps[];
    renderServiceStop: (props: IServiceStopProps) => JSX.Element | undefined;
    renderServiceStopPopup: (props: ServiceStopPopupProps) => JSX.Element;
    id: string; // Since cannot pass key prop. See https://reactjs.org/warnings/special-props.html
    eventBus?: EventEmitter;
}

interface IServiceStopProps {
    stop: ServiceStopLocation;
    shape: ServiceShape;
    color: string;
}

class ShapesPolyline extends React.Component<IProps, {}> {

    private stopToMarker: Map<ServiceStopLocation, L.Marker> = new Map<ServiceStopLocation, L.Marker>();

    constructor(props: IProps) {
        super(props);
        this.openPopup = this.openPopup.bind(this);
        if (props.eventBus) {
            props.eventBus.addListener(ServiceDetailView.STOP_CLICKED_EVENT, this.openPopup)
        }
    }

    private openPopup(stop: ServiceStopLocation) {
        const marker = this.stopToMarker.get(stop);
        if (marker) {
            marker.openPopup();
        }
    }

    public render(): React.ReactNode {
        const polylineOptions = this.props.polylineOptions(this.props.shapes, this.props.color);
        const polylineOptionsArray = (polylineOptions.constructor === Array ? polylineOptions : [polylineOptions]) as PolylineProps[];
        const polylineArray = polylineOptionsArray
            .map((options: PolylineProps, i: number) => <Polyline {...options} key={this.props.id + "-" + i}/>);
        const stopMarkers = [];
        if (this.props.shapes) {
            for (const shape of this.props.shapes) {
                if (shape.stops) {
                    const stops = shape.stops.slice(1, shape.stops.length - 1);
                    stopMarkers.push(stops.map((stop: ServiceStopLocation, iStop: number) => {
                        const element = this.props.renderServiceStop({
                                stop: stop,
                                shape: shape,
                                color: this.props.color
                            });
                        const iconHTML = element ? renderToStaticMarkup(element) : undefined;
                        if (!iconHTML) {
                            return undefined;
                        }
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
                        >
                            <Popup className={"ServiceStopPopup-popup"}
                                   closeButton={false}
                            >
                                {this.props.renderServiceStopPopup({
                                    stop: stop,
                                    shape: shape,
                                    color: this.props.color,
                                    modeInfo: this.props.modeInfo
                                })}
                            </Popup>
                        </Marker>
                    }));
                }
            }
        }
        return [polylineArray, stopMarkers];
    }
}

export default ShapesPolyline;
export {IServiceStopProps};