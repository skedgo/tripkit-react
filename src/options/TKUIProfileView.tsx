import * as React from "react";
import Util from "../util/Util";
import Region from "../model/region/Region";
import RegionsData from "../data/RegionsData";
import ModeIdentifier from "../model/region/ModeIdentifier";
import Checkbox from "../buttons/Checkbox";
import {MapLocationType} from "../model/location/MapLocationType";
import Tooltip from "rc-tooltip";
import Constants from "../util/Constants";
import {IOptionsContext, OptionsContext} from "./OptionsProvider";
import {IRoutingResultsContext, RoutingResultsContext} from "../trip-planner/RoutingResultsProvider";
import TKUICard, {CardPresentation} from "card/TKUICard";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {connect, PropsMapper} from "../config/TKConfigHelper";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {tKUIProfileViewDefaultStyle} from "./TKUIProfileView.css";
import {Subtract} from "utility-types";
import TKUIUserPriorities from "./TKUIUserPriorities";
import TKUserProfile from "../model/options/TKUserProfile";
import TKWeightingPreferences from "../model/options/TKWeightingPreferences";
import TKUIButton from "buttons/TKUIButton";
import {TKUIViewportUtil, TKUIViewportUtilProps} from "../util/TKUIResponsiveUtil";


export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    onClose?: () => void;
}

interface IConsumedProps extends IOptionsContext, TKUIViewportUtilProps {
    region?: Region;
}

export interface IStyle {
    main: CSSProps<IProps>;
    scrollPanel: CSSProps<IProps>;
    section: CSSProps<IProps>;
    sectionTitle: CSSProps<IProps>;
    specialServices: CSSProps<IProps>;
    icon: CSSProps<IProps>;
    infoIcon: CSSProps<IProps>;
    tooltip: CSSProps<IProps>;
    tooltipOverlay: CSSProps<IProps>;
    checkboxGroup: CSSProps<IProps>;
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
}

class TKUIProfileView extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);
        this.state = {
            update: this.props.value,
            pickSchoolError: false
        };
        RegionsData.instance.getModeIdentifierP(ModeIdentifier.SCHOOLBUS_ID).then((modeId?: ModeIdentifier) =>
            this.setState({ schoolModeId: modeId }));
        this.onMapOptionChange = this.onMapOptionChange.bind(this);
    }

    private onWheelchairChange(checked: boolean) {
        this.setState(prevState => ({update: Util.iAssign(prevState.update, {wheelchair: checked})}));
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

    private close(apply: boolean) {
        if (apply) {
            if (!this.checkValid()) {
                return;
            }
            if (this.props.onChange) {
                this.props.onChange(this.state.update);
            }
        }
        if (this.props.onClose) {
            this.props.onClose();
        }
    }

    private checkValid(): boolean {
        return true;
    }

    public render(): React.ReactNode {
        const schoolModeId = this.state.schoolModeId;
        const classes = this.props.classes;
        return (
            <TKUICard
                title={"Profile"}
                presentation={this.props.landscape ? CardPresentation.MODAL : CardPresentation.SLIDE_UP}
                onRequestClose={() => this.close(false)}
            >
                <div className={classes.main}>
                    <div className={classes.scrollPanel}>
                        <div className={classes.section}>
                            <div className={classes.sectionTitle}>
                                My Priorities
                            </div>
                            <TKUIUserPriorities
                                value={this.state.update.weightingPrefs}
                                onChange={(prefsUpdate: TKWeightingPreferences) =>
                                    this.setState((prevState: IState) =>
                                        ({update: Util.iAssign(prevState.update, {weightingPrefs: prefsUpdate})}))}
                            />
                        </div>
                        <div className={classes.section}>
                            <div className={classes.sectionTitle} tabIndex={0}>
                                Special Services
                            </div>
                            <div className={classes.specialServices}>
                                <div>
                                    <img src={Constants.absUrl("/images/modeicons/ic-wheelchair.svg")}
                                         className={classes.icon}
                                         style={{
                                             border: "1px solid grey",
                                             padding: '3px'
                                         }}
                                         aria-hidden={true}
                                    />
                                    <Tooltip
                                        placement="top"
                                        overlay={
                                            <div className={classes.tooltip}>
                                                Choosing this option will only display services with wheelchair accessibility.
                                            </div>
                                        }
                                        align={{offset: [0, -10]}}
                                        overlayClassName={classes.tooltipOverlay}
                                        mouseEnterDelay={.5}
                                    >
                                        <div className={classes.checkboxGroup}>
                                            <Checkbox id="ss-wa"
                                                      checked={this.state.update.wheelchair}
                                                      onChange={(checked: boolean) => this.onWheelchairChange(checked)}
                                                      ariaLabelledby={"labe-ss-wa"}/>
                                            <label htmlFor="ss-wa" id={"labe-ss-wa"}>
                                                Wheelchair Accessible
                                            </label>
                                            <img src={Constants.absUrl("/images/ic-info-circle.svg")} aria-hidden={true}
                                                 className={classes.infoIcon}/>
                                        </div>
                                    </Tooltip>
                                </div>
                                <div>
                                    <img src={Constants.absUrl("/images/modeicons/ic-bikeRack.svg")}
                                         className={classes.icon}
                                         aria-hidden="true"/>
                                    <Tooltip
                                        placement="top"
                                        overlay={
                                            <div className={classes.tooltip}>
                                                Choosing this option will only display services with bike racks.
                                            </div>
                                        }
                                        align={{offset: [0, -10]}}
                                        overlayClassName={classes.tooltipOverlay}
                                        mouseEnterDelay={.5}
                                    >
                                        <div className={classes.checkboxGroup}>
                                            <Checkbox id="ss-br"
                                                      checked={this.state.update.bikeRacks}
                                                      // TODO: re-enable
                                                      // onChange={(checked: boolean) => this.onBikeRacksChange(checked)}
                                                      ariaLabelledby={"label-ss-br"}/>
                                            <label htmlFor="ss-br" id={"label-ss-br"}>
                                                Bike Racks
                                            </label>
                                            <img src={Constants.absUrl("/images/ic-info-circle.svg")} aria-hidden={true}
                                                 className={classes.infoIcon}/>
                                        </div>
                                    </Tooltip>
                                </div>
                            </div>
                        </div>
                        <div className={classes.section}>
                            <div className={classes.sectionTitle} tabIndex={0}>
                                Map Options
                            </div>
                            <div className={classes.specialServices}>
                                <div>
                                    <img src={Constants.absUrl("/images/modeicons/ic-myway.svg")}
                                         className={classes.icon}
                                         aria-hidden="true"/>
                                    <Checkbox id="mo-mw"
                                              checked={this.state.update.mapLayers.indexOf(MapLocationType.MY_WAY_FACILITY) !== -1}
                                              onChange={(checked: boolean) => this.onMapOptionChange(MapLocationType.MY_WAY_FACILITY, checked)}
                                              ariaLabelledby={"label-mo-mw"}/>
                                    <label htmlFor="mo-mw" id={"label-mo-mw"}>
                                        MyWay retailers
                                    </label>
                                </div>
                                <div>
                                    <img src={Constants.absUrl("/images/modeicons/ic-parkAndRide.svg")}
                                         className={classes.icon}
                                         aria-hidden="true"/>
                                    <Checkbox id="mo-pr"
                                              checked={this.state.update.mapLayers.indexOf(MapLocationType.PARK_AND_RIDE_FACILITY) !== -1}
                                              onChange={(checked: boolean) => this.onMapOptionChange(MapLocationType.PARK_AND_RIDE_FACILITY, checked)}
                                              ariaLabelledby={"label-mo-pr"}/>
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
                                                availability <a href="https://airbike.network/#download" target="_blank"
                                                                className="gl-link">here</a>.
                                            </div>
                                        }
                                        align={{offset: [0, -10]}}
                                        overlayClassName={classes.tooltipOverlay}
                                        mouseEnterDelay={.5}
                                    >
                                        <div className={classes.checkboxGroup}>
                                            <Checkbox id="mo-bs" checked={this.state.update.mapLayers.indexOf(MapLocationType.BIKE_POD) !== -1}
                                                      onChange={(checked: boolean) => this.onMapOptionChange(MapLocationType.BIKE_POD, checked)}
                                                      ariaLabelledby={"label-mo-bs"}/>
                                            <label htmlFor="mo-bs" id={"label-mo-bs"}>
                                                Bike Share
                                            </label>
                                            <img src={Constants.absUrl("/images/ic-info-circle.svg")} aria-hidden={true}
                                                 className={classes.infoIcon}/>
                                        </div>
                                    </Tooltip>
                                </div>
                            </div>
                        </div>
                    </div>
                    <TKUIButton
                        text={"Apply"}
                        onClick={() => this.close(true)}
                    />
                </div>
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