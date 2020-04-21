import * as React from "react";
import Segment from "../model/trip/Segment";
import LatLng from "../model/LatLng";
import { IMapSegmentRenderer } from "./TKUIMapView";
interface IProps {
    segment: Segment;
    ondragend?: (latLng: LatLng) => void;
    renderer: IMapSegmentRenderer;
    segmentIconClassName?: string;
    vehicleClassName?: string;
}
declare class MapTripSegment extends React.Component<IProps, {}> {
    render(): React.ReactNode;
}
export default MapTripSegment;
