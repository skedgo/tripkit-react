import * as React from "react";
import Segment from "../model/trip/Segment";
import {TrackTransportProps} from "./TrackTransport";
import Trip from "../model/trip/Trip";

export interface IProps {
    value: Trip;
    renderTransport: <P extends TrackTransportProps>(transportProps: P) => JSX.Element;
    className?: string;
}

class TripRowTrack extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        let brief: boolean | undefined;
        const nOfSegments = this.props.value.segments.filter((segment: Segment) => segment.visibilityType === Segment.Visibility.IN_SUMMARY).length;
        if (nOfSegments > 5 || (nOfSegments > 3 && window.innerWidth <= 400)) {
            brief = true;
        } else if (nOfSegments < 5) {
            brief = false;
        }
        const TrackTransport = this.props.renderTransport;
        return (
            <div className={this.props.className}>
                { this.props.value.segments.reduce((accum: any[], segment: Segment, i: number) => {
                        if (segment.visibilityType === Segment.Visibility.IN_SUMMARY) {
                            accum.push(<TrackTransport segment={segment} brief={brief} key={i}/>);
                        }
                        return accum;
                    },
                    [])
                }
            </div>
        );
    }
}

export default TripRowTrack;