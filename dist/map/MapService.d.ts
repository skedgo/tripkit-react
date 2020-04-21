import React from "react";
import ServiceDeparture from "../model/service/ServiceDeparture";
import { IMapSegmentRenderer } from "./TKUIMapView";
interface IProps {
    serviceDeparture: ServiceDeparture;
    renderer: IMapSegmentRenderer;
    segmentIconClassName?: string;
}
declare class MapService extends React.Component<IProps, {}> {
    render(): React.ReactNode;
}
export default MapService;
