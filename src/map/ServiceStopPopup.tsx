import * as React from "react";
import ServiceStopLocation from "../model/ServiceStopLocation";
import StopLocation from "../model/StopLocation";
import StopsData from "../data/StopsData";
import ServiceShape from "../model/trip/ServiceShape";
import RegionsData from "../data/RegionsData";
import Region from "../model/region/Region";
import TKUIMapPopup from "./TKUIMapPopup";
import genStyles from "../css/GenStyle.css";

export interface IProps {
    stop: ServiceStopLocation;
    shape: ServiceShape;
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
            <TKUIMapPopup
                title={this.props.stop.name}
                renderMoreInfo={this.state.interchangeUrl ? () =>
                    <div style={{...genStyles.link,   // TODO: hover rule will not work.
                        borderTop: '1px solid #ECEBEB',
                        marginTop: '7px',
                        paddingTop: '7px'}}
                         onClick={() => window.open(this.state.interchangeUrl, '_blank')}
                    >View stop map</div> : undefined
                }
            />
        )
    }

    public componentDidMount(): void {
        RegionsData.instance.getRegionP(this.props.stop).then((region?: Region) => {
            if (!region) {
                return;
            }
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

export default ServiceStopPopup;