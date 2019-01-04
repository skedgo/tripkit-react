import * as React from "react";
import Segment from "../model/trip/Segment";
import {Marker, Polyline, Popup, PolylineProps} from "react-leaflet";
import Street from "../model/trip/Street";
import ServiceShape from "../model/trip/ServiceShape";
import ServiceStopLocation from "../model/ServiceStopLocation";
import IconServiceStop from "-!svg-react-loader!../images/ic-service-stop.svg";
import L from "leaflet";
import {renderToStaticMarkup} from "react-dom/server";
import {IProps as ServiceStopPopupProps} from "./ServiceStopPopup";

interface IProps {
    segment: Segment;
    shapePolylineOptions: (shape: ServiceShape, segment: Segment) => PolylineProps | PolylineProps[] | undefined;
    streetPolylineOptions: (street: Street, segment: Segment) => PolylineProps | PolylineProps[];
    renderServiceStopPopup: <P extends ServiceStopPopupProps>(props: P) => JSX.Element;
}

class MapPolyline extends React.Component<IProps, {}> {

    private static generateServiceStopSVGMarkup(color: string, opacity: number): string {
        return renderToStaticMarkup(
            <IconServiceStop style={{color: color, opacity: opacity}}/>
        )
    }

    public render(): React.ReactNode {
        const segment = this.props.segment;
        if (segment.shapes) {
            const shapes = segment.shapes;
            return shapes.map((shape: ServiceShape, i: number) => {
                const shapePolylineOptions = this.props.shapePolylineOptions(shape, segment);
                if (!shapePolylineOptions) {
                    return null;
                }
                const shapePolylineOptionsArray = shapePolylineOptions.constructor === Array ? shapePolylineOptions : [shapePolylineOptions];
                const polylineArray = (shapePolylineOptionsArray as PolylineProps[]).map(
                    (options: PolylineProps) => <Polyline {...options} key={"polyline-" + i}/>);
                let stopMarkers;
                if (shape.stops) {
                    const stops = shape.stops.slice(1, shape.stops.length - 1);
                    stopMarkers = stops.map((stop: ServiceStopLocation, iStop: number) => {
                        const stopIcon = L.divIcon({
                            html: MapPolyline.generateServiceStopSVGMarkup(shape.travelled ?
                                segment.getColor() : "grey", shape.travelled ? 1 : .5),
                            className: "SegmentPolyline-stop"
                        });
                        return <Marker icon={stopIcon} position={stop} key={"stop-" + iStop}>
                            <Popup className={"ServiceStopPopup-popup"}
                                   closeButton={false}
                            >
                                {this.props.renderServiceStopPopup({
                                    stop: stop,
                                    segment: segment
                                })}
                            </Popup>
                        </Marker>
                    })
                }
                return [polylineArray, stopMarkers];
            });
        } else if (segment.streets) {
             return segment.streets.map((street: Street, i: number) => {
                 const streetPolylineOptions = this.props.streetPolylineOptions(street, segment);
                 const streetPolylineOptionsArray = streetPolylineOptions.constructor === Array ? streetPolylineOptions : [streetPolylineOptions];
                 const polylineArray = (streetPolylineOptionsArray as PolylineProps[]).map(
                     (options: PolylineProps) => <Polyline {...options} key={"polyline-" + i}/>);
                 return polylineArray;
                }
            )
        } else {
            return null;
        }
    }
}

export default MapPolyline;