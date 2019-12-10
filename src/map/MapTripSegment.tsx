import * as React from "react";
import Segment from "../model/trip/Segment";
import {Marker, Popup} from "react-leaflet";
import {Visibility} from "../model/trip/SegmentTemplate";
import L from "leaflet";
import LatLng from "../model/LatLng";
import {renderToStaticMarkup} from "react-dom/server";
import StreetsPolyline from "./StreetsPolyline";
import ShapesPolyline from "./ShapesPolyline";
import {IMapSegmentRenderer} from "./TKUIMapView";

interface IProps {
    segment: Segment;
    ondragend?: (latLng: LatLng) => void;
    renderer: IMapSegmentRenderer;
}

class MapTripSegment extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        const segment = this.props.segment;
        const transIconHTML = renderToStaticMarkup(this.props.renderer.renderPinIcon());
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
                { this.props.renderer.renderPopup &&
                <Popup className={"MapTripSegment-popup"}
                       closeButton={false}
                >
                    {this.props.renderer.renderPopup()}
                </Popup>
                }
            </Marker>,
            segment.shapes ?
                <ShapesPolyline key={"map-polyline" + segment.trip.getKey()}
                                id={"map-polyline" + segment.trip.getKey()}
                                color={segment.getColor()}
                                modeInfo={segment.modeInfo}
                                shapes={segment.shapes}
                                polylineOptions={this.props.renderer.polylineOptions}
                                renderServiceStop={this.props.renderer.renderServiceStop}
                                renderServiceStopPopup={this.props.renderer.renderServiceStopPopup}
                /> :
                segment.streets ?
                    <StreetsPolyline key={"map-polyline" + segment.trip.getKey()}
                                     id={"map-polyline" + segment.trip.getKey()}
                                     color={segment.isWalking() ? "#20ce6e" : segment.getColor()}
                                     modeInfo={segment.modeInfo}
                                     streets={segment.streets}
                                     polylineOptions={this.props.renderer.polylineOptions}

                    /> : undefined
        ]);
    }
}

export default MapTripSegment;