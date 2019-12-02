import * as React from "react";
import "./QueryInputDelete.css";
import LocationBox from "../location_box/LocationBox";
import MultiGeocoder from "../geocode/MultiGeocoder";
import Location from "../model/Location";
import BBox from "../model/BBox";
import LatLng from "../model/LatLng";
import {ReactComponent as IconSwap} from '../images/ic-swap.svg';
import {ReactComponent as IconTriangleDown} from '../images/ic-triangle-down.svg';
import 'react-datepicker/dist/react-datepicker.css';
import {Moment} from "moment";
import RoutingQuery, {TimePreference} from "../model/RoutingQuery";
import Util from "../util/Util";
import 'rc-tooltip/assets/bootstrap_white.css';
import DateTimePicker from "../time/DateTimePicker";
import DateTimeUtil from "../util/DateTimeUtil";
import {ReactElement} from "react";
import GATracker from "../analytics/GATracker";
import DeviceUtil from "../util/DeviceUtil";
import MultiGeocoderOptions from "../geocode/MultiGeocoderOptions";
import {IRoutingResultsContext, RoutingResultsContext} from "../trip-planner/RoutingResultsProvider";
import FavouriteTrip from "../model/favourite/FavouriteTrip";
import FavouritesData from "../data/FavouritesData";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {ClassNameMap, Styles} from "react-jss";
import {tKUIRoutingQueryInputDefaultStyle} from "./TKUIRoutingQueryInput.css";
import {ReactComponent as IconRemove} from '../images/ic-cross.svg';
import classNames from "classnames";
import Tooltip from "rc-tooltip";
import TKUITransportOptionsView from "../options/TKUITransportOptionsView";
import "../trip/TripAltBtn.css";
import {ITKUIComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {connect, PropsMapper} from "../config/TKConfigHelper";
import {Subtract} from "utility-types";
import Region from "model/region/Region";
import Select from 'react-select';
interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    onShowOptions?: () => void;
    isTripPlanner?: boolean;
    collapsable?: boolean;
    geocoderOptions?: MultiGeocoderOptions;
}

interface IConsumedProps {
    value: RoutingQuery;
    onChange?: (routingQuery: RoutingQuery) => void;
    onPreChange?: (from: boolean, location?: Location) => void;
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
    fromToPanel: CSSProps<IProps>;
    fromToInputsPanel: CSSProps<IProps>;
    locSelector: CSSProps<IProps>;
    locIcon: CSSProps<IProps>;
    locTarget: CSSProps<IProps>;
    dotIcon: CSSProps<IProps>;
    divider: CSSProps<IProps>;
    swap: CSSProps<IProps>;
    footer: CSSProps<IProps>;
    timePrefFace: CSSProps<IProps>;
    timePref: CSSProps<IProps>;
    transportsBtn: CSSProps<IProps>;
    selectContainer: CSSProps<IProps>;
    selectControl: CSSProps<IProps>;
    selectMenu: CSSProps<IProps>;
    selectOption: CSSProps<IProps>;
    selectOptionFocused: CSSProps<IProps>;
    selectOptionSelected: CSSProps<IProps>;
}

export type TKUIRoutingQueryInputProps = IProps;
export type TKUIRoutingQueryInputStyle = IStyle;

const config: ITKUIComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIRoutingQueryInput {...props}/>,
    styles: tKUIRoutingQueryInputDefaultStyle,
    classNamePrefix: "TKUIRoutingQueryInput"
};

interface IState {
    timePanelOpen: boolean;
    fromTooltip: boolean;
    toTooltip: boolean;
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
            timePanelOpen: false,
            fromTooltip: false,
            toTooltip: false
        };
        this.geocodingData = new MultiGeocoder(this.props.geocoderOptions);
        this.onPrefChange = this.onPrefChange.bind(this);
        this.onSwapClicked = this.onSwapClicked.bind(this);
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

    private timePrefString(timePref: TimePreference) {
        switch (timePref) {
            case TimePreference.NOW: return "Leave now";
            case TimePreference.LEAVE: return "Leave";
            default: return "Arrive";
        }
    }

    private getTimePrefOptions(): any[] {
        return (Object.values(TimePreference))
            .map((value) => {
                return { value: value, label: this.timePrefString(value)};
            });
    }

    public render(): React.ReactNode {
        const routingQuery = this.props.value;
        const datePickerDisabled = routingQuery.timePref === TimePreference.NOW;
        const fromPlaceholder = "Where are you going from?";
        const toPlaceholder = "Where do you want to go?";
        const ariaLabelFrom = routingQuery.from !== null ?
            "From " + routingQuery.from.address :
            fromPlaceholder.substring(0, fromPlaceholder.length - 3);
        const ariaLabelTo = routingQuery.to !== null ?
            "To " + routingQuery.to.address :
            toPlaceholder.substring(0, toPlaceholder.length - 3);
        const classes = this.props.classes;
        const timePrefOptions = this.getTimePrefOptions();
        const injectedStyles = this.props.injectedStyles;
        const SelectDownArrow = (props: any) => <IconTriangleDown style={{width: '9px', height: '9px'}}/>;
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
                <div className={classes.fromToPanel}>
                    <div className={classes.locSelector}>
                        <div className={classNames(classes.locIcon, !routingQuery.from && classes.locTarget)}/>
                        <div className={classes.dotIcon}/>
                        <div className={classes.dotIcon}/>
                        <div className={classes.dotIcon}/>
                        <div className={classNames(classes.locIcon, routingQuery.from && classes.locTarget)}/>
                    </div>
                    <div className={classes.fromToInputsPanel}>
                        <LocationBox
                            geocodingData={this.geocodingData}
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
                                        GATracker.instance.send("query input", "pick location",
                                            value.isCurrLoc() ? "current location" : "type address");
                                    }
                                } else {
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
                        <div className={classes.divider}/>
                        <LocationBox
                            geocodingData={this.geocodingData}
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
                                        GATracker.instance.send("query input", "pick location",
                                            value.isCurrLoc() ? "current location" : "type address");
                                    }
                                } else {
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
                    <IconSwap className={classes.swap}
                              aria-hidden={true}
                              focusable="false"
                              onClick={this.onSwapClicked}/>
                </div>
                <div className={classes.footer + " QueryInput-timeBtnPanel gl-flex gl-align-center gl-space-between"}>
                    {/*TODO: SEGUIR ACÁ style select dropdown */}
                    <Select
                        options={timePrefOptions}
                        value={timePrefOptions.find((option: any) => option.value === this.props.value.timePref)}
                        onChange={(option) => this.onPrefChange(option.value)}
                        styles={{
                            container: styles => ({...styles, ...injectedStyles.selectContainer}),
                            control: styles => ({...styles, ...injectedStyles.selectControl}),
                            menu: styles => ({...styles, ...injectedStyles.selectMenu}),
                            option: (styles: any, state: any) => ({
                                ...styles, ...injectedStyles.selectOption,
                                ...(state.isFocused && injectedStyles.selectOptionFocused),
                                ...(state.isSelected && injectedStyles.selectOptionSelected)})
                        }}
                        components={{ IndicatorsContainer: SelectDownArrow }}
                        // menuIsOpen={true}
                    />
                    {routingQuery.timePref !== TimePreference.NOW &&
                        <DateTimePicker     // Switch rotingQuery.time to region timezone.
                            value={this.props.region ? routingQuery.time.tz(this.props.region.timezone) : routingQuery.time}
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
                    {this.props.onShowOptions &&
                    <Tooltip placement="right"
                             overlay={<TKUITransportOptionsView onMoreOptions={this.props.onShowOptions}/>}
                             overlayClassName="app-style TripRow-altTooltip"
                             mouseEnterDelay={.5}
                             trigger={["click"]}
                    >
                        <button className={classes.transportsBtn}>
                            Transport options
                        </button>
                    </Tooltip>
                    }
                </div>
            </div>
        );
    }
}

const Consumer: React.SFC<{children: (props: IConsumedProps) => React.ReactNode}> = props => {
    return (
        <RoutingResultsContext.Consumer>
            {(routingContext: IRoutingResultsContext) => {
                const region = routingContext.region;
                const bounds = region ? region.bounds : undefined;
                const focusLatLng = region ? (region.cities.length !== 0 ? region.cities[0] : region.bounds.getCenter()) : undefined;
                const consumerProps: IConsumedProps = {
                    value: routingContext.query,
                    onChange: routingContext.onQueryChange,
                    onPreChange: routingContext.onPreChange,
                    bounds: bounds,
                    focusLatLng: focusLatLng,
                    region: routingContext.region

                };
                return props.children!(consumerProps);
            }}
        </RoutingResultsContext.Consumer>
    );
};

const Mapper: PropsMapper<IClientProps, Subtract<IProps, TKUIWithClasses<IStyle, IProps>>> =
    ({inputProps, children}) =>
        <Consumer>
            {(consumedProps: IConsumedProps) =>
                children!({...inputProps, ...consumedProps})}
        </Consumer>;

export default connect((config: TKUIConfig) => config.TKUITKUIRoutingQueryInput, config, Mapper);