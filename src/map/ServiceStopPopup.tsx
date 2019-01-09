import * as React from "react";
import "./ServiceStopPopup.css";
import ServiceStopLocation from "../model/ServiceStopLocation";
import StopLocation from "../model/StopLocation";
import StopsData from "../data/StopsData";
import Segment from "../model/trip/Segment";
import ServiceShape from "../model/trip/ServiceShape";
import RegionsData from "../data/RegionsData";

interface IProps {
    stop: ServiceStopLocation;
    shape: ServiceShape;
    segment: Segment;
}

interface IState {
    interchangeUrl?: string;
}

class ServiceStopPopup extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);
        this.state = {};
    }

    public render(): React.ReactNode {
        return (
            <div className="ServiceStopPopup">
                <div className="ServiceStopPopup-name">{this.props.stop.name}</div>
                <div className="ServiceStopPopup-stopId">Stop ID: {this.props.stop.code}</div>
                {this.state.interchangeUrl ?
                    <div className="ServiceStopPopup-link gl-link"
                         onClick={() => window.open(this.state.interchangeUrl,'_blank')}
                    >View stop map</div> :
                    null
                }
            </div>
        )
    }

    public componentDidMount(): void {
        StopsData.instance.getStopFromCode(RegionsData.HARDCODED_REGION, this.props.stop.code)
            .then((stopLocation: StopLocation) => {
                    if (stopLocation.url !== null) {
                        this.setState({ interchangeUrl: stopLocation.url });
                    }
                }
            )
    }
}

export {IProps};
export default ServiceStopPopup;