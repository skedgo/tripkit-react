import * as React from "react";
import { TrackTransportProps } from "./TrackTransport";
import Trip from "../model/trip/Trip";
export interface IProps {
    value: Trip;
    renderTransport: <P extends TrackTransportProps>(transportProps: P) => JSX.Element;
}
declare class TripRowTrack extends React.Component<IProps, {}> {
    render(): React.ReactNode;
}
export default TripRowTrack;
