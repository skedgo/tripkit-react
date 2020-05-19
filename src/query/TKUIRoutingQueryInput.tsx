import * as React from "react";
import TKUILocationBox from "../location_box/TKUILocationBox";
import Location from "../model/Location";
import BBox from "../model/BBox";
import LatLng from "../model/LatLng";
import {ReactComponent as IconSwap} from '../images/ic-swap.svg';
import 'react-datepicker/dist/react-datepicker.css';
import {Moment} from "moment";
import RoutingQuery, {TimePreference} from "../model/RoutingQuery";
import Util from "../util/Util";
import 'rc-tooltip/assets/bootstrap_white.css';
import TKUIDateTimePicker from "../time/TKUIDateTimePicker";
import DateTimeUtil from "../util/DateTimeUtil";
import GATracker from "../analytics/GATracker";
import DeviceUtil from "../util/DeviceUtil";
import {IRoutingResultsContext, RoutingResultsContext} from "../trip-planner/RoutingResultsProvider";
import FavouriteTrip from "../model/favourite/FavouriteTrip";
import FavouritesData from "../data/FavouritesData";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {tKUIRoutingQueryInputDefaultStyle} from "./TKUIRoutingQueryInput.css";
import {ReactComponent as IconRemove} from '../images/ic-cross.svg';
import {ReactComponent as IconArrowBack} from '../images/ic-arrow-back.svg';
import classNames from "classnames";
import TKUITransportSwitchesView from "../options/TKUITransportSwitchesView";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {connect, PropsMapper} from "../config/TKConfigHelper";
import {Subtract} from "utility-types";
import Region from "../model/region/Region";
import {TKUIViewportUtil, TKUIViewportUtilProps} from "../util/TKUIResponsiveUtil";
import TKUITooltip from "../card/TKUITooltip";
import TKUISelect from "../buttons/TKUISelect";
import {TranslationFunction} from "../i18n/TKI18nProvider";
import {tKUIColors} from "..";
import {ERROR_GEOLOC_DENIED, ERROR_GEOLOC_INACCURATE} from "../util/GeolocationUtil";
import TKErrorHelper, {ERROR_UNABLE_TO_RESOLVE_ADDRESS} from "../error/TKErrorHelper";

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    title?: string;
    showTransportsBtn?: boolean;
    onShowTransportOptions?: () => void;
    isTripPlanner?: boolean;
    resolveCurrLocInFrom?: boolean;
    collapsable?: boolean;
    onClearClicked?: () => void;
}

interface IConsumedProps extends TKUIViewportUtilProps {
    value: RoutingQuery;
    onChange?: (routingQuery: RoutingQuery) => void;
    onPreChange?: (from: boolean, location?: Location) => void;
    onInputTextChange?: (from: boolean, text: string) => void;
    bounds?: BBox;
    focusLatLng?: LatLng;
    region?: Region;
}

interface IProps extends IConsumedProps, IClientProps, TKUIWithClasses<IStyle, IProps> {}

interface IStyle {
    main: CSSProps<IProps>;
    header: CSSProps<IProps>;
    title: CSSProps<IProps>;
    btnClear: CSSProps<IProps>;
    iconClear: CSSProps<IProps>;
    btnBack: CSSProps<IProps>;
    fromToPanel: CSSProps<IProps>;
    fromToInputsPanel: CSSProps<IProps>;
    locSelector: CSSProps<IProps>;
    locIcon: CSSProps<IProps>;
    locTarget: CSSProps<IProps>;
    dotIcon: CSSProps<IProps>;
    divider: CSSProps<IProps>;
    swap: CSSProps<IProps>;
    footer: CSSProps<IProps>;
    transportsBtn: CSSProps<IProps>;
    timePrefSelect: CSSProps<IProps>;
}

export type TKUIRoutingQueryInputProps = IProps;
export type TKUIRoutingQueryInputStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIRoutingQueryInput {...props}/>,
    styles: tKUIRoutingQueryInputDefaultStyle,
    classNamePrefix: "TKUIRoutingQueryInput"
};

interface IState {
    timePanelOpen: boolean;
    fromTooltip: boolean;
    toTooltip: boolean;
    fromTooltipText?: string;
    toTooltipText?: string;
    showTransportSwitches: boolean;
}

class TKUIRoutingQueryInput extends React.Component<IProps, IState> {

    private fromTooltipRef: any;
    private toTooltipRef: any;

    constructor(props: IProps) {
        super(props);
        this.state = {
            timePanelOpen: false,
            fromTooltip: false,
            toTooltip: false,
            showTransportSwitches: false
        };
        this.onPrefChange = this.onPrefChange.bind(this);
        this.onSwapClicked = this.onSwapClicked.bind(this);
    }

    private onPrefChange(timePref: TimePreference) {
        GATracker.event({
            category: "query input",
            action: "select time pref",
            label: timePref.toLowerCase()
        });
        if (timePref === TimePreference.NOW
            || (this.props.value.timePref === TimePreference.NOW && !this.props.value.isComplete(true))) {
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
            from: this.props.value.to,
            to: this.props.value.from
        });
    }

    private updateQuery(update: any, callback?: () => void) {
        this.setQuery(Util.iAssign(this.props.value, update));
    }

    private setQuery(update: RoutingQuery) {
        const prevQuery = this.props.value;
        if (update.isComplete(true) &&
            (JSON.stringify(update.from) !== JSON.stringify(prevQuery.from)
                || JSON.stringify(update.to) !== JSON.stringify(prevQuery.to))) {
            FavouritesData.recInstance.add(FavouriteTrip.create(update.from!, update.to!));
        }
        if (this.props.onChange) {
            this.props.onChange(update);
        }
    }

    private showTooltip(from: boolean, text: string | undefined) {
        if (from) {
            this.setState({fromTooltipText: text});
            if (!text) {
                this.fromTooltipRef && this.fromTooltipRef.setVisibleFor(undefined);
            } else {
                this.fromTooltipRef && this.fromTooltipRef.setVisibleFor(10000);
            }
        } else {
            this.setState({toTooltipText: text});
            if (!text) {
                this.toTooltipRef && this.toTooltipRef.setVisibleFor(undefined);
            } else {
                this.toTooltipRef && this.toTooltipRef.setVisibleFor(10000);
            }
        }
    }

    private static timePrefString(timePref: TimePreference, t: TranslationFunction) {
        switch (timePref) {
            case TimePreference.NOW: return t("Leave.now");
            case TimePreference.LEAVE: return t("Leave");
            default: return t("Arrive");
        }
    }

    public static getTimePrefOptions(t: TranslationFunction): any[] {
        return (Object.values(TimePreference))
            .map((value) => {
                return { value: value, label: this.timePrefString(value, t)};
            });
    }

    public render(): React.ReactNode {
        const routingQuery = this.props.value;
        const datePickerDisabled = routingQuery.timePref === TimePreference.NOW;
        const t = this.props.t;
        const fromPlaceholder = t("Where.are.you.going.from?");
        const toPlaceholder = t("Where.do.you.want.to.go?");
        const ariaLabelFrom = routingQuery.from !== null ?
            "From " + routingQuery.from.address :
            fromPlaceholder.substring(0, fromPlaceholder.length - 3);
        const ariaLabelTo = routingQuery.to !== null ?
            "To " + routingQuery.to.address :
            toPlaceholder.substring(0, toPlaceholder.length - 3);
        const classes = this.props.classes;
        const timePrefOptions = TKUIRoutingQueryInput.getTimePrefOptions(t);
        return (
            <div className={classes.main}>
                {this.props.landscape &&
                <div className={classes.header}>
                    {this.props.title &&
                    <div className={classes.title}>
                        {this.props.title}
                    </div>}
                    {this.props.onClearClicked &&
                    <button
                        className={classes.btnClear}
                        aria-hidden={true}
                        onClick={this.props.onClearClicked}
                    >
                        <IconRemove aria-hidden={true}
                                    className={classes.iconClear}
                                    focusable="false"/>
                    </button>}
                </div>
                }
                <div className={classes.fromToPanel}>
                    {this.props.portrait ?
                        this.props.onClearClicked &&
                        <button className={classes.btnBack} onClick={this.props.onClearClicked}>
                            <IconArrowBack/>
                        </button> :
                        <div className={classes.locSelector}>
                            <div className={classNames(classes.locIcon, !routingQuery.from && classes.locTarget)}/>
                            <div className={classes.dotIcon}/>
                            <div className={classes.dotIcon}/>
                            <div className={classes.dotIcon}/>
                            <div className={classNames(classes.locIcon, routingQuery.from && classes.locTarget)}/>
                        </div>}
                    <div className={classes.fromToInputsPanel}>
                        <TKUITooltip
                            overlayContent={this.state.fromTooltipText}
                            arrowColor={tKUIColors.black2}
                            visible={false}
                            onVisibleChange={DeviceUtil.isTouch() ?
                                (visible?: boolean) => !visible && this.showTooltip(true, undefined) : undefined}
                            onRequestClose={() => this.showTooltip(true, undefined)}
                            placement={this.props.portrait ? "bottom" : "left"}
                            reference={(ref: any) => this.fromTooltipRef = ref}
                        >
                            <TKUILocationBox
                                bounds={this.props.bounds}
                                focus={this.props.focusLatLng}
                                value={routingQuery.from}
                                placeholder={fromPlaceholder}
                                onChange={(value: Location | null, highlighted: boolean) => {
                                    if (!highlighted) {
                                        this.updateQuery({from: value});
                                        if (this.props.onPreChange) {
                                            this.props.onPreChange(true, undefined);
                                        }
                                        if (value !== null) {
                                            GATracker.event({
                                                category: "query input",
                                                action: "pick from location",
                                                label: value.isCurrLoc() ? "current location" : "type address"
                                            });
                                        }
                                    } else {
                                        if (this.props.onPreChange) {
                                            this.props.onPreChange(true, value ? value : undefined);
                                        }
                                    }
                                }}
                                onInputTextChange={(text: string) => {
                                    this.props.onInputTextChange && this.props.onInputTextChange(true, text);
                                }}
                                resolveCurr={this.props.resolveCurrLocInFrom} // Resolve curr loc on 'from' when 'to' is already set
                                onFailedToResolve={(highlighted: boolean, error: Error) =>
                                    this.showTooltip(true, this.getErrorMessage(error))}
                                inputAriaLabel={ariaLabelFrom}
                                inputId={"input-from"}
                                sideDropdown={DeviceUtil.isTablet && this.props.isTripPlanner}
                                onFocus={() => this.showTooltip(true, undefined)}
                            />
                        </TKUITooltip>
                        <div className={classes.divider}/>
                        <TKUITooltip
                            overlayContent={this.state.toTooltipText}
                            arrowColor={tKUIColors.black2}
                            visible={false}
                            onVisibleChange={DeviceUtil.isTouch() ?
                                (visible?: boolean) => !visible && this.showTooltip(false, undefined) : undefined}
                            onRequestClose={() => this.showTooltip(false, undefined)}
                            placement={this.props.portrait ? "bottom" : "left"}
                            reference={(ref: any) => this.toTooltipRef = ref}
                        >
                            <TKUILocationBox
                                bounds={this.props.bounds}
                                focus={this.props.focusLatLng}
                                value={routingQuery.to}
                                placeholder={toPlaceholder}
                                onChange={(value: Location | null, highlighted: boolean) => {
                                    if (!highlighted) {
                                        this.updateQuery({to: value});
                                        if (this.props.onPreChange) {
                                            this.props.onPreChange(false, undefined);
                                        }
                                        if (value !== null) {
                                            GATracker.event({
                                                category: "query input",
                                                action: "pick to location",
                                                label: value.isCurrLoc() ? "current location" : "type address"
                                            });
                                        }
                                    } else {
                                        if (this.props.onPreChange) {
                                            this.props.onPreChange(false, value ? value : undefined);
                                        }
                                    }
                                }}
                                onInputTextChange={(text: string) => {
                                    this.props.onInputTextChange && this.props.onInputTextChange(false, text);
                                }}
                                resolveCurr={this.props.resolveCurrLocInFrom} // Resolve curr loc on 'from' when 'to' is already set
                                onFailedToResolve={(highlighted: boolean, error: Error) =>
                                    this.showTooltip(false, this.getErrorMessage(error))}
                                inputAriaLabel={ariaLabelTo}
                                inputId={"input-to"}
                                sideDropdown={DeviceUtil.isTablet && this.props.isTripPlanner}
                                onFocus={() => this.showTooltip(false, undefined)}
                            />
                        </TKUITooltip>
                    </div>
                    <IconSwap className={classes.swap}
                              aria-hidden={true}
                              focusable="false"
                              onClick={this.onSwapClicked}/>
                </div>
                {this.props.landscape &&
                    <div
                        className={classes.footer}>
                        <TKUISelect
                            options={timePrefOptions}
                            value={timePrefOptions.find((option: any) => option.value === this.props.value.timePref)}
                            onChange={(option) => this.onPrefChange(option.value)}
                            className={classes.timePrefSelect}
                            menuStyle={{marginTop: '3px'}}
                        />
                        {routingQuery.timePref !== TimePreference.NOW && this.props.region &&
                        <TKUIDateTimePicker     // Switch rotingQuery.time to region timezone.
                            value={routingQuery.time}
                            timeZone={this.props.region.timezone}
                            onChange={(date: Moment) => this.updateQuery({time: date})}
                            timeFormat={DateTimeUtil.TIME_FORMAT}
                            dateFormat={DateTimeUtil.DATE_TIME_FORMAT}
                            disabled={datePickerDisabled}
                        />
                        }
                        {this.props.showTransportsBtn !== false &&
                        <TKUITooltip
                            placement="right"
                            overlay={
                                <TKUITransportSwitchesView
                                    onMoreOptions={this.props.onShowTransportOptions ?
                                        () => {
                                            this.setState({showTransportSwitches: false});
                                            this.props.onShowTransportOptions!();
                                        } : undefined}
                                />
                            }
                            visible={this.state.showTransportSwitches}
                            onVisibleChange={(visible?: boolean) => !visible && this.setState({showTransportSwitches: false})}
                        >
                            <button className={classes.transportsBtn}
                                    onClick={() => this.setState({showTransportSwitches: true})}
                            >
                                Transport options
                            </button>
                        </TKUITooltip>}
                    </div>
                }
            </div>
        );
    }

    private getErrorMessage(error: Error) {
        let errorMessage: string;
        if (TKErrorHelper.hasErrorCode(error, ERROR_UNABLE_TO_RESOLVE_ADDRESS)) {
            errorMessage = "Cannot resolve address, try another search and pick a result from the autocomplete list."
        } else if (TKErrorHelper.hasErrorCode(error, ERROR_GEOLOC_INACCURATE)) {
            // Alternatively can show more specific: "Could not get your location accurately. Please set manually"
            errorMessage = "Could not get your location. Please set manually";
        } else if (TKErrorHelper.hasErrorCode(error, ERROR_GEOLOC_DENIED)) {
            errorMessage = "You blocked this site access to your location, please unblock or set it manually";
        } else {
            errorMessage = "Could not get your location. Please set manually";
        }
        return errorMessage;
    }

    public componentDidUpdate(prevProps: Readonly<IProps>): void {
        if (!prevProps.value.from && this.props.value.from) {
            this.showTooltip(true,undefined);
        }
        if (!prevProps.value.to && this.props.value.to) {
            this.showTooltip(false,undefined);
        }
    }

}

const Consumer: React.SFC<{children: (props: IConsumedProps) => React.ReactNode}> = props => {
    return (
        <TKUIViewportUtil>
            {(viewportProps: TKUIViewportUtilProps) =>
                <RoutingResultsContext.Consumer>
                    {(routingContext: IRoutingResultsContext) => {
                        const region = routingContext.region;
                        const bounds = region ? region.bounds : undefined;
                        const focusLatLng = region ? (region.cities.length !== 0 ? region.cities[0] : region.bounds.getCenter()) : undefined;
                        const consumerProps: IConsumedProps = {
                            value: routingContext.query,
                            onChange: routingContext.onQueryChange,
                            onPreChange: routingContext.onPreChange,
                            onInputTextChange: routingContext.onInputTextChange,
                            bounds: bounds,
                            focusLatLng: focusLatLng,
                            region: routingContext.region,
                            ...viewportProps
                        };
                        return props.children!(consumerProps);
                    }}
                </RoutingResultsContext.Consumer>
            }
        </TKUIViewportUtil>
    );
};

const Mapper: PropsMapper<IClientProps, Subtract<IProps, TKUIWithClasses<IStyle, IProps>>> =
    ({inputProps, children}) =>
        <Consumer>
            {(consumedProps: IConsumedProps) =>
                children!({...inputProps, ...consumedProps})}
        </Consumer>;

export default connect((config: TKUIConfig) => config.TKUIRoutingQueryInput, config, Mapper);
export {TKUIRoutingQueryInput as TKUIRoutingQueryInputClass}