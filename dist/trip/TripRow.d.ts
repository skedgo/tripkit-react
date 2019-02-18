import * as React from "react";
import "./TripRow.css";
import { default as IProps } from "./ITripRowProps";
interface IState {
    showDetails: boolean;
}
declare class TripRow extends React.Component<IProps, IState> {
    private ref;
    constructor(props: IProps);
    focus(): void;
    render(): React.ReactNode;
}
export default TripRow;
