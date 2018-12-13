import * as React from "react";
import "./TripDetail.css";
import Trip from "../model/trip/Trip";
import Segment from "../model/trip/Segment";
import {SegmentDetailProps, default as TripSegmentDetail} from "./TripSegmentDetail";
import TransportUtil from "./TransportUtil";

interface IProps {
    value: Trip;
    renderSegmentDetail?: <P extends SegmentDetailProps & {key: number}>(props: P) => JSX.Element;
}

class TripDetail extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        const segments = this.props.value.segments;
        const lineColor = TransportUtil.getRepresentativeColor(this.props.value);
        const renderSegmentDetail = this.props.renderSegmentDetail ? this.props.renderSegmentDetail :
            <P extends SegmentDetailProps & {key: number}>(props: P) => <TripSegmentDetail {...props}/>;
        return (
            <div className="TripDetail" style={{ borderLeft: "4px solid " + lineColor}}>
                {segments.map((segment: Segment, index: number) =>
                    renderSegmentDetail({value: segment, key: index})
                )}
                {renderSegmentDetail({value: segments[segments.length - 1], end: true, key: segments.length})}
            </div>
        )
    }
}

export default TripDetail;