import * as React from "react";
import "./ServiceStopPopup.css";
import ServiceStopLocation from "../model/ServiceStopLocation";

interface IProps {
    stop: ServiceStopLocation;
    color: string
    interchangeUrl?: string;
}

class ServiceStopPopup extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        return (
            <div className="ServiceStopPopup" style={{ borderLeft: "4px solid " + this.props.color }}>
                <div className="ServiceStopPopup-name">{this.props.stop.name}</div>
                <div className="ServiceStopPopup-stopId">Stop ID: {this.props.stop.code}</div>
                {this.props.interchangeUrl ?
                    <div className="ServiceStopPopup-link gl-link"
                         onClick={() => window.open(this.props.interchangeUrl,'_blank')}
                    >View stop map</div> :
                    null
                }
            </div>
        )
    }

}

export default ServiceStopPopup;