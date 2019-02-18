import * as React from "react";
import Trip from "../model/trip/Trip";
import ITripRowProps from "./ITripRowProps";
import "./TripsView.css";
import { EventEmitter } from "fbemitter";
interface IProps {
    values: Trip[];
    value?: Trip;
    waiting?: boolean;
    className?: string;
    onChange?: (value: Trip) => void;
    eventBus?: EventEmitter;
    renderTrip: <P extends ITripRowProps>(tripRowProps: P) => JSX.Element;
}
declare class TripsView extends React.Component<IProps, {}> {
    private rowRefs;
    constructor(props: IProps);
    private onKeyDown;
    private nextIndex;
    render(): React.ReactNode;
    componentDidUpdate(prevProps: Readonly<IProps>): void;
    static sortTrips(trips: Trip[]): Trip[];
}
export default TripsView;
