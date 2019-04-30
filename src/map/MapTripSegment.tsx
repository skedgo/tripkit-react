import * as React from "react";
import Segment from "../model/trip/Segment";
import {Marker, Popup, PolylineProps} from "react-leaflet";
import {IServiceStopProps} from "./ShapesPolyline";
import {Visibility} from "../model/trip/SegmentTemplate";
import L from "leaflet";
import LatLng from "../model/LatLng";
import {renderToStaticMarkup} from "react-dom/server";
import {IProps as ServiceStopPopupProps} from "./ServiceStopPopup";
import Street from "../model/trip/Street";
import ServiceShape from "../model/trip/ServiceShape";
import StreetsPolyline from "./StreetsPolyline";
import ShapesPolyline from "./ShapesPolyline";
import ModeInfo from "../model/trip/ModeInfo";

interface IProps {
    segment: Segment;
    ondragend?: (latLng: LatLng) => void;
    renderPinIcon: (segment: Segment) => JSX.Element;
    renderPopup: (segment: Segment) => JSX.Element;
    shapePolylineOptions: (shapes: ServiceShape[], color: string) => PolylineProps | PolylineProps[];
    streetPolylineOptions: (streets: Street[], color: string, modeInfo?: ModeInfo) => PolylineProps | PolylineProps[];
    renderServiceStop: (props: IServiceStopProps) => JSX.Element | undefined;
    renderServiceStopPopup: (props: ServiceStopPopupProps) => JSX.Element;
}

class MapTripSegment extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        const segment = this.props.segment;
        const transIconHTML = renderToStaticMarkup(this.props.renderPinIcon(segment));
        const icon = L.divIcon({
            html: transIconHTML,
            className: "MapTripSegment-icon-container" + (segment.isFirst(Visibility.IN_SUMMARY)? " firstSegment" : (segment.arrival ? " arriveSegment" : ""))
        });
        return ([
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
                <Popup className={"MapTripSegment-popup"}
                       closeButton={false}
                >
                    {this.props.renderPopup(segment)}
                </Popup>
            </Marker>,
            segment.shapes ?
                <ShapesPolyline key={"map-polyline" + segment.trip.getKey()}
                                id={"map-polyline" + segment.trip.getKey()}
                                color={segment.getColor()}
                                modeInfo={segment.modeInfo}
                                shapes={segment.shapes}
                                polylineOptions={this.props.shapePolylineOptions}
                                renderServiceStop={this.props.renderServiceStop}
                                renderServiceStopPopup={this.props.renderServiceStopPopup}
                /> :
                segment.streets ?
                    <StreetsPolyline key={"map-polyline" + segment.trip.getKey()}
                                     id={"map-polyline" + segment.trip.getKey()}
                                     color={segment.isWalking() ? "#20ce6e" : segment.getColor()}
                                     modeInfo={segment.modeInfo}
                                     streets={segment.streets}
                                     polylineOptions={this.props.streetPolylineOptions}
                    /> : undefined
        ]);
    }
}

export default MapTripSegment;