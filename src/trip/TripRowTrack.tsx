import * as React from "react";
import Segment from "../model/trip/Segment";
import Trip from "../model/trip/Trip";
import {Visibility} from "../model/trip/SegmentTemplate";
import TKUITrackTransport from "./TKUITrackTransport";

export interface IProps {
    value: Trip;
    className?: string;
}

class TripRowTrack extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        let brief: boolean | undefined;
        const segments = this.props.value.getSegments(Visibility.IN_SUMMARY);
        const nOfSegments = segments.length;
        if (nOfSegments > 4 || (nOfSegments > 3 && window.innerWidth <= 400)) {
            brief = true;
        } else if (nOfSegments < 4) {
            brief = false;
        }
        return (
            <div className={this.props.className}>
                {segments.map((segment: Segment, i: number) =>
                    <TKUITrackTransport segment={segment} brief={brief} key={i}/>)}
            </div>
        );
    }
}

export default TripRowTrack;