import * as React from "react";
import {IServiceResConsumerProps} from "../api/WithServiceResults";
import ServiceDeparture from "../model/service/ServiceDeparture";
import IServiceDepartureRowProps from "./IServiceDepartureRowProps";

interface IProps extends IServiceResConsumerProps {
    renderDeparture: <P extends IServiceDepartureRowProps>(departureProps: P) => JSX.Element;
    className?: string;
}

class ServiceDepartureTable extends React.Component<IProps, {}> {

    constructor(props: IProps) {
        super(props);
        if (props.onRequestMore) {
            props.onRequestMore();
        }
    }

    public render(): React.ReactNode {
        return (
            <div className={"TripsView gl-flex gl-column" + (this.props.className ? " " + this.props.className : "")}>
                {this.props.departures.map((departure: ServiceDeparture, index: number) =>
                    this.props.renderDeparture({
                            value: departure,
                        })
                )}
            </div>
        );
    }

}

export default ServiceDepartureTable;