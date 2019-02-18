import * as React from "react";
import Segment from "../model/trip/Segment";
import "./TrackTransport.css";
interface IProps {
    segment: Segment;
    brief?: boolean;
}
declare class TrackTransport extends React.Component<IProps, {}> {
    render(): React.ReactNode;
}
export default TrackTransport;
export { IProps as TrackTransportProps };
