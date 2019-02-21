import * as React from "react";
import "./QueryInput.css";
import LocationBox from "../location_box/LocationBox";
import MultiGeocoder from "../geocode/MultiGeocoder";
import Location from "../model/Location";
import BBox from "../model/BBox";
import LatLng from "../model/LatLng";
import IconClock from "-!svg-react-loader!../images/ic-clock.svg";
import IconAngleDown from "-!svg-react-loader!../images/ic-angle-down.svg";
import IconCalendar from "-!svg-react-loader!../images/ic-calendar.svg";
import IconFromTo from "-!svg-react-loader?name=IconFromTo!../images/ic-from-to.svg"; // https://github.com/jhamlet/svg-react-loader/issues/86
import IconSwap from '-!svg-react-loader!../images/ic-swap-arrows.svg';
import 'react-datepicker/dist/react-datepicker.css';
import {Moment} from "moment";
import RoutingQuery, {TimePreference} from "../model/RoutingQuery";
import Util from "../util/Util";
import Tooltip from 'rc-tooltip';
import 'rc-tooltip/assets/bootstrap_white.css';
import DateTimePicker from "../time/DateTimePicker";
import DateTimeUtil from "../util/DateTimeUtil";
import {ReactElement} from "react";
import GATracker from "../analytics/GATracker";
import DeviceUtil from "../util/DeviceUtil";
import MultiGeocoderOptions from "../geocode/MultiGeocoderOptions";

interface IProps {
    value?: RoutingQuery;
    onChange?: (routingQuery: RoutingQuery) => void;
    onPreChange?: (from: boolean, location?: Location) => void;
    onGoClicked?: (routingQuery: RoutingQuery) => void;
    bounds?: BBox;
    focusLatLng?: LatLng;
    className?: string;
    isTripPlanner?: boolean;
    bottomRightComponent?: ReactElement<any>;
    bottomLeftComponent?: ReactElement<any>;
    collapsable?: boolean;
    onTimePanelOpen?: (open: boolean) => void;
    geocoderOptions?: MultiGeocoderOptions;
}

interface IState {
    routingQuery: RoutingQuery;
    preselFrom: Location | null;
    preselTo: Location | null;
    timePanelOpen: boolean;
    fromTooltip: boolean;
    toTooltip: boolean;
    collapsed: boolean;
}

class QueryInput extends React.Component<IProps, IState> {

    private geocodingData: MultiGeocoder;
    private dateTimePickerRef: any;
    private fromLocRef: any;
    private toLocRef: any;
    private goBtnRef: any;

    constructor(props: IProps) {
        super(props);
        this.state = {
            routingQuery: props.value ? props.value : RoutingQuery.create(),
            preselFrom: null,
            preselTo: null,
            timePanelOpen: false,
            fromTooltip: false,
            toTooltip: false,
            collapsed: false
        };
        this.geocodingData = new MultiGeocoder(this.props.geocoderOptions);
        this.onPrefClicked = this.onPrefClicked.bind(this);
        this.onSwapClicked = this.onSwapClicked.bind(this);
    }

    private getTimeBtnText(): string {
        return this.state.routingQuery.timePref === TimePreference.NOW ? "Leaving now" :
            (this.state.routingQuery.timePref === TimePreference.LEAVE ?
                    "Leaving after " + this.state.routingQuery.time.format(DateTimeUtil.DATE_TIME_FORMAT) :
                    "Arriving before " + this.state.routingQuery.time.format(DateTimeUtil.DATE_TIME_FORMAT)
            );
    }

    private onPrefClicked(e: any) {
        const timePref = e.target.name;
        GATracker.instance.send("query input", "time pref", timePref.toLowerCase());
        if (timePref === TimePreference.NOW) {
            this.updateQuery({
                timePref: timePref,
                time: DateTimeUtil.getNow()
            });
        } else {
            this.updateQuery({
                timePref: timePref
            })
        }
    }

    private onSwapClicked() {
        this.updateQuery({
            from: this.state.routingQuery.to,
            to: this.state.routingQuery.from
        });
    }

    private updateQuery(update: any, callback?: () => void) {
        this.setQuery(Util.iAssign(this.state.routingQuery, update), callback);
    }

    private setQuery(update: RoutingQuery, callback?: () => void) {
        this.setState({
            routingQuery: update
        }, () => {
            if (this.props.onChange) {
                this.props.onChange(this.state.routingQuery);
            }
            if (callback) {
                callback();
            }
        });
    }

    private showTooltip(from: boolean, show: boolean) {
        if (from) {
            this.setState({fromTooltip: show});
            if (this.fromLocRef && show) {
                this.fromLocRef.setFocus()
            }
        } else {
            this.setState({toTooltip: show});
            if (this.toLocRef && show) {
                this.toLocRef.setFocus()
            }
        }
    }

    public componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<IState>, snapshot?: any): void {
        if (this.props.value && this.props.value !== prevProps.value
            && this.props.value !== this.state.routingQuery) {
            this.setQuery(this.props.value);
        }
    }

    public render(): React.ReactNode {
        const datePickerDisabled = this.state.routingQuery.timePref === TimePreference.NOW;
        const collapseBtn = this.props.collapsable ?
            <IconAngleDown className={"QueryInput-collapseBtn gl-svg-path-fill-currColor" + (!this.state.collapsed ? " gl-rotate180" : "")}
                           onClick={() => this.setState(prevState => ({collapsed: !prevState.collapsed}))}
                           focusable="false"
            /> : null;
        const expandBtn =
            <IconAngleDown className={"QueryInput-collapseBtn gl-svg-path-fill-currColor gl-no-shrink" + (!this.state.collapsed ? " gl-rotate180" : "")}
                           onClick={() => this.setState(prevState => ({collapsed: !prevState.collapsed}))}
                                   focusable="false"
            />;
        const fromPlaceholder = "Choose starting point" +
            (this.props.isTripPlanner ? ", or click on the map" : "") +
            "...";
        const toPlaceholder = "Choose destination" +
            (this.props.isTripPlanner && this.state.routingQuery.from !== null ? ", or click on the map" : "") +
            "...";
        const ariaLabelFrom = this.state.routingQuery.from !== null ?
            "From " + this.state.routingQuery.from.address :
            fromPlaceholder.substring(0, fromPlaceholder.length - 3);
        const ariaLabelTo = this.state.routingQuery.to !== null ?
            "To " + this.state.routingQuery.to.address :
            toPlaceholder.substring(0, toPlaceholder.length - 3);
        return (
            <div className={this.props.className}>
                <div className={"QueryInput-fromToTimePanel gl-flex gl-column" + (this.state.collapsed ? " QueryInput-collapsed" : "")}>
                    <div className="QueryInput-fromToPanel gl-flex gl-align-center">
                        <IconFromTo className="QueryInput-fromToIcon" aria-hidden={true} focusable="false"/>
                        <div className="QueryInput-fromToInputsPanel gl-flex gl-column gl-grow">
                            <Tooltip
                                placement="top"
                                overlay={"Enter a location"}
                                arrowContent={<div className="rc-tooltip-arrow-inner"/>}
                                visible={this.state.fromTooltip}
                                overlayClassName="QueryInput-tooltip"
                            >
                                <div className="QueryInput-locationPanel gl-flex gl-align-center">
                                    <span className="QueryInput-fromToLabel gl-flex" aria-hidden={true}>FROM</span>
                                    <LocationBox
                                        geocodingData={this.geocodingData}
                                        bounds={this.props.bounds}
                                        focus={this.props.focusLatLng}
                                        value={this.state.routingQuery.from}
                                        placeholder={fromPlaceholder}
                                        onChange={(value: Location | null, highlighted: boolean) => {
                                            if (!highlighted) {
                                                this.updateQuery({from: value});
                                                this.setState({preselFrom: null});
                                                if (this.props.onPreChange) {
                                                    this.props.onPreChange(true, undefined);
                                                }
                                                if (value !== null) {
                                                    GATracker.instance.send("query input", "pick location",
                                                        value.isCurrLoc() ? "current location" : "type address");
                                                }
                                            } else {
                                                this.setState({preselFrom: value});
                                                if (this.props.onPreChange) {
                                                    this.props.onPreChange(true, value ? value : undefined);
                                                }
                                            }
                                            this.showTooltip(true, false);
                                        }}
                                        resolveCurr={!!this.props.isTripPlanner}
                                        ref={(el:any) => this.fromLocRef = el}
                                        inputAriaLabel={ariaLabelFrom}
                                        inputId={"input-from"}
                                        sideDropdown={DeviceUtil.isTablet && this.props.isTripPlanner}
                                    />
                                </div>
                            </Tooltip>
                            <Tooltip
                                placement="top"
                                overlay={"Enter a location"}
                                arrowContent={<div className="rc-tooltip-arrow-inner"/>}
                                visible={this.state.toTooltip}
                                overlayClassName="QueryInput-tooltip"
                            >
                                <div className="QueryInput-locationPanel gl-flex gl-align-center">
                                    <span className="QueryInput-fromToLabel gl-flex" aria-hidden={true}>TO</span>
                                    <LocationBox
                                        geocodingData={this.geocodingData}
                                        bounds={this.props.bounds}
                                        focus={this.props.focusLatLng}
                                        value={this.state.routingQuery.to}
                                        placeholder={toPlaceholder}
                                        onChange={(value: Location | null, highlighted: boolean) => {
                                            if (!highlighted) {
                                                this.updateQuery({to: value});
                                                this.setState({preselTo: null});
                                                if (this.props.onPreChange) {
                                                    this.props.onPreChange(false, undefined);
                                                }
                                                if (value !== null) {
                                                    GATracker.instance.send("query input", "pick location",
                                                        value.isCurrLoc() ? "current location" : "type address");
                                                }
                                            } else {
                                                this.setState({preselTo: value});
                                                if (this.props.onPreChange) {
                                                    this.props.onPreChange(false, value ? value : undefined);
                                                }
                                            }
                                            this.showTooltip(false, false);
                                        }}
                                        resolveCurr={!!this.props.isTripPlanner}
                                        ref={(el:any) => this.toLocRef = el}
                                        inputAriaLabel={ariaLabelTo}
                                        inputId={"input-to"}
                                        sideDropdown={DeviceUtil.isTablet && this.props.isTripPlanner}
                                    />
                                </div>
                            </Tooltip>
                        </div>
                        <button className="QueryInput-swapBtn gl-flex gl-column gl-align-center"
                                onClick={this.onSwapClicked}
                        >
                            <IconSwap className="QueryInput-iconSwap" aria-hidden={true} focusable="false"/>
                            <div>SWAP</div>
                        </button>
                    </div>
                    <div className="QueryInput-timeBtnPanel gl-flex gl-align-center gl-space-between">
                        <button
                            className="QueryInput-timeBtn gl-flex gl-align-center"
                            onClick={() => {
                                this.setState({timePanelOpen: !this.state.timePanelOpen});
                                if (this.props.onTimePanelOpen) {
                                    this.props.onTimePanelOpen(!this.state.timePanelOpen);
                                }
                            }}
                            aria-label={"Time preference, " + this.getTimeBtnText()}
                            aria-expanded={this.state.timePanelOpen}
                            aria-controls={"query-time-panel"}
                        >
                            <IconClock className="QueryInput-iconClock" focusable="false"/>
                            {this.getTimeBtnText()}
                            <IconAngleDown
                                className={"QueryInput-iconAngleDown" + (this.state.timePanelOpen ? " up" : "")}
                                focusable="false"
                            />
                        </button>
                        <div className="gl-flex gl-align-center">
                            {this.props.bottomRightComponent}
                            {collapseBtn}
                        </div>
                    </div>
                    <div className={"QueryInput-timePanel" + (!this.state.timePanelOpen ? " gl-display-none" : "")}
                         id="query-time-panel"
                    >
                        <div className="QueryInput-timePrefPanel gl-flex">
                            <button name={TimePreference.NOW}
                                    className={"QueryInput-timePrefBtn gl-grow" + (this.state.routingQuery.timePref === TimePreference.NOW ? " selected" : "")} onClick={this.onPrefClicked}>Now</button>
                            <button name={TimePreference.LEAVE}
                                    className={"QueryInput-timePrefBtn gl-grow" + (this.state.routingQuery.timePref === TimePreference.LEAVE ? " selected" : "")} onClick={this.onPrefClicked}>Leaving</button>
                            <button name={TimePreference.ARRIVE}
                                    className={"QueryInput-timePrefBtn gl-grow" + (this.state.routingQuery.timePref === TimePreference.ARRIVE ? " selected" : "")} onClick={this.onPrefClicked}>Arriving</button>
                        </div>
                        <div className={"QueryInput-timeCalPanel gl-flex gl-align-stretch" + (datePickerDisabled ? " disabled" : "")}>
                            <DateTimePicker
                                value={this.state.routingQuery.time}
                                onChange={(date: Moment) => {
                                    this.updateQuery({time: date});
                                    // if (DeviceUtil.isDesktop && this.goBtnRef) {    // give focus to go button after selecting time.
                                    //     setTimeout(() => this.goBtnRef.focus(), 50);
                                    // }
                                }}
                                timeFormat={DateTimeUtil.TIME_FORMAT}
                                dateFormat={DateTimeUtil.DATE_TIME_FORMAT}
                                disabled={datePickerDisabled}
                                ref={(el: any) => this.dateTimePickerRef = el}
                            />
                            <button className="QueryInput-iconCalPanel gl-flex gl-center gl-align-center"
                                    onClick={() => {
                                        if (this.dateTimePickerRef) {
                                            this.dateTimePickerRef.setFocus();
                                        }
                                    }}
                                    disabled={datePickerDisabled}
                                    aria-label="Open calendar"
                                    aria-hidden={true}
                                    tabIndex={-1}
                            >
                                <IconCalendar className="QueryInput-iconCalendar" focusable="false"/>
                            </button>
                        </div>
                    </div>
                    {this.props.bottomLeftComponent || this.props.onGoClicked ?
                        <div className="QueryInput-bottomPanel gl-flex gl-space-between">
                            { this.props.bottomLeftComponent }
                            { this.props.onGoClicked ?
                                <button className="QueryInput-continueBtn gl-button"
                                        onClick={() => {
                                            if (!this.state.routingQuery.isComplete()) {
                                                if (this.state.routingQuery.from === null) {
                                                    this.showTooltip(true, true);
                                                } else if (this.state.routingQuery.to === null) {
                                                    this.showTooltip(false, true);
                                                }
                                                return;
                                            }
                                            if (this.props.onGoClicked) {
                                                this.props.onGoClicked(this.state.routingQuery)
                                            }
                                        }}
                                        ref={(el:any) => this.goBtnRef = el}
                                >
                                    Continue
                                </button> : null }
                        </div> : null }
                </div>
                <div className={"QueryInput-brief gl-align-center gl-space-between" + (this.state.collapsed ? " QueryInput-collapsed" : "")}>
                    <div className="QueryInput-fromAndToPanelBrief">
                        <div className="QueryInput-fromToPanelBrief gl-flex gl-align-center">
                            <span className="QueryInput-fromToLabel gl-flex gl-no-shrink">FROM</span>
                            <span className="gl-overflow-ellipsis">
                                {this.state.routingQuery.from ? this.state.routingQuery.from.address : ""}
                                </span>
                        </div>
                        <div className="gl-flex gl-align-center">
                            <span className="QueryInput-fromToLabel gl-flex gl-no-shrink">TO</span>
                            <span className="gl-overflow-ellipsis">
                                {this.state.routingQuery.to ? this.state.routingQuery.to.address : ""}
                                </span>
                        </div>
                    </div>
                    {expandBtn}
                </div>
            </div>
        );
    }
}

export default QueryInput;