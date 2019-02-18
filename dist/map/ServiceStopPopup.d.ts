import * as React from "react";
import "./ServiceStopPopup.css";
import ServiceStopLocation from "../model/ServiceStopLocation";
import Segment from "../model/trip/Segment";
import ServiceShape from "../model/trip/ServiceShape";
interface IProps {
    stop: ServiceStopLocation;
    shape: ServiceShape;
    segment: Segment;
}
interface IState {
    interchangeUrl?: string;
}
declare class ServiceStopPopup extends React.Component<IProps, IState> {
    constructor(props: IProps);
    render(): React.ReactNode;
    componentDidMount(): void;
}
export { IProps };
export default ServiceStopPopup;
