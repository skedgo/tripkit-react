import * as React from "react";
import Segment from "../model/trip/Segment";
import StopLocation from "../model/StopLocation";
import StopsData from "../data/StopsData";
import DateTimeUtil from "../util/DateTimeUtil";
import RegionsData from "../data/RegionsData";
import Region from "../model/region/Region";
import TKUIMapPopup from "./TKUIMapPopup";
import genStyles from "../css/GenStyle.css";

export interface IProps {
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
        const title = segment.arrival ?
            "Arrive to " + segment.to.getDisplayString() + " at " +
            DateTimeUtil.momentFromTimeTZ(segment.endTime * 1000, segment.from.timezone).format(DateTimeUtil.TIME_FORMAT_TRIP) :
            segment.getAction();
        const subtitle = !segment.arrival ?
            (segment.isFirst() ? "To " + segment.to.getDisplayString() : "From " + segment.from.getDisplayString()) : undefined;
        return (
            <TKUIMapPopup
                title={title}
                subtitle={subtitle}
                renderMoreInfo={this.state.interchangeUrl ?
                    () => <div style={{...genStyles.link,   // TODO: hover rule will not work.
                        borderTop: '1px solid #ECEBEB',
                        marginTop: '7px',
                        paddingTop: '7px'}}
                               onClick={() => window.open(this.state.interchangeUrl,'_blank')}
                    >View stop map</div> : undefined
                }
            />
        );
    }

    public componentDidMount(): void {
        if (this.props.segment.isPT() && this.props.segment.stopCode !== null) {
            RegionsData.instance.getRegionP(this.props.segment.from).then((region?: Region) => {
                if (!region) {
                    return;
                }
                StopsData.instance.getStopFromCode(region.name, this.props.segment.stopCode!)
                    .then((stopLocation: StopLocation) => {
                            if (stopLocation.url) {
                                this.setState({interchangeUrl: stopLocation.url});
                            }
                        }
                    )
            });
        }
    }
}

export default SegmentPopup;