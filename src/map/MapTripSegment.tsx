import * as React from "react";
import Segment from "../model/trip/Segment";
import {Marker, Popup, PolylineProps} from "react-leaflet";
import MapPolyline from "./MapPolyline";
import {Visibility} from "../model/trip/SegmentTemplate";
import L from "leaflet";
import LatLng from "../model/LatLng";
import {renderToStaticMarkup} from "react-dom/server";
import {IProps as SegmentPinIconProps} from "./SegmentPinIcon";
import {IProps as SegmentPopupProps} from "./SegmentPopup";
import {IProps as ServiceStopPopupProps} from "./ServiceStopPopup";

interface IProps {
    segment: Segment;
    ondragend?: (latLng: LatLng) => void;
    renderPinIcon: <P extends SegmentPinIconProps>(props: P) => JSX.Element;
    renderPopup: <P extends SegmentPopupProps>(props: P) => JSX.Element;
    polylineOptions: (segment: Segment) => PolylineProps | PolylineProps[];
    renderServiceStop: <P extends ServiceStopPopupProps>(props: P) => JSX.Element | undefined;
    renderServiceStopPopup: <P extends ServiceStopPopupProps>(props: P) => JSX.Element;
}

class MapTripSegment extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        const segment = this.props.segment;
        const transIconHTML = renderToStaticMarkup(this.props.renderPinIcon({segment: this.props.segment}));
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
                    {this.props.renderPopup({segment: segment})}
                </Popup>
            </Marker>,
            <MapPolyline segment={segment}
                         key={"map-polyline"}
                         polylineOptions={this.props.polylineOptions}
                         renderServiceStop={this.props.renderServiceStop}
                         renderServiceStopPopup={this.props.renderServiceStopPopup}
            />
        ]);
    }
}

export default MapTripSegment;