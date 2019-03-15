import * as React from "react";
import {IServiceResConsumerProps} from "../api/WithServiceResults";
import ServiceDeparture from "../model/service/ServiceDeparture";
import IServiceDepartureRowProps from "./IServiceDepartureRowProps";
import "./ServiceDepartureTable.css";
import IconGlass from "-!svg-react-loader!../images/ic-glass.svg";
import {ChangeEvent} from "react";

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
        this.onScroll = this.onScroll.bind(this);
        this.onFilterChange = this.onFilterChange.bind(this);
    }

    private onScroll(e: any) {
        const scrollPanel = e.target;
        if (this.props.onRequestMore && scrollPanel.scrollTop + scrollPanel.clientHeight > scrollPanel.scrollHeight - 30) {
            console.log("requestMore!");
            this.props.onRequestMore();
        }
    }

    private onFilterChange(e: ChangeEvent<HTMLInputElement>) {
        if (this.props.onFilterChange) {
            this.props.onFilterChange(e.target.value)
        }
    }

    public render(): React.ReactNode {
        return (
            <div className={"ServiceDepartureTable gl-flex gl-column" + (this.props.className ? " " + this.props.className : "")}>
                <div className="ServiceDepartureTable-filterWrapper gl-flex gl-align-center gl-no-shrink">
                    <IconGlass className="ServiceDepartureTable-glassIcon gl-svg-path-fill-currColor"/>
                    <input className="ServiceDepartureTable-filterInput gl-grow" placeholder="Filter"
                           onChange={this.onFilterChange}/>
                </div>
                <div className={"ServiceDepartureTable-container gl-flex gl-column gl-grow" + (this.props.className ? " " + this.props.className : "")}
                     onScroll={this.onScroll}
                >
                    {this.props.departures.map((departure: ServiceDeparture, index: number) =>
                        this.props.renderDeparture({
                            value: departure,
                            key: index
                        })
                    )}
                </div>
            </div>
        );
    }

}

export default ServiceDepartureTable;