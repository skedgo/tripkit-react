import * as React from "react";
import {
    IServiceResultsContext,
    ServiceResultsContext
} from "../service/ServiceResultsProvider";
import ServiceDeparture from "../model/service/ServiceDeparture";
import IServiceDepartureRowProps from "./IServiceDepartureRowProps";
import "./ServiceDepartureTable.css";
import {ReactComponent as IconGlass} from "../images/ic-glass.svg";
import {ChangeEvent} from "react";
import DateTimeUtil from "../util/DateTimeUtil";
import DaySeparator from "./DaySeparator";
import DateTimePickerFace from "../time/DateTimePickerFace";
import {Moment} from "moment";
import moment from "moment-timezone";
import TKUICard, {tKUICardDefaultStyle, tKUICardWithStyle} from "../card/TKUICard";

interface ITKUIDeparturesViewProps {
    renderDeparture: <P extends IServiceDepartureRowProps>(departureProps: P) => JSX.Element;
    onRequestClose?: () => void;
}

interface IProps extends IServiceResultsContext, ITKUIDeparturesViewProps {}

const CustomTKUICard = tKUICardWithStyle({
    main: {
        color: 'orange!important'
    },
    header: {
        ...tKUICardDefaultStyle.header
    }
});

class ServiceDepartureTable extends React.Component<IProps, {}> {

    private scrollRef: any;

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
            <CustomTKUICard
                title={this.props.title}
                renderSubHeader={() =>
                    <div className="ServiceDepartureTable-timePicker">
                        <DateTimePickerFace
                            value={this.props.initTime}
                            onChange={this.props.onInitTimeChange}
                            format={(value: Moment) => {
                                if (Math.abs(moment.duration(value.diff(DateTimeUtil.getNow())).asMinutes()) <= 1) {
                                    return "Now"
                                }
                                if (DateTimeUtil.getNow().format("ddd D") !== value.format("ddd D")) {
                                    return value.format("ddd D, " + DateTimeUtil.TIME_FORMAT_TRIP);
                                }
                                return value.format(DateTimeUtil.TIME_FORMAT_TRIP);
                            }}
                        />
                    </div>
                }
                onRequestClose={this.props.onRequestClose}
            >
                <div className={"ServiceDepartureTable gl-flex gl-column"}>
                    <div className="ServiceDepartureTable-filterWrapper gl-flex gl-align-center gl-no-shrink">
                        <IconGlass className="ServiceDepartureTable-glassIcon gl-svg-path-fill-currColor"/>
                        <input className="ServiceDepartureTable-filterInput gl-grow" placeholder="Filter"
                               onChange={this.onFilterChange}/>
                    </div>
                    <div className="ServiceDepartureTable-relative gl-flex">
                        <div className={"ServiceDepartureTable-container gl-flex gl-column gl-grow"}
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
                                                             scrollRef={this.scrollRef}
                                    />)
                                }
                                elems.push(this.props.renderDeparture({
                                    value: departure,
                                    key: i,
                                    onClick: () => {
                                        if (this.props.onServiceSelection) {
                                            this.props.onServiceSelection(departure)
                                        }
                                    }
                                }));
                                return elems;
                            }, [])}
                        </div>
                    </div>
                </div>
            </CustomTKUICard>
        );
    }

    public componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<{}>, snapshot?: any): void {
        if (prevProps.departures.length === 0 && this.props.departures.length > 0) {
            const now = DateTimeUtil.getNow().valueOf()/1000;
            const nextDepartureIndex = this.props.departures.findIndex((departure: ServiceDeparture) => {
                return departure.actualStartTime >= now;
            });
            console.log("nextDepartureIndex: " + nextDepartureIndex);
            if (nextDepartureIndex !== -1 && this.scrollRef) {
                Array.prototype.slice.call(this.scrollRef.children).filter((child: any) =>
                    !child.className.includes("DaySeparator")
                )[nextDepartureIndex].scrollIntoView();
            }
        }
    }

}

const Connector: React.SFC<{children: (props: IServiceResultsContext) => React.ReactNode}> = (props: {children: (props: IServiceResultsContext) => React.ReactNode}) => {
    return (
        <ServiceResultsContext.Consumer>
            {(serviceContext: IServiceResultsContext) => (
                props.children!(serviceContext)
            )}
        </ServiceResultsContext.Consumer>
    );
};

export const TKUIDeparturesView = (props: ITKUIDeparturesViewProps) =>
    <Connector>
        {(cProps: IServiceResultsContext) => <ServiceDepartureTable {...props} {...cProps}/>}
    </Connector>;

export default ServiceDepartureTable;