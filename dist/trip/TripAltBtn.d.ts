import TripGroup from "../model/trip/TripGroup";
import * as React from "react";
import ITripRowProps from "./ITripRowProps";
interface IProps {
    value: TripGroup;
    onChange: (value: TripGroup) => void;
    renderTrip: <P extends ITripRowProps>(tripRowProps: P) => JSX.Element;
}
declare class TripAltBtn extends React.Component<IProps, {}> {
    private altTripsRef;
    render(): React.ReactNode;
}
export default TripAltBtn;
