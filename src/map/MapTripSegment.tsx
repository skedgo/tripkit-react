import * as React from "react";
import Segment from "../model/trip/Segment";
import {Marker, Popup} from "react-leaflet";
import MapPolyline from "./MapPolyline";
import LeafletMap from "./LeafletMap";
import {Visibility} from "../model/trip/SegmentTemplate";
import L from "leaflet";
import SegmentPopup from "./SegmentPopup";
import LatLng from "../model/LatLng";

interface IProps {
    segment: Segment;
    ondragend?: (latLng: LatLng) => void;
}

class MapTripSegment extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        const segment = this.props.segment;
        const transIconHTML = LeafletMap.generatePinSVGMarkup(segment);
        const icon = L.divIcon({
            html: transIconHTML,
            className: "SegmentPinIcon-parent" + (segment.isFirst(Visibility.IN_SUMMARY)? " firstSegment" : (segment.arrival ? " arriveSegment" : "")),
            iconSize: [35, 35],
            iconAnchor: [17, 35]
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
                <Popup className={"ServiceStopPopup-popup"}
                       closeButton={false}
                       offset={[0, -25]}
                >
                    <SegmentPopup segment={segment}/>
                </Popup>
            </Marker>,
            <MapPolyline segment={segment} key={"map-polyline"}/>
        ]);
    }
}

export default MapTripSegment;