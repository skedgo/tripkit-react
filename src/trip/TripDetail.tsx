import * as React from "react";
import "./TripDetail.css";
import Trip from "../model/trip/Trip";
import Segment from "../model/trip/Segment";
import TripSegmentDetail from "./TripSegmentDetail";
import TransportUtil from "./TransportUtil";

interface IProps {
    value: Trip;
}

class TripDetail extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        const segments = this.props.value.segments;
        const lineColor = TransportUtil.getRepresentativeColor(this.props.value);
        return (
            <div className="TripDetail" style={{ borderLeft: "4px solid " + lineColor }}>
                {segments.map((segment: Segment, index: number) =>
                    <TripSegmentDetail value={segment} key={index}/>
                )}
                <TripSegmentDetail value={segments[segments.length - 1]} end={true} key={segments.length}/>
            </div>
        )
    }
}

export default TripDetail;