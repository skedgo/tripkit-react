import * as React from "react";
import Segment from "../model/trip/Segment";
import {TrackTransportProps} from "./TrackTransport";
import Trip from "../model/trip/Trip";
import {Visibility} from "../model/trip/SegmentTemplate";

export interface IProps {
    value: Trip;
    renderTransport: <P extends TrackTransportProps>(transportProps: P) => JSX.Element;
    className?: string;
}

class TripRowTrack extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        let brief: boolean | undefined;
        const segments = this.props.value.getSegments(Visibility.IN_SUMMARY);
        const nOfSegments = segments.length;
        if (nOfSegments > 5 || (nOfSegments > 3 && window.innerWidth <= 400)) {
            brief = true;
        } else if (nOfSegments < 5) {
            brief = false;
        }
        const TrackTransport = this.props.renderTransport;
        return (
            <div className={this.props.className}>
                {segments.map((segment: Segment, i: number) =>
                    <TrackTransport segment={segment} brief={brief} key={i}/>)}
            </div>
        );
    }
}

export default TripRowTrack;