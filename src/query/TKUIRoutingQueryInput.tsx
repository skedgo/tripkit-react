import * as React from "react";
import "./QueryInputDelete.css";
import LocationBox from "../location_box/LocationBox";
import MultiGeocoder from "../geocode/MultiGeocoder";
import Location from "../model/Location";
import BBox from "../model/BBox";
import LatLng from "../model/LatLng";
import {ReactComponent as IconAngleDown} from "../images/ic-angle-down.svg";
import {ReactComponent as IconSwap} from '../images/ic-swap.svg';
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
import {IRoutingResultsContext, RoutingResultsContext} from "../trip-planner/RoutingResultsProvider";
import FavouriteTrip from "../model/FavouriteTrip";
import FavouritesData from "../data/FavouritesData";
import {CSSProps, TKUIWithStyle, withStyleProp} from "../jss/StyleHelper";
import {ClassNameMap} from "react-jss";
import {tKUIRoutingQueryInputDefaultStyle} from "./TKUIRoutingQueryInput.css";
import {ReactComponent as IconRemove} from '../images/ic-cross.svg';

export interface ITKUIRoutingQueryInputProps extends TKUIWithStyle<ITKUIRoutingQueryInputStyle, ITKUIRoutingQueryInputProps> {
    onGoClicked?: (routingQuery: RoutingQuery) => void;
    onShowOptions?: () => void;
    isTripPlanner?: boolean;
    collapsable?: boolean;
    geocoderOptions?: MultiGeocoderOptions;
}

interface IConsumedProps {
    value?: RoutingQuery;
    onChange?: (routingQuery: RoutingQuery) => void;
    onPreChange?: (from: boolean, location?: Location) => void;
    bounds?: BBox;
    focusLatLng?: LatLng;
}

interface IProps extends IConsumedProps, ITKUIRoutingQueryInputProps {
    classes: ClassNameMap<keyof ITKUIRoutingQueryInputStyle>;
}

export interface ITKUIRoutingQueryInputStyle {
    main: CSSProps<IProps>;
    header: CSSProps<IProps>;
    title: CSSProps<IProps>;
    btnClear: CSSProps<IProps>;
    iconClear: CSSProps<IProps>;
    fromToPanel: CSSProps<IProps>;
    locSelector: CSSProps<IProps>;
    locIcon: CSSProps<IProps>;
    dotIcon: CSSProps<IProps>;
    divider: CSSProps<IProps>;
    swap: CSSProps<IProps>;
    footer: CSSProps<IProps>;
    timePrefFace: CSSProps<IProps>;
    timePref: CSSProps<IProps>;
    transportsBtn: CSSProps<IProps>;
}

export class ITKUIRoutingQueryInputConfig implements TKUIWithStyle<ITKUIRoutingQueryInputStyle, ITKUIRoutingQueryInputProps> {
    public styles = tKUIRoutingQueryInputDefaultStyle;
    public suffixClassNames?: boolean;

    public static instance = new ITKUIRoutingQueryInputConfig();
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

class TKUIRoutingQueryInput extends React.Component<IProps, IState> {

    private geocodingData: MultiGeocoder;
    private dateTimePickerRef: any;
    private fromLocRef: any;
    private toLocRef: any;
    // private goBtnRef: any;

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
        this.onPrefChange = this.onPrefChange.bind(this);
        this.onSwapClicked = this.onSwapClicked.bind(this);
    }

    private getTimeBtnText(): string {
        return this.state.routingQuery.timePref === TimePreference.NOW ? "Leaving now" :
            (this.state.routingQuery.timePref === TimePreference.LEAVE ?
                    "Leaving after " + this.state.routingQuery.time.format(DateTimeUtil.DATE_TIME_FORMAT) :
                    "Arriving before " + this.state.routingQuery.time.format(DateTimeUtil.DATE_TIME_FORMAT)
            );
    }

    private onPrefChange(timePref: TimePreference) {
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
        const prevQuery = this.state.routingQuery;
        if (update.isComplete(true) &&
            (JSON.stringify(update.from) !== JSON.stringify(prevQuery.from)
                || JSON.stringify(update.to) !== JSON.stringify(prevQuery.to))) {
            FavouritesData.recInstance.add(FavouriteTrip.create(update.from!, update.to!));
        }
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
            <button onClick={() => this.setState(prevState => ({collapsed: !prevState.collapsed}))}
                    aria-hidden={true}
                    tabIndex={-1}>
                <IconAngleDown className={"QueryInput-collapseBtn gl-svg-path-fill-currColor" + (!this.state.collapsed ? " gl-rotate180" : "")}
                               focusable="false"
                />
            </button> : null;
        const expandBtn =
            <button onClick={() => this.setState(prevState => ({collapsed: !prevState.collapsed}))}
                    aria-hidden={true}
                    tabIndex={-1}>
                <IconAngleDown className={"QueryInput-collapseBtn gl-svg-path-fill-currColor gl-no-shrink" + (!this.state.collapsed ? " gl-rotate180" : "")}
                               focusable="false"
                />
            </button>;
        const fromPlaceholder = "Where are you going from?";
        const toPlaceholder = "Where do you want to go?";
        const ariaLabelFrom = this.state.routingQuery.from !== null ?
            "From " + this.state.routingQuery.from.address :
            fromPlaceholder.substring(0, fromPlaceholder.length - 3);
        const ariaLabelTo = this.state.routingQuery.to !== null ?
            "To " + this.state.routingQuery.to.address :
            toPlaceholder.substring(0, toPlaceholder.length - 3);
        const classes = this.props.classes;
        return (
            <div className={classes.main}>
                <div className={classes.header}>
                    <div className={classes.title}>
                        Route
                    </div>
                    <button
                        className={classes.btnClear}
                        aria-hidden={true}
                        onClick={() => this.setQuery(new RoutingQuery())}
                    >
                        <IconRemove aria-hidden={true}
                                    className={classes.iconClear}
                                    focusable="false"/>
                    </button>
                </div>
                <div className={classes.fromToPanel + " QueryInput-fromToPanel gl-flex gl-align-center"}>
                    <div className={classes.locSelector}>
                        <div className={classes.locIcon}/>
                        <div className={classes.dotIcon}/>
                        <div className={classes.dotIcon}/>
                        <div className={classes.dotIcon}/>
                        <div className={classes.locIcon}/>
                    </div>
                    <div className="QueryInput-fromToInputsPanel gl-flex gl-column gl-grow">
                        <Tooltip
                            placement="top"
                            overlay={"Enter a location"}
                            arrowContent={<div className="rc-tooltip-arrow-inner"/>}
                            visible={this.state.fromTooltip}
                            overlayClassName="QueryInput-tooltip"
                        >
                            <div className="QueryInput-locationPanel">
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
                        <div className={classes.divider}/>
                        <Tooltip
                            placement="top"
                            overlay={"Enter a location"}
                            arrowContent={<div className="rc-tooltip-arrow-inner"/>}
                            visible={this.state.toTooltip}
                            overlayClassName="QueryInput-tooltip"
                        >
                            <div className="QueryInput-locationPanel gl-flex gl-align-center">
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
                    <IconSwap className={classes.swap}
                              aria-hidden={true}
                              focusable="false"
                              onClick={this.onSwapClicked}/>
                </div>
                <div className={classes.footer + " QueryInput-timeBtnPanel gl-flex gl-align-center gl-space-between"}>
                    <div className={classes.timePrefFace}>
                        <select className={classes.timePref}
                                onChange={(e) => this.onPrefChange(e.target.value as TimePreference)}>
                            <option value={TimePreference.NOW}>Leave now</option>
                            <option value={TimePreference.LEAVE}>Leave</option>
                            <option value={TimePreference.ARRIVE}>Arrive</option>
                        </select>
                    </div>
                    {this.state.routingQuery.timePref !== TimePreference.NOW &&
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
                    }
                    <div className="gl-flex gl-align-center">
                        {this.props.onShowOptions &&
                            <button className={classes.transportsBtn}
                                    onClick={this.props.onShowOptions}
                            >
                                Transport options
                            </button>
                        }
                    </div>
                </div>
            </div>
        );
    }
}

const Consumer: React.SFC<{children: (props: Partial<IProps>) => React.ReactNode}> = props => {
    return (
        <RoutingResultsContext.Consumer>
            {(routingContext: IRoutingResultsContext) => {
                const region = routingContext.region;
                const bounds = region ? region.bounds : undefined;
                const focusLatLng = region ? (region.cities.length !== 0 ? region.cities[0] : region.bounds.getCenter()) : undefined;
                const consumerProps: Partial<IProps> = {
                    value: routingContext.query,
                    onChange: routingContext.onQueryChange,
                    onPreChange: routingContext.onPreChange,
                    bounds: bounds,
                    focusLatLng: focusLatLng

                };
                return props.children!(consumerProps);
            }}
        </RoutingResultsContext.Consumer>
    );
};

export const Connect = (RawComponent: React.ComponentType<IProps>) => {
    const RawComponentStyled = withStyleProp(RawComponent);
    return (addProps: ITKUIRoutingQueryInputProps) => {
        const stylesToPass = addProps.styles || ITKUIRoutingQueryInputConfig.instance.styles;
        const suffixClassNamesToPass = addProps.suffixClassNames !== undefined ? addProps.suffixClassNames :
            ITKUIRoutingQueryInputConfig.instance.suffixClassNames;
        return (
            <Consumer>
                {(props: any) => {
                    return <RawComponentStyled {...addProps} {...props}
                                                  styles={stylesToPass}
                                                  suffixClassNames={suffixClassNamesToPass}/>
                }}
            </Consumer>
        );
    }
}

export default Connect(TKUIRoutingQueryInput);