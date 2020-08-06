import * as React from "react";
import Util from "../util/Util";
import Region from "../model/region/Region";
import RegionsData from "../data/RegionsData";
import ModeIdentifier from "../model/region/ModeIdentifier";
import {MapLocationType} from "../model/location/MapLocationType";
import Tooltip from "rc-tooltip";
import Constants from "../util/Constants";
import {IOptionsContext, OptionsContext} from "./OptionsProvider";
import {IRoutingResultsContext, RoutingResultsContext} from "../trip-planner/RoutingResultsProvider";
import TKUICard, {CardPresentation} from "../card/TKUICard";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {connect, PropsMapper} from "../config/TKConfigHelper";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {tKUIProfileViewDefaultStyle} from "./TKUIProfileView.css";
import {Subtract} from "utility-types";
import TKUIUserPriorities from "./TKUIUserPriorities";
import TKUserProfile from "../model/options/TKUserProfile";
import TKWeightingPreferences from "../model/options/TKWeightingPreferences";
import {TKUIViewportUtil, TKUIViewportUtilProps} from "../util/TKUIResponsiveUtil";
import {ReactComponent as IconRightArrow} from "../images/ic-angle-right.svg";
import {ReactComponent as IconAngleDown} from "../images/ic-angle-down.svg";
import classNames from "classnames";
import TKUITransportOptionsView from "./TKUITransportOptionsView";
import TKUIPrivacyOptionsView from "./TKUIPrivacyOptionsView";
import {TKUISlideUpOptions, TKUISlideUpPosition} from "../card/TKUISlideUp";
import {cardSpacing} from "../jss/TKUITheme";
import TKUISelect from "../buttons/TKUISelect";


export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    onRequestClose?: () => void;
    slideUpOptions?: TKUISlideUpOptions;
}

interface IConsumedProps extends IOptionsContext, TKUIViewportUtilProps {
    region?: Region;
}

export interface IStyle {
    main: CSSProps<IProps>;
    section: CSSProps<IProps>;
    sectionTitle: CSSProps<IProps>;
    sectionBody: CSSProps<IProps>;
    optionRow: CSSProps<IProps>;
    optionLink: CSSProps<IProps>;
    checkboxRow: CSSProps<IProps>;
    specialServices: CSSProps<IProps>;
    icon: CSSProps<IProps>;
    infoIcon: CSSProps<IProps>;
    tooltip: CSSProps<IProps>;
    tooltipOverlay: CSSProps<IProps>;
    checkboxGroup: CSSProps<IProps>;
    closeBtn: CSSProps<IProps>;
    link: CSSProps<IProps>;
    optionSelect: CSSProps<IProps>;
}

interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> {}

export type TKUIProfileViewProps = IProps;
export type TKUIProfileViewStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIProfileView {...props}/>,
    styles: tKUIProfileViewDefaultStyle,
    classNamePrefix: "TKUIProfileView"
};

interface IState {
    update: TKUserProfile;
    schoolModeId?: ModeIdentifier;
    pickSchoolError: boolean;
    showPersonalData: boolean;
    showTransports: boolean;
    showPriorities: boolean;
}

class TKUIProfileView extends React.Component<IProps, IState> {

    private GreenCheckbox;

    constructor(props: IProps) {
        super(props);
        this.state = {
            update: this.props.userProfile,
            pickSchoolError: false,
            showPersonalData: false,
            showTransports: false,
            showPriorities: false
        };
        RegionsData.instance.getModeIdentifierP(ModeIdentifier.SCHOOLBUS_ID).then((modeId?: ModeIdentifier) =>
            this.setState({ schoolModeId: modeId }));
        this.onMapOptionChange = this.onMapOptionChange.bind(this);
    }

    private onMapOptionChange(option: MapLocationType, checked: boolean) {
        this.setState(prevState =>  {
            const mapLayersUpdate = prevState.update.mapLayers.filter((layer: MapLocationType) => layer !== option);
            if (checked) {
                mapLayersUpdate.push(option);
            }
            return {update: Util.iAssign(prevState.update, {mapLayers: mapLayersUpdate})}
        });
    }

    private applyChanges() {
        if (!this.checkValid()) {
            return;
        }
        if (this.props.onUserProfileChange) {
            this.props.onUserProfileChange(this.state.update);
        }
    }

    private close(apply: boolean) {
        if (apply) {
            this.applyChanges();
        }
        if (this.props.onRequestClose) {
            this.props.onRequestClose();
        }
    }

    private checkValid(): boolean {
        return true;
    }

    public render(): React.ReactNode {
        const classes = this.props.classes;
        const personalDataSettings = this.state.showPersonalData &&
            <TKUIPrivacyOptionsView
                value={this.state.update}
                onChange={(update: TKUserProfile) => this.setState({update: update})}
                onShowTransportOptions={() => this.setState({showTransports: true})}
                onRequestClose={() =>
                    this.setState({showPersonalData: false},
                        () => this.applyChanges())}
                slideUpOptions={{
                    position: TKUISlideUpPosition.UP,
                    modalUp: {top: cardSpacing(this.props.landscape), unit: 'px'},
                    draggable: false
                }}
            />;
        const transportSettings = this.state.showTransports &&
            <TKUITransportOptionsView
                value={this.state.update}
                onChange={(update: TKUserProfile) => this.setState({update: update})}
                onRequestClose={() =>
                    this.setState({showTransports: false},
                        () => this.applyChanges())}
                slideUpOptions={{
                    initPosition: TKUISlideUpPosition.UP,
                    modalUp: {top: cardSpacing(this.props.landscape), unit: 'px'},
                    draggable: false
                }}
            />;
        const prioritiesSettings = this.state.showPriorities
            && <TKUIUserPriorities
                onRequestClose={() => this.setState({showPriorities: false},
                    () => this.applyChanges())}
                value={this.state.update.weightingPrefs}
                onChange={(prefsUpdate: TKWeightingPreferences) =>
                    this.setState((prevState: IState) => ({update: Util.iAssign(prevState.update, {weightingPrefs: prefsUpdate})}))}
                slideUpOptions={{
                    position: TKUISlideUpPosition.UP,
                    modalUp: {top: cardSpacing(this.props.landscape), unit: 'px'},
                    draggable: false
                }}
            />;
        const t = this.props.t;
        const appearanceOptions: any[] = [
            { value: undefined, label: t("Match.OS")},
            { value: false, label: t("Light")},
            { value: true, label: t("Dark")}
        ];
        return (
            <TKUICard
                title={t("Profile")}
                presentation={this.props.landscape ? CardPresentation.MODAL : CardPresentation.SLIDE_UP}
                onRequestClose={() => this.close(true)}
                slideUpOptions={this.props.slideUpOptions}
            >
                <div className={classes.main}>
                    <div className={classes.section}>
                        <div className={classes.sectionBody}>
                            <div className={classNames(classes.optionRow, classes.optionLink)}
                                 onClick={() => this.setState({showPersonalData: true})}
                            >
                                {t("My.Personal.Data")}
                                <IconRightArrow/>
                            </div>
                        </div>
                    </div>
                    <div className={classes.section}>
                        <div className={classes.sectionTitle}>
                            {t("My.Transport")}
                        </div>
                        <div className={classes.sectionBody}>
                            <div className={classNames(classes.optionRow, classes.optionLink)}
                                 onClick={() => this.setState({showTransports: true})}
                            >
                                {t("Transport")}
                                <IconRightArrow/>
                            </div>
                            <div className={classNames(classes.optionRow, classes.optionLink)}
                                 onClick={() => this.setState({showPriorities: true})}
                            >
                                {t("Priorities")}
                                <IconRightArrow/>
                            </div>
                        </div>
                    </div>
                    {false &&   // Disabled for now
                    <div className={classes.section}>
                        <div className={classes.sectionTitle} tabIndex={0}>
                            Map Options
                        </div>
                        <div className={classes.sectionBody}>
                            <div className={classNames(classes.optionRow, classes.specialServices)}>
                                <div>
                                    <img src={Constants.absUrl("/images/modeicons/ic-myway.svg")}
                                         className={classes.icon}
                                         aria-hidden="true"/>
                                    {/*<Checkbox id="mo-mw"*/}
                                    {/*checked={this.state.update.mapLayers.indexOf(MapLocationType.MY_WAY_FACILITY) !== -1}*/}
                                    {/*onChange={(checked: boolean) => this.onMapOptionChange(MapLocationType.MY_WAY_FACILITY, checked)}*/}
                                    {/*ariaLabelledby={"label-mo-mw"}/>*/}
                                    <label htmlFor="mo-mw" id={"label-mo-mw"}>
                                        MyWay retailers
                                    </label>
                                </div>
                                <div>
                                    <img src={Constants.absUrl("/images/modeicons/ic-parkAndRide.svg")}
                                         className={classes.icon}
                                         aria-hidden="true"/>
                                    {/*<Checkbox id="mo-pr"*/}
                                    {/*checked={this.state.update.mapLayers.indexOf(MapLocationType.PARK_AND_RIDE_FACILITY) !== -1}*/}
                                    {/*onChange={(checked: boolean) => this.onMapOptionChange(MapLocationType.PARK_AND_RIDE_FACILITY, checked)}*/}
                                    {/*ariaLabelledby={"label-mo-pr"}/>*/}
                                    <label htmlFor="mo-pr" id={"label-mo-pr"}>
                                        Park & Ride
                                    </label>
                                </div>
                                <div>
                                    <img src={Constants.absUrl("/images/modeicons/ic-bikeShare.svg")}
                                         className={classes.icon}
                                         aria-hidden="true"/>
                                    <Tooltip
                                        placement="top"
                                        overlay={
                                            <div className={classes.tooltip}>
                                                This option displays bike share locations. Check current
                                                availability <a href="https://airbike.network/#download"
                                                                target="_blank"
                                                                className={classes.link}>here</a>.
                                            </div>
                                        }
                                        align={{offset: [0, -10]}}
                                        overlayClassName={classes.tooltipOverlay}
                                        mouseEnterDelay={.5}
                                    >
                                        <div className={classes.checkboxGroup}>
                                            {/*<Checkbox id="mo-bs"*/}
                                            {/*checked={this.state.update.mapLayers.indexOf(MapLocationType.BIKE_POD) !== -1}*/}
                                            {/*onChange={(checked: boolean) => this.onMapOptionChange(MapLocationType.BIKE_POD, checked)}*/}
                                            {/*ariaLabelledby={"label-mo-bs"}/>*/}
                                            <label htmlFor="mo-bs" id={"label-mo-bs"}>
                                                Bike Share
                                            </label>
                                            <img src={Constants.absUrl("/images/ic-info-circle.svg")}
                                                 aria-hidden={true}
                                                 className={classes.infoIcon}/>
                                        </div>
                                    </Tooltip>
                                </div>
                            </div>
                        </div>
                    </div>
                    }
                    <div className={classes.section}>
                        <div className={classes.sectionBody}>
                            <div className={classNames(classes.optionRow, classes.checkboxRow)}>
                                <div>
                                    {t("Appearance")}
                                </div>
                                <TKUISelect
                                    options={appearanceOptions}
                                    value={appearanceOptions.find((option: any) => option.value === this.state.update.isDarkMode)}
                                    onChange={(option) => {
                                        this.setState((prevState: IState) => ({
                                            update: Util.iAssign(prevState.update, { isDarkMode: option.value })
                                        }), () => {
                                            this.applyChanges();
                                        });
                                    }}
                                    className={classes.optionSelect}
                                    menuStyle={{
                                        marginTop: '2px',
                                    }}
                                    renderArrowDown={() => <IconAngleDown style={{width: '11px', height: '11px', marginRight: '5px'}}/>}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                {personalDataSettings}
                {transportSettings}
                {prioritiesSettings}
            </TKUICard>
        );
    }

}

const Consumer: React.SFC<{children: (props: IConsumedProps) => React.ReactNode}> = (props: {children: (props: IConsumedProps) => React.ReactNode}) => {
    return (
        <TKUIViewportUtil>
            {(viewportProps: TKUIViewportUtilProps) =>
                <OptionsContext.Consumer>
                    {(optionsContext: IOptionsContext) =>
                        <RoutingResultsContext.Consumer>
                            {(routingContext: IRoutingResultsContext) =>
                                props.children!({...optionsContext, region: routingContext.region, ...viewportProps})
                            }
                        </RoutingResultsContext.Consumer>
                    }
                </OptionsContext.Consumer>
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

export default connect((config: TKUIConfig) => config.TKUIProfileView, config, Mapper);