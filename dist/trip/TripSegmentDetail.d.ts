import * as React from "react";
import Segment from "../model/trip/Segment";
import "./TripSegmentDetail.css";
import { SegmentDescriptionProps } from "./SegmentDescription";
interface IProps {
    value: Segment;
    renderDescr?: <P extends SegmentDescriptionProps>(segmentDescrProps: P) => JSX.Element;
    renderIcon?: <P extends {
        value: Segment;
    }>(props: P) => JSX.Element;
    renderTitle?: <P extends {
        value: Segment;
    }>(props: P) => JSX.Element;
}
declare class TripSegmentDetail extends React.Component<IProps, {}> {
    render(): React.ReactNode;
}
export default TripSegmentDetail;
export { IProps as SegmentDetailProps };
