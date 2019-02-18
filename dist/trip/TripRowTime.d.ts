import * as React from "react";
import Trip from "../model/trip/Trip";
export interface IProps {
    value: Trip;
    brief?: boolean;
}
declare class TripRowTime extends React.Component<IProps, {}> {
    render(): React.ReactNode;
}
export default TripRowTime;
