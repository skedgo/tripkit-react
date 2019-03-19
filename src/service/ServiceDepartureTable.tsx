import * as React from "react";
import {IServiceResConsumerProps} from "../api/WithServiceResults";
import ServiceDeparture from "../model/service/ServiceDeparture";
import IServiceDepartureRowProps from "./IServiceDepartureRowProps";
import "./ServiceDepartureTable.css";
import IconGlass from "-!svg-react-loader!../images/ic-glass.svg";
import {ChangeEvent} from "react";
import DateTimeUtil from "../util/DateTimeUtil";
import DaySeparator from "./DaySeparator";

interface IProps extends IServiceResConsumerProps {
    renderDeparture: <P extends IServiceDepartureRowProps>(departureProps: P) => JSX.Element;
    className?: string;
}

interface IState {
    scrollTop: number;
}

class ServiceDepartureTable extends React.Component<IProps, IState> {

    private scrollRef: any;

    constructor(props: IProps) {
        super(props);
        this.state = {
            scrollTop: 0
        };
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
        this.setState({ scrollTop: scrollPanel.scrollTop });
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
                     ref={(scrollRef: any) => this.scrollRef = scrollRef}
                >
                    {this.props.departures.reduce((elems: JSX.Element[], departure: ServiceDeparture, i: number) => {
                        const showDayLabel = i === 0 ||
                            DateTimeUtil.momentTZTime(this.props.departures[i - 1].actualStartTime * 1000).format("ddd D") !==
                            DateTimeUtil.momentTZTime(departure.actualStartTime * 1000).format("ddd D");
                        if (showDayLabel) {
                            elems.push(<DaySeparator date={DateTimeUtil.momentTZTime(departure.actualStartTime * 1000)}
                                                     key={"day-" + i}
                                                     scrollTop={this.state.scrollTop + 48} // 48px of filter panel. See how to avoid this.
                            />)
                        }
                        elems.push(this.props.renderDeparture({
                            value: departure,
                            key: i
                        }));
                        return elems;
                    }, [])}
                </div>
            </div>
        );
    }

    public componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<{}>, snapshot?: any): void {
        if (prevProps.departures.length === 0 && this.props.departures.length > 0) {
            const now = DateTimeUtil.getNow().valueOf()/1000;
            const nextDepartureIndex = this.props.departures.findIndex((departure: ServiceDeparture) => {
                console.log("nextDepartureIndex: " + nextDepartureIndex);
                return departure.actualStartTime >= now;
            });
            if (nextDepartureIndex && this.scrollRef) {
                this.scrollRef.children[nextDepartureIndex].scrollIntoView();
            }
        }
    }

}

export default ServiceDepartureTable;