import * as React from "react";
import Segment from "../model/trip/Segment";

interface IProps {
    value: Segment;
}

export interface SegmentDescriptionProps extends IProps {}

class SegmentDescription extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        const segment = this.props.value;
        return (
            <div className="TripSegmentDetail-descrPanel">
                <div className="TripSegmentDetail-subTitle">
                    {segment.getAction()}
                </div>
                <div className="TripSegmentDetail-notes text">
                    {segment.getNotes().map((note: string, i: number) =>
                        <div key={i}>{note}</div>
                    )}
                </div>
            </div>
        );
    }
}

export default SegmentDescription;