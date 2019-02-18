import * as React from "react";
import Segment from "../model/trip/Segment";
interface IProps {
    value: Segment;
}
declare class SegmentDescription extends React.Component<IProps, {}> {
    render(): React.ReactNode;
}
export default SegmentDescription;
export { IProps as SegmentDescriptionProps };
