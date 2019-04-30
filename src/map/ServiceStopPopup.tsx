import * as React from "react";
import "./ServiceStopPopup.css";
import ServiceStopLocation from "../model/ServiceStopLocation";
import StopLocation from "../model/StopLocation";
import StopsData from "../data/StopsData";
import ServiceShape from "../model/trip/ServiceShape";
import RegionsData from "../data/RegionsData";
import Region from "../model/region/Region";
import ModeInfo from "../model/trip/ModeInfo";

interface IProps {
    stop: ServiceStopLocation;
    shape: ServiceShape;
    color?: string;
    modeInfo?: ModeInfo;
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
        RegionsData.instance.getRegionP(this.props.stop).then((region: Region) => {
            StopsData.instance.getStopFromCode(region.name, this.props.stop.code)
                .then((stopLocation: StopLocation) => {
                        if (stopLocation.url) {
                            this.setState({interchangeUrl: stopLocation.url});
                        }
                    }
                );
        });
    }
}

export {IProps};
export default ServiceStopPopup;