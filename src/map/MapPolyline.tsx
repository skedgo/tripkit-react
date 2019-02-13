import * as React from "react";
import Segment from "../model/trip/Segment";
import {Marker, Polyline, Popup, PolylineProps} from "react-leaflet";
import ServiceStopLocation from "../model/ServiceStopLocation";
import L from "leaflet";
import {renderToStaticMarkup} from "react-dom/server";
import {IProps as ServiceStopPopupProps} from "./ServiceStopPopup";

interface IProps {
    segment: Segment;
    polylineOptions: (segment: Segment) => PolylineProps | PolylineProps[];
    renderServiceStop: <P extends ServiceStopPopupProps>(props: P) => JSX.Element | undefined;
    renderServiceStopPopup: <P extends ServiceStopPopupProps>(props: P) => JSX.Element;
}

class MapPolyline extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        const segment = this.props.segment;
        const polylineOptions = this.props.polylineOptions(segment);
        const polylineOptionsArray = (polylineOptions.constructor === Array ? polylineOptions : [polylineOptions]) as PolylineProps[];
        const polylineArray = polylineOptionsArray
            .map((options: PolylineProps, i: number) => <Polyline {...options} key={"polyline-" + segment.trip.getKey() + "-" + i}/>);
        const stopMarkers = [];
        if (segment.shapes) {
            for (const shape of segment.shapes) {
                if (shape.stops) {
                    const stops = shape.stops.slice(1, shape.stops.length - 1);
                    stopMarkers.push(stops.map((stop: ServiceStopLocation, iStop: number) => {
                        const element = this.props.renderServiceStop({
                                stop: stop,
                                shape: shape,
                                segment: this.props.segment
                            });
                        const iconHTML = element ? renderToStaticMarkup(element) : undefined;
                        if (!iconHTML) {
                            return undefined;
                        }
                        const stopIcon = L.divIcon({
                            html: iconHTML,
                            className: "MapPolyline-stop"
                        });
                        return <Marker icon={stopIcon} position={stop} key={"stop-" + iStop}>
                            <Popup className={"ServiceStopPopup-popup"}
                                   closeButton={false}
                            >
                                {this.props.renderServiceStopPopup({
                                    stop: stop,
                                    shape: shape,
                                    segment: segment
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

export default MapPolyline;