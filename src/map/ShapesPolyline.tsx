import * as React from "react";
import {Marker, Polyline, Popup, PolylineProps} from "react-leaflet";
import ServiceStopLocation from "../model/ServiceStopLocation";
import L from "leaflet";
import {renderToStaticMarkup} from "react-dom/server";
import ServiceShape from "../model/trip/ServiceShape";
import {EventEmitter} from "fbemitter";
import {STOP_CLICKED_EVENT} from "../service/TKUIServiceView";

interface IProps {
    shapes: ServiceShape[];
    polylineOptions: PolylineProps | PolylineProps[];
    renderServiceStop: (stop: ServiceStopLocation, shape: ServiceShape) => JSX.Element | undefined;
    renderServiceStopPopup: (stop: ServiceStopLocation, shape: ServiceShape) => JSX.Element;
    id: string; // Since cannot pass key prop. See https://reactjs.org/warnings/special-props.html
    eventBus?: EventEmitter;
}

export interface IServiceStopProps {
    stop: ServiceStopLocation;
    shape: ServiceShape;
}

class ShapesPolyline extends React.Component<IProps, {}> {

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

    public render(): React.ReactNode {
        const polylineOptions = this.props.polylineOptions;
        const polylineOptionsArray = (polylineOptions.constructor === Array ? polylineOptions : [polylineOptions]) as PolylineProps[];
        const polylineArray = polylineOptionsArray
            .map((options: PolylineProps, i: number) => <Polyline {...options} key={this.props.id + "-" + i}/>);
        const stopMarkers: any[] = [];
        if (this.props.shapes) {
            for (const shape of this.props.shapes) {
                if (shape.stops) {
                    const stops = shape.stops.slice(1, shape.stops.length - 1);
                    stopMarkers.push(stops.map((stop: ServiceStopLocation, iStop: number) => {
                        const element = this.props.renderServiceStop(stop, shape);
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
                                   autoPan={false}
                            >
                                {this.props.renderServiceStopPopup(stop, shape)}
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