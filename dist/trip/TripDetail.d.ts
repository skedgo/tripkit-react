import * as React from "react";
import "./TripDetail.css";
import Trip from "../model/trip/Trip";
import { SegmentDetailProps } from "./TripSegmentDetail";
import { CSSProperties } from "react";
interface IProps {
    value: Trip;
    renderSegmentDetail?: <P extends SegmentDetailProps & {
        key: number;
    }>(props: P) => JSX.Element;
    style?: CSSProperties;
}
declare class TripDetail extends React.Component<IProps, {}> {
    render(): React.ReactNode;
}
export default TripDetail;
