import * as React from "react";
import "./SegmentPopup.css";
import Segment from "../model/trip/Segment";
export interface IProps {
    segment: Segment;
}
interface IState {
    interchangeUrl?: string;
}
declare class SegmentPopup extends React.Component<IProps, IState> {
    constructor(props: IProps);
    render(): React.ReactNode;
    componentDidMount(): void;
}
export default SegmentPopup;
