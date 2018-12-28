import * as React from "react";
import Segment from "../model/trip/Segment";
import {Marker, Popup} from "react-leaflet";
import MapPolyline from "./MapPolyline";
import {Visibility} from "../model/trip/SegmentTemplate";
import L from "leaflet";
import SegmentPopup from "./SegmentPopup";
import LatLng from "../model/LatLng";
import Constants from "../util/Constants";
import TransportUtil from "../trip/TransportUtil";
import {renderToStaticMarkup} from "react-dom/server";
import SegmentPinIcon from "./SegmentPinIcon";

interface IProps {
    segment: Segment;
    ondragend?: (latLng: LatLng) => void;
}

class MapTripSegment extends React.Component<IProps, {}> {

    private static generatePinSVGMarkup(segment: Segment): string {
        if (segment.arrival) {
            return renderToStaticMarkup(
                <SegmentPinIcon transIcon={Constants.absUrl("/images/map/ic-arrive-flag.svg")} color={"black"} onDark={true}/>
            )
        }
        const modeInfo = segment.modeInfo!;
        // On dark background if there is a suitable remote icon for dark background, or there is not
        // remote icon for light background, so will use a local icon for dark background.
        const onDark = modeInfo.remoteDarkIcon !== null || modeInfo.remoteIcon === null;
        const transIconUrl = TransportUtil.getTransportIcon(modeInfo, !!segment.realTime, onDark);
        return renderToStaticMarkup(
            <SegmentPinIcon transIcon={transIconUrl} color={segment.getColor()} onDark={onDark}/>
        )
    }

    public render(): React.ReactNode {
        const segment = this.props.segment;
        const transIconHTML = MapTripSegment.generatePinSVGMarkup(segment);
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