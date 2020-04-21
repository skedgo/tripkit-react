import * as React from "react";
import Trip from "../model/trip/Trip";
export interface IProps {
    value: Trip;
    className?: string;
}
declare class TripRowTrack extends React.Component<IProps, {}> {
    render(): React.ReactNode;
}
export default TripRowTrack;
