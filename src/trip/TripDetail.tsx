import * as React from "react";
import "./TripDetail.css";
import Trip from "../model/trip/Trip";
import Segment from "../model/trip/Segment";
import {SegmentDetailProps, default as TripSegmentDetail} from "./TripSegmentDetail";
import {CSSProperties} from "react";

interface IProps {
    value: Trip;
    style?: CSSProperties;
    config: TKUITripDetailConfig;
}

class TKUITripDetailConfig {
    public renderSegmentDetail: <P extends SegmentDetailProps & {key: number}>(props: P) => JSX.Element
        = <P extends SegmentDetailProps & {key: number}>(props: P) => <TripSegmentDetail {...props}/>;
}

class TripDetail extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        const segments = this.props.value.segments;
        const renderSegmentDetail = this.props.config.renderSegmentDetail ? this.props.config.renderSegmentDetail :
            <P extends SegmentDetailProps & {key: number}>(props: P) => <TripSegmentDetail {...props}/>;
        return (
            <div className="TripDetail" style={this.props.style}>
                {segments.map((segment: Segment, index: number) =>
                    renderSegmentDetail({value: segment, key: index})
                )}
                {renderSegmentDetail({value: this.props.value.arrivalSegment, key: segments.length})}
            </div>
        )
    }
}

export default TripDetail;
export {TKUITripDetailConfig};