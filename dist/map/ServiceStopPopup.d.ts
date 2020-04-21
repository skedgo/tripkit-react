import * as React from "react";
import "./ServiceStopPopup.css";
import ServiceStopLocation from "../model/ServiceStopLocation";
import ServiceShape from "../model/trip/ServiceShape";
export interface IProps {
    stop: ServiceStopLocation;
    shape: ServiceShape;
}
interface IState {
    interchangeUrl?: string;
}
declare class ServiceStopPopup extends React.Component<IProps, IState> {
    constructor(props: IProps);
    render(): React.ReactNode;
    componentDidMount(): void;
}
export default ServiceStopPopup;
