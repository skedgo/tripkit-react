import * as React from "react";
import Segment from "../model/trip/Segment";
import {Marker, Polyline, Popup} from "react-leaflet";
import Street from "../model/trip/Street";
import ServiceShape from "../model/trip/ServiceShape";
import ServiceStopLocation from "../model/ServiceStopLocation";
import IconServiceStop from "-!svg-react-loader!../images/ic-service-stop.svg";
import L from "leaflet";
import ServiceStopPopup from "./ServiceStopPopup";
import {renderToStaticMarkup} from "react-dom/server";

interface IProps {
    segment: Segment;
    showNotTravelled?: boolean;
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
                if (!this.props.showNotTravelled && !shape.travelled) {
                    return null;
                }
                const options = {
                    weight: 6,
                    color: shape.travelled ? segment.getColor() : "grey",
                    opacity: shape.travelled ? 1 : .5
                };
                const polyline = <Polyline positions={shape.waypoints!} {...options} key={"polyline-" + i}/>;
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
                                <ServiceStopPopup stop={stop} color={segment.getColor()}/>
                            </Popup>
                        </Marker>
                    })
                }
                return [polyline, stopMarkers];
            });
        } else if (segment.streets) {
             return segment.streets.map((street: Street, i: number) => {
                    const options = {
                        weight: 6,
                        color: segment.getColor(),
                        dashArray: segment.isWalking() ? "5,10" : undefined,
                        // opacity: !this.segment.isBicycle() || street.safe ? 1 : .3
                        opacity: 1  // Disable safe distinction for now
                    };
                    return <Polyline positions={street.waypoints!} {...options} key={"polyline-" + i}/>
                }
            )
        } else {
            return null;
        }
    }
}

export default MapPolyline;