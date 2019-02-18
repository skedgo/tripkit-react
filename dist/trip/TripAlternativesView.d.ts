import * as React from "react";
import TripGroup from "../model/trip/TripGroup";
import ITripRowProps from "./ITripRowProps";
import "./TripAlternativesView.css";
interface IProps {
    value: TripGroup;
    onChange: (value: TripGroup) => void;
    renderTrip: <P extends ITripRowProps>(tripRowProps: P) => JSX.Element;
}
declare class TripAlternativesView extends React.Component<IProps, {}> {
    private ref;
    private rowRefs;
    constructor(props: Readonly<IProps>);
    focus(): void;
    render(): React.ReactNode;
    private onKeyDown;
    private nextIndex;
    private onSelected;
}
export default TripAlternativesView;
