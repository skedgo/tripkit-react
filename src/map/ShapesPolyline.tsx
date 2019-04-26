import * as React from "react";
import {Marker, Polyline, Popup, PolylineProps} from "react-leaflet";
import ServiceStopLocation from "../model/ServiceStopLocation";
import L from "leaflet";
import {renderToStaticMarkup} from "react-dom/server";
import {IProps as ServiceStopPopupProps} from "./ServiceStopPopup";
import ServiceShape from "../model/trip/ServiceShape";

interface IProps {
    color: string;
    shapes: ServiceShape[];
    polylineOptions: (shapes: ServiceShape[], color: string) => PolylineProps | PolylineProps[];
    renderServiceStop: <P extends IServiceStopProps>(props: P) => JSX.Element | undefined;
    renderServiceStopPopup: <P extends ServiceStopPopupProps>(props: P) => JSX.Element;
    key: string;
}

interface IServiceStopProps {
    stop: ServiceStopLocation;
    shape: ServiceShape;
    color: string;
}

class ShapesPolyline extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        const polylineOptions = this.props.polylineOptions(this.props.shapes, this.props.color);
        const polylineOptionsArray = (polylineOptions.constructor === Array ? polylineOptions : [polylineOptions]) as PolylineProps[];
        const polylineArray = polylineOptionsArray
            .map((options: PolylineProps, i: number) => <Polyline {...options} key={this.props.key + "-" + i}/>);
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
                        return <Marker icon={stopIcon} position={stop} key={"stop-" + iStop}>
                            <Popup className={"ServiceStopPopup-popup"}
                                   closeButton={false}
                            >
                                {this.props.renderServiceStopPopup({
                                    stop: stop,
                                    shape: shape
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