import * as React from "react";
import "./TripSegmentSteps.css";
interface IProps<T> {
    steps: T[];
    toggleLabel: (open: boolean) => string;
    leftLabel?: (step: T) => string;
    rightLabel: (step: T) => string;
    borderColor: string;
    dashed?: boolean;
}
interface IState {
    open: boolean;
}
declare class TripSegmentSteps<T> extends React.Component<IProps<T>, IState> {
    private static count;
    private id;
    constructor(props: IProps<T>);
    render(): React.ReactNode;
}
export default TripSegmentSteps;
