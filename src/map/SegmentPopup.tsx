import * as React from "react";
import "./SegmentPopup.css";
import Segment from "../model/trip/Segment";
import StopLocation from "../model/StopLocation";
import StopsData from "../data/StopsData";
import DateTimeUtil from "../util/DateTimeUtil";
import RegionsData from "../data/RegionsData";

interface IProps {
    segment: Segment;
}

interface IState {
    interchangeUrl?: string;
}

class SegmentPopup extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);
        this.state = {};
    }

    public render(): React.ReactNode {
        const segment = this.props.segment;
        const title = segment.arrival ? "Arrive to " + segment.to.getDisplayString() + " at " + DateTimeUtil.momentTZTime(segment.endTime * 1000).format(DateTimeUtil.TIME_FORMAT_TRIP) : segment.getAction();
        const subtitle = !segment.arrival ?
            (segment.isFirst() ? "To " + segment.to.getDisplayString() : "From " + segment.from.getDisplayString()) : undefined;
        return (
                <div className="SegmentPopup">
                    <div className="SegmentPopup-title gl-overflow-ellipsis">{title}</div>
                    <div className="SegmentPopup-subtitle">{subtitle}</div>
                    {this.state.interchangeUrl ?
                        <div className="SegmentPopup-link gl-link"
                             onClick={() => window.open(this.state.interchangeUrl,'_blank')}
                        >View stop map</div> :
                        null
                    }
                </div>
            );
    }

    public componentDidMount(): void {
        if (this.props.segment.isPT() && this.props.segment.stopCode !== null) {
            StopsData.instance.getStopFromCode(RegionsData.HARDCODED_REGION, this.props.segment.stopCode!)
                .then((stopLocation: StopLocation) => {
                        if (stopLocation.url !== null) {
                            this.setState({interchangeUrl: stopLocation.url});
                        }
                    }
                )
        }
    }
}

export {IProps};
export default SegmentPopup;