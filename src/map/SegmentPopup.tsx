import * as React from "react";
import "./SegmentPopup.css";
import Segment from "../model/trip/Segment";

interface IProps {
    segment: Segment;
}

class SegmentPopup extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        const stop = this.props.segment.stop;
        const fromAddress = this.props.segment.from.address;
        return (
                <div className="SegmentPopup" style={{ borderLeft: "4px solid " + this.props.segment.getColor() }}>
                    <div className="SegmentPopup-location gl-overflow-ellipsis">{fromAddress}</div>
                    {this.props.segment.stopCode ?
                        <div className="SegmentPopup-stopId">Stop ID: {this.props.segment.stopCode}</div> : null}
                    <div className="SegmentPopup-name">{this.props.segment.getAction()}</div>
                    {stop && stop.url ?
                        <div className="SegmentPopup-link gl-link"
                             onClick={() => window.open(stop!.url!,'_blank')}
                        >View stop map</div> :
                        null
                    }
                </div>
            );
    }
}

export default SegmentPopup;