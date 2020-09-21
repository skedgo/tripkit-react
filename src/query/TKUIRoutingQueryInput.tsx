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
import TKUICard, {CardPresentation} from "../card/TKUICard";

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    title?: string;
    showTransportsBtn?: boolean;
    onShowTransportOptions?: () => void;
    isTripPlanner?: boolean;
    resolveCurrLocInFrom?: boolean;
    collapsable?: boolean;
    onClearClicked?: () => void;
    shouldFocusAfterRender?: boolean;
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
    private transportsRef: any;

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
        return Object.values(TimePreference).map((value) => ({value: value, label: this.timePrefString(value, t)}));
    }

    public render(): React.ReactNode {
        const routingQuery = this.props.value;
        const datePickerDisabled = routingQuery.timePref === TimePreference.NOW;
        const t = this.props.t;
        const fromPlaceholder = t("Where.are.you.going.from?");
        const toPlaceholder = t("Where.do.you.want.to.go?");
        const ariaLabelFrom = routingQuery.from !== null ?
            "From " + routingQuery.from.getDisplayString() :
            this.state.fromTooltipText ? this.state.fromTooltipText + " " + fromPlaceholder :
            fromPlaceholder;
        const ariaLabelTo = routingQuery.to !== null ?
            "To " + routingQuery.to.getDisplayString() :
            this.state.toTooltipText ? this.state.toTooltipText + " " + toPlaceholder :
            toPlaceholder;
        const classes = this.props.classes;
        const timePrefOptions = TKUIRoutingQueryInput.getTimePrefOptions(t);
        const inputToId = "input-to";
        const inputFromId = "input-from";
        return (
            <TKUICard
                presentation={CardPresentation.NONE}
                title={this.props.landscape ? this.props.title : undefined}
                onRequestClose={this.props.landscape ? this.props.onClearClicked : undefined}
                closeAriaLabel={"close query input"}
                headerDividerVisible={false}
                scrollable={false}
                overflowVisible={true}
                mainFocusElemId={!routingQuery.from ? inputFromId : !routingQuery.to ? inputToId : undefined}
                shouldFocusAfterRender={this.props.shouldFocusAfterRender}
            >
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
                                onFailedToResolve={(highlighted: boolean, error: Error) => {
                                    this.showTooltip(true, this.getErrorMessage(error, t));
                                    const fromInput = document.getElementById(inputFromId);
                                    // Need to use a timeout since if not location box autocomplete popup don't show.
                                    setTimeout(() => fromInput && fromInput.focus(), 1);
                                }}
                                inputAriaLabel={ariaLabelFrom}
                                inputId={inputFromId}
                                sideDropdown={DeviceUtil.isTablet && this.props.isTripPlanner}
                                menuStyle={{
                                    borderTopLeftRadius: '0',
                                    borderTopRightRadius: '0'
                                }}
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
                                onFailedToResolve={(highlighted: boolean, error: Error) => {
                                    this.showTooltip(false, this.getErrorMessage(error, t));
                                    const toInput = document.getElementById(inputToId);
                                    // Need to use a timeout since if not location box autocomplete popup don't show.
                                    setTimeout(() => toInput && toInput.focus(), 1);
                                }}
                                inputAriaLabel={ariaLabelTo}
                                inputId={inputToId}
                                sideDropdown={DeviceUtil.isTablet && this.props.isTripPlanner}
                                menuStyle={{
                                    borderTopLeftRadius: '0',
                                    borderTopRightRadius: '0'
                                }}
                            />
                        </TKUITooltip>
                    </div>
                    <button className={classes.swap} onClick={this.onSwapClicked} aria-label={"swap from and to"}>
                        <IconSwap aria-hidden={true} focusable="false"/>
                    </button>
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
                                onRequestClose={() => this.setState({showTransportSwitches: false})}
                            />
                        }
                        visible={this.state.showTransportSwitches}
                        onVisibleChange={(visible?: boolean) => !visible && this.setState({showTransportSwitches: false})}
                        destroyTooltipOnHide={true} // Needed so TKUICard unmounts and focus is returned to transports btn.
                    >
                        <button className={classes.transportsBtn}
                                onClick={() => this.setState({showTransportSwitches: true})}
                        >
                            {t("Transport")}
                        </button>
                    </TKUITooltip>}
                </div>
                }
            </TKUICard>
        );
    }

    private getErrorMessage(error: Error, t: TranslationFunction) {
        let errorMessage: string;
        if (TKErrorHelper.hasErrorCode(error, ERROR_UNABLE_TO_RESOLVE_ADDRESS)) {
            errorMessage = "Cannot resolve address, try another search and pick a result from the autocomplete list."
        } else if (TKErrorHelper.hasErrorCode(error, ERROR_GEOLOC_INACCURATE)) {
            // Alternatively can show more specific: "Could not get your location accurately. Please set manually"
            errorMessage = t("Could.not.determine.your.current.location.");
        } else if (TKErrorHelper.hasErrorCode(error, ERROR_GEOLOC_DENIED)) {
            errorMessage = t("You.blocked.this.site.access.to.your.location");
        } else {
            errorMessage = t("Could.not.determine.your.current.location.");
        }
        return errorMessage;
    }

    public componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<IState>): void {
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