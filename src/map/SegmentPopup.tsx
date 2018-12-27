import * as React from "react";
import "./SegmentPopup.css";
import Segment from "../model/trip/Segment";
import StopLocation from "../model/StopLocation";
import StopsData from "../data/StopsData";

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
        const fromAddress = this.props.segment.from.address;
        return (
                <div className="SegmentPopup" style={{ borderLeft: "4px solid " + this.props.segment.getColor() }}>
                    <div className="SegmentPopup-location gl-overflow-ellipsis">{fromAddress}</div>
                    {this.props.segment.stopCode ?
                        <div className="SegmentPopup-stopId">Stop ID: {this.props.segment.stopCode}</div> : null}
                    <div className="SegmentPopup-name">{this.props.segment.getAction()}</div>
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
            StopsData.instance.getStopFromCode("AU_ACT_Canberra", this.props.segment.stopCode!)
                .then((stopLocation: StopLocation) => {
                        if (stopLocation.url !== null) {
                            this.setState({interchangeUrl: stopLocation.url});
                        }
                    }
                )
        }
    }
}

export default SegmentPopup;