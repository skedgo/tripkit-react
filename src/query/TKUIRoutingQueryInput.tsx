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
import TKUIDateTimePicker from "../time/TKUIDateTimePicker";
import DateTimeUtil from "../util/DateTimeUtil";
import GATracker from "../analytics/GATracker";
import DeviceUtil, {BROWSER} from "../util/DeviceUtil";
import {IRoutingResultsContext, RoutingResultsContext} from "../trip-planner/RoutingResultsProvider";
import FavouriteTrip from "../model/favourite/FavouriteTrip";
import FavouritesData from "../data/FavouritesData";
import {CSSProps, overrideClass, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {tKUIRoutingQueryInputDefaultStyle} from "./TKUIRoutingQueryInput.css";
import {ReactComponent as IconArrowBack} from '../images/ic-arrow-back.svg';
import classNames from "classnames";
import TKUITransportSwitchesView from "../options/TKUITransportSwitchesView";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {connect, PropsMapper} from "../config/TKConfigHelper";
import {Subtract} from "utility-types";
import {TKUIViewportUtil, TKUIViewportUtilProps} from "../util/TKUIResponsiveUtil";
import TKUITooltip from "../card/TKUITooltip";
import TKUISelect, {SelectOption} from "../buttons/TKUISelect";
import {TranslationFunction} from "../i18n/TKI18nProvider";
import {ERROR_GEOLOC_DENIED, ERROR_GEOLOC_INACCURATE} from "../util/GeolocationUtil";
import TKErrorHelper, {ERROR_UNABLE_TO_RESOLVE_ADDRESS} from "../error/TKErrorHelper";
import TKUICard, {CardPresentation} from "../card/TKUICard";
import HasCard, {HasCardKeys} from "../card/HasCard";
import {tKUIColors, TKUITheme, white} from "../jss/TKUITheme";

interface IClientProps extends TKUIWithStyle<IStyle, IProps>, Pick<HasCard, HasCardKeys.title> {

    // Included and documented in HasCard, but put here to force it to be at the top.
    title?: string;

    /**
     * Stating if time select component should be displayed or not.
     * @default true
     */
    showTimeSelect?: boolean;

    /**
     * Stating if the _transports_ button should be displayed or not.
     * @default true
     */
    showTransportsBtn?: boolean;

    /**
     * Defining the _transports_ button text.
     * @default 'Transport'
     */
     transportBtnText?: string

    /**
     * Function that will be run when the user clicks on button to show transport options.
     * @ctype
     */
     onTransportButtonClick?: () => void;

    /**
     * Function that will be run when the user clicks on button to show full transport options.
     * @ctype
     */
    onShowTransportOptions?: () => void;

    /**
     * Stating if the _from_ and _to_ location input dropdowns should be displayed to the side of the input element,
     * instead of below it.
     * @default false
     */
    sideDropdown?: boolean;

    /**
     * Stating if should resolve current location in from / to inputs.
     * @default true
     */
    resolveCurrLocation?: boolean;

    /**
     * Function that will be run when the user clicks the close (cross) button (landscape) or the back (arrow) button
     * (portrait).
     * @ctype
     */
    onClearClicked?: () => void;
    shouldFocusAfterRender?: boolean;
}

interface IConsumedProps extends TKUIViewportUtilProps {
    /**
     * Routing query
     * @ctype
     * @default {@link TKState#query}
     */
    value: RoutingQuery;

    /**
     * Routing query change callback.
     * @ctype
     * @default {@link TKState#onQueryChange}
     */
    onChange?: (routingQuery: RoutingQuery) => void;

    /**
     * @ctype
     * @default {@link TKState#onPreChange}
     */
    onPreChange?: (from: boolean, location?: Location) => void;

    /**
     * @ctype
     * @default {@link TKState#onInputTextChange}
     */
    onInputTextChange?: (from: boolean, text: string) => void;

    /**
     * Bounding box to restrict from / to location search.
     * @ctype
     * @default Bounds of the current region: {@link TKState#region}.bounds
     */
    bounds?: BBox;

    /**
     * Coordinates to focus from / to location search.
     * @ctype
     * @default The center of the main city of current region ({@link TKState#region})
     */
    focusLatLng?: LatLng;

    /**
     * Id of timezone to consider for time display / input.
     * @default Timezone of the current region: {@link TKState#region}.timezone
     */
    timezone?: string;
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
    private timePrefOptions: SelectOption[];

    constructor(props: IProps) {
        super(props);
        this.state = {
            timePanelOpen: false,
            fromTooltip: false,
            toTooltip: false,
            showTransportSwitches: false
        };
        // Create options on constructor so it happens just once, doing it on render causes issues.
        this.timePrefOptions = TKUIRoutingQueryInput.getTimePrefOptions(this.props.t);
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

    public static getTimePrefOptions(t: TranslationFunction): SelectOption[] {
        return Object.values(TimePreference).map((value) => ({value: value, label: this.timePrefString(value, t)}));
    }

    public render(): React.ReactNode {
        const routingQuery = this.props.value;
        const datePickerDisabled = routingQuery.timePref === TimePreference.NOW;
        const t = this.props.t;
        const fromPlaceholder = t("Start.location");
        const toPlaceholder = t("End.location");
        const ariaLabelFrom = routingQuery.from !== null ?
            "From " + routingQuery.from.getDisplayString() :
            this.state.fromTooltipText ? this.state.fromTooltipText + " " + fromPlaceholder :
            fromPlaceholder;
        const ariaLabelTo = routingQuery.to !== null ?
            "To " + routingQuery.to.getDisplayString() :
            this.state.toTooltipText ? this.state.toTooltipText + " " + toPlaceholder :
            toPlaceholder;
        const classes = this.props.classes;
        const inputToId = "input-to";
        const inputFromId = "input-from";
        const showTimeSelect = this.props.showTimeSelect !== undefined ? this.props.showTimeSelect : true;
        const showTransportsBtn = this.props.showTransportsBtn !== undefined ? this.props.showTransportsBtn : true;
        return (
            <TKUICard
                presentation={CardPresentation.NONE}
                title={this.props.landscape ? this.props.title : undefined}
                onRequestClose={this.props.landscape ? this.props.onClearClicked : undefined}
                closeAriaLabel={"Close query input"}
                scrollable={false}
                mainFocusElemId={!routingQuery.from ? inputFromId : !routingQuery.to ? inputToId : undefined}
                shouldFocusAfterRender={this.props.shouldFocusAfterRender}
                styles={{
                    main: overrideClass({overflow: 'visible'}),
                    divider: overrideClass({borderBottom: 'none'})
                }}
                role="form"
            >
                <div className={classes.fromToPanel}>
                    {this.props.portrait ?
                        this.props.onClearClicked &&
                        <button className={classes.btnBack}
                                onClick={this.props.onClearClicked}
                                aria-label="Back to quick search view"
                        >
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
                                resolveCurr={this.props.resolveCurrLocation} // Resolve curr loc on 'from' when 'to' is already set
                                onFailedToResolve={(highlighted: boolean, error: Error) => {
                                    this.showTooltip(true, this.getErrorMessage(error, t));
                                    const fromInput = document.getElementById(inputFromId);
                                    // Need to use a timeout since if not location box autocomplete popup don't show.
                                    setTimeout(() => fromInput && fromInput.focus(), 1);
                                }}
                                inputAriaLabel={ariaLabelFrom}
                                inputId={inputFromId}
                                sideDropdown={this.props.sideDropdown}
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
                                resolveCurr={this.props.resolveCurrLocation} // Resolve curr loc on 'from' when 'to' is already set
                                onFailedToResolve={(highlighted: boolean, error: Error) => {
                                    this.showTooltip(false, this.getErrorMessage(error, t));
                                    const toInput = document.getElementById(inputToId);
                                    // Need to use a timeout since if not location box autocomplete popup don't show.
                                    setTimeout(() => toInput && toInput.focus(), 1);
                                }}
                                inputAriaLabel={ariaLabelTo}
                                inputId={inputToId}
                                sideDropdown={this.props.sideDropdown}
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
                {(showTimeSelect || showTransportsBtn) &&
                <div className={classes.footer}
                     style={!showTimeSelect && showTransportsBtn ? {
                         justifyContent: 'flex-end' // When making JSS styles updates dynamic this can be moved to .css.ts
                     } : undefined}
                >
                    {showTimeSelect &&
                    <TKUISelect
                        options={this.timePrefOptions}
                        value={this.timePrefOptions.find((option: any) => option.value === this.props.value.timePref)}
                        onChange={(option) => this.onPrefChange(option.value)}
                        styles={() => ({
                            // Pass a function since injectedStyles.timePrefSelect depends on theme, and if not
                            // a theme update would not be reflected (e.g. switch dark / light mode).
                            // This will not be needed anymore when get dynamic style updates working.
                            main: overrideClass(this.props.injectedStyles.timePrefSelect),
                            menu: overrideClass({ marginTop: '3px' }),
                            container: overrideClass({ minWidth: '100%' }),
                        })}
                        ariaLabel={"Time preference"}
                    />}
                    {showTimeSelect && routingQuery.timePref !== TimePreference.NOW &&
                    <TKUIDateTimePicker     // Switch rotingQuery.time to region timezone.
                        value={routingQuery.time}
                        timeZone={this.props.timezone}
                        onChange={(date: Moment) => this.updateQuery({time: date})}
                        timeFormat={DateTimeUtil.TIME_FORMAT}
                        dateFormat={DateTimeUtil.DATE_TIME_FORMAT}
                        disabled={datePickerDisabled}
                        styles={(theme: TKUITheme) => ({
                            datePicker: overrideClass({
                                color: theme.isLight ? '#666d71' : white(1)    // 4.50:1 contrast for AA
                            })
                        })}
                    />
                    }
                    {showTransportsBtn &&
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
                                onClick={this.props.onTransportButtonClick ?? (() => this.setState({showTransportSwitches: true}))}
                        >
                            {this.props.transportBtnText ?? t("Transport")}
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
            errorMessage = t("Could.not.determine.your.location.accurately..Please.set.manually.");
        } else if (TKErrorHelper.hasErrorCode(error, ERROR_GEOLOC_DENIED)) {
            errorMessage = DeviceUtil.browser === BROWSER.SAFARI ?
                t("You.blocked.this.site.access.to.your.location,.either.at.browser.or.system.level") :
                t("You.blocked.this.site.access.to.your.location");
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
        // To refresh translations of time pref strings after i18n promise resolves (i18nOverridden turn true),
        // which are computed on component constructor, and so do not automatically update on re-render.
        if (this.props.i18nOverridden !== prevProps.i18nOverridden) {
            this.timePrefOptions = TKUIRoutingQueryInput.getTimePrefOptions(this.props.t);
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
                        const timezone = region ? region.timezone : undefined;
                        const consumerProps: IConsumedProps = {
                            value: routingContext.query,
                            onChange: routingContext.onQueryChange,
                            onPreChange: routingContext.onPreChange,
                            onInputTextChange: routingContext.onInputTextChange,
                            bounds: bounds,
                            focusLatLng: focusLatLng,
                            timezone: timezone,
                            ...viewportProps
                        };
                        return props.children!(consumerProps);
                    }}
                </RoutingResultsContext.Consumer>
            }
        </TKUIViewportUtil>
    );
};

const Mapper: PropsMapper<IClientProps & Partial<IConsumedProps>, Subtract<IProps, TKUIWithClasses<IStyle, IProps>>> =
    ({inputProps, children}) =>
        <Consumer>
            {(consumedProps: IConsumedProps) =>
                children!({...inputProps, ...consumedProps})}
        </Consumer>;

/**
 *  Allows the user to enter _depart_ and _arrive_ locations through address and place autocompletion, set the
 *  _time to depart_ or the _time to arrive_, and select what _transport modes_ should be considered.
 *
 *  It can be seen as building or updating a [routing query object]() in an uncontrolled way, through
 *  ```query``` and ```onChange``` properties. Both of them are _connection properties_, as explained in
 *  [this section](#/Main%20SDK%20component%3A%20TKRoot), which means that if no value is explicitly provided when using the
 *  component, then values from SDK state are passed by default, i.e., TKUIRoutingQueryInput gets connected to the SDK
 *  state.
 */
export default connect((config: TKUIConfig) => config.TKUIRoutingQueryInput, config, Mapper);

export {TKUIRoutingQueryInput as TKUIRoutingQueryInputClass}