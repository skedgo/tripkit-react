import * as React from "react";
import Options from "../model/Options";
import Util from "../util/Util";
import IconClose from '-!svg-react-loader!../images/ic-cross.svg';
import "./OptionsView.css";
import Region from "../model/region/Region";
import RegionsData from "../data/RegionsData";
import ModeIdentifier from "../model/region/ModeIdentifier";
import TransportUtil from "../trip/TransportUtil";
import Checkbox from "../buttons/Checkbox";
import Color from "../model/trip/Color";
import RadioBtn from "../buttons/RadioBtn";
import MapLocationType from "../model/location/MapLocationType";
import Tooltip from "rc-tooltip";
import Constants from "../util/Constants";

interface IProps {
    value: Options
    region: Region
    onChange?: (value: Options) => void;    // Fired only if change should be applied
    onClose?: () => void;
    className?: string;
}

interface IState {
    update: Options;
    schools?: string[];
    schoolModeId?: ModeIdentifier;
    pickSchoolError: boolean;
}

enum JourneyPref {
    FASTEST = "Fastest",
    FEWEST_CHANGES = "Fewest changes",
    LEAST_WALKING = "Least walking"
}

class OptionsView extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);
        this.state = {
            update: this.props.value,
            pickSchoolError: false
        };
        RegionsData.instance.getModeIdentifierP(ModeIdentifier.SCHOOLBUS_ID).then((modeId: ModeIdentifier) =>
            this.setState({ schoolModeId: modeId }));
        this.onModeCheckboxChange = this.onModeCheckboxChange.bind(this);
        this.onMapOptionChange = this.onMapOptionChange.bind(this);
        this.onPrefCheckedChange = this.onPrefCheckedChange.bind(this);
    }

    private onModeCheckboxChange(mode: string, checked: boolean) {
        this.setState(prevState => {
            const modesDisabledUpdate = Object.assign([], prevState.update.modesDisabled);
            const imode = modesDisabledUpdate.indexOf(mode);
            if (checked) {
                if (imode > -1) {
                    modesDisabledUpdate.splice(imode, 1);
                }
            } else {
                if (imode === -1) {
                    modesDisabledUpdate.push(mode);
                }
            }

            return {update: Util.iAssign(prevState.update, {modesDisabled: modesDisabledUpdate})}
        });
        if ((mode === "wa_wal" || mode === "cy_bic") && checked) {
            this.onWheelchairChange(false);
        }
        if ((mode === ModeIdentifier.SCHOOLBUS_ID) && checked) {
            this.onModeCheckboxChange("pt_pub_bus", true);
        }
        if ((mode === "pt_pub_bus") && !checked) {
            this.onModeCheckboxChange(ModeIdentifier.SCHOOLBUS_ID, false);
        }
    }

    private onPrefCheckedChange(pref: JourneyPref, checked: boolean) {
        if (!checked) {
            return;
        }
        this.setState(prevState => {
            const prefsUpdate = Util.iAssign(prevState.update.weightingPrefs, {});
            switch (pref) {
                case JourneyPref.FASTEST:
                    prefsUpdate.time = 2;
                    prefsUpdate.hassle = 1;
                    break;
                case JourneyPref.FEWEST_CHANGES:
                    prefsUpdate.time = 1;
                    prefsUpdate.hassle = 2;
                    break;
                case JourneyPref.LEAST_WALKING:
                    prefsUpdate.time = 2;
                    prefsUpdate.hassle = 0;
            }
            return { update: Util.iAssign(prevState.update, {weightingPrefs: prefsUpdate}) }
        });
    }

    private isChecked(pref: JourneyPref): boolean {
        const prefs = this.state.update.weightingPrefs;
        switch (pref) {
            case JourneyPref.FASTEST:
                return prefs.time === 2 && prefs.hassle === 1;
            case JourneyPref.FEWEST_CHANGES:
                return prefs.time === 1 && prefs.hassle === 2;
            default:
                return prefs.time === 2 && prefs.hassle === 0;
        }
    }

    private onWheelchairChange(checked: boolean) {
        this.setState(prevState => ({update: Util.iAssign(prevState.update, {wheelchair: checked})}));
        if (checked) {
            this.onModeCheckboxChange("wa_wal", false);
            this.onModeCheckboxChange("cy_bic", false);
        }
    }

    private onBikeRacksChange(checked: boolean) {
        if (checked) {
            this.onModeCheckboxChange("pt_pub_bus", true);
            this.onModeCheckboxChange("cy_bic", true);
        } else {
            this.onModeCheckboxChange("cy_bic", false);
        }

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

    private isModeEnabled(mode: string) {
        return this.state.update.isModeEnabled(mode);
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

    public static skipMode(mode: string): boolean {     // TODO: hardcoded for TC
        return (
            mode.startsWith("me_car")
            // && !mode.startsWith("me_car-r")  // Disabled car share.
            )
            || mode.startsWith("me_mot") || mode.startsWith("ps_tnc_ODB") || mode.startsWith("cy_bic-s")
        // || mode.startsWith(ModeIdentifier.SCHOOLBUS_ID);
        // || mode.startsWith("ps_tnc_UBER") || mode.startsWith("ps_tax");
    }

    public static getOptionsModeIds(region: Region): ModeIdentifier[] {
        const result: ModeIdentifier[] = [];
        for (const mode of region.modes) {
            if (mode === "pt_pub") {
                result.push(Object.assign(new ModeIdentifier(),
                    {identifier: "pt_pub_bus", title: "Bus", icon: null, color: Object.assign(new Color(), {blue: 168, green: 93, red:1})}));
                // Disable Tram
                result.push(Object.assign(new ModeIdentifier(),
                    {identifier: "pt_pub_tram", title: "Light Rail", icon: null, color: Object.assign(new Color(), {blue: 47, green: 33, red:208})}))
                continue;
            }
            result.push(RegionsData.instance.getModeIdentifier(mode)!)
        }
        return result.filter((mode: ModeIdentifier) =>
            !this.skipMode(mode.identifier));
    }

    public render(): React.ReactNode {
        const schoolModeId = this.state.schoolModeId;
        const modesSectionFilter = (modeId: ModeIdentifier) => {
            const id = modeId.identifier;
            return !id.startsWith(ModeIdentifier.SCHOOLBUS_ID) && !id.startsWith(ModeIdentifier.UBER_ID) &&
                    !id.startsWith(ModeIdentifier.CAR_RENTAL_SW_ID) && !id.startsWith(ModeIdentifier.TAXI_ID)};
        const thirdPartySectionFilter = (modeId: ModeIdentifier) => {
            const id = modeId.identifier;
            return id.startsWith(ModeIdentifier.UBER_ID) || id.startsWith(ModeIdentifier.CAR_RENTAL_SW_ID) ||
                id.startsWith(ModeIdentifier.TAXI_ID)};
        const modeToCheckbox = (modeId: ModeIdentifier, index: number) => {
            const circleBg = modeId.icon === null;
            const modeOptionDisabled = Options.overrideDisabled.indexOf(modeId.identifier) !== -1;
            const transportColor = modeOptionDisabled ? "#b1aeae" : TransportUtil.getTransportColorByIconS(TransportUtil.modeIdToIconS(modeId.identifier));
            const onDark = !modeId.identifier.includes(ModeIdentifier.SCHOOLBUS_ID); // TODO: Hardcoded for TC
            return(
                <div key={index} className="gl-flex gl-align-center">
                    <img src={TransportUtil.getTransportIconModeId(modeId, false, onDark)}
                         className={"OptionsView-icon " + (circleBg ? " OptionsView-onDark" : "")}
                         style={{
                             backgroundColor: circleBg ? (transportColor !== null ? transportColor : "black") : "none",
                             border: !circleBg ? "1px solid " + (transportColor !== null ? transportColor : "black") : "none",
                         }}
                         aria-hidden="true"
                    />
                    <Checkbox id={"chbox-" + modeId.identifier}
                              checked={this.isModeEnabled(modeId.identifier)}
                              onChange={(checked: boolean) => this.onModeCheckboxChange(modeId.identifier, checked)}
                              ariaLabelledby={"label-" + modeId.identifier}
                              disabled={modeOptionDisabled}
                    />
                    <label htmlFor={"chbox-" + modeId.identifier} id={"label-" + modeId.identifier} >
                        {modeId!.title}
                    </label>
                </div>
            )
        };
        return (
            <div className={"OptionsView gl-flex gl-column" + (this.props.className ? " " + this.props.className : "")}>
                <div className="gl-flex gl-align-center gl-space-between OptionsView-header">
                    <div className="h3-text">Journey Options</div>
                    <button onClick={() => this.close(false)} aria-label="Close">
                        <IconClose className="gl-pointer" focusable="false"/>
                    </button>
                </div>
                <div className="OptionsView-scrollPanel gl-scrollable-y">
                    <div className="OptionsView-headerSeparation"/>
                    <div className="h4-text OptionsView-sectionTitle"
                         tabIndex={0}
                    >Modes</div>
                    <div className="OptionsView-modesPanel">
                        {this.props.region ? OptionsView.getOptionsModeIds(this.props.region)
                            .filter(modesSectionFilter).map(modeToCheckbox): null}
                    </div>
                    <div className="h4-text OptionsView-separation OptionsView-sectionTitle"
                         tabIndex={0}>Journey Preferences</div>
                    <div className="OptionsView-journey-prefs gl-flex gl-space-around" role="radiogroup">
                        <div className="gl-flex gl-align-center">
                            <Tooltip
                                placement="top"
                                overlay={
                                    <div className="OptionsView-tooltip" id={"jp-fa-info"}>
                                        The journey that will take the least amount of time.
                                    </div>
                                }
                                align={{offset: [0, -10]}}
                                overlayClassName="app-style OptionsView-tooltip"
                                mouseEnterDelay={.5}
                            >
                                <div className="gl-flex gl-align-center">
                                    <RadioBtn name={"journey-prefs"}
                                              id={"jp-fa"}
                                              checked={this.isChecked(JourneyPref.FASTEST)}
                                              onChange={(checked: boolean) => this.onPrefCheckedChange(JourneyPref.FASTEST, checked)}
                                              ariaLabelledby={"label-jp-fa"}
                                    />
                                    <label htmlFor="jp-fa" id={"label-jp-fa"}>
                                        {JourneyPref.FASTEST}
                                    </label>
                                    <img src={Constants.absUrl("/images/ic-info-circle.svg")} aria-hidden={true}
                                         className="OptionsView-infoIcon"/>
                                </div>
                            </Tooltip>
                        </div>
                        <div className="gl-flex gl-align-center">
                            <Tooltip
                                placement="top"
                                overlay={
                                    <div className="OptionsView-tooltip">
                                        The journey with the fewest connections.
                                    </div>
                                }
                                // align={{offset: [10, 0]}}
                                align={{offset: [0, -10]}}
                                overlayClassName="app-style OptionsView-tooltip"
                                mouseEnterDelay={.5}
                            >
                                <div className="gl-flex gl-align-center">
                                    <RadioBtn name={"journey-prefs"}
                                              id="jp-fc"
                                              checked={this.isChecked(JourneyPref.FEWEST_CHANGES)}
                                              onChange={(checked: boolean) => this.onPrefCheckedChange(JourneyPref.FEWEST_CHANGES, checked)}
                                              ariaLabelledby={"label-jp-fc"}
                                    />
                                    <label htmlFor="jp-fc" id={"label-jp-fc"}>
                                        {JourneyPref.FEWEST_CHANGES}
                                    </label>
                                    <img src={Constants.absUrl("/images/ic-info-circle.svg")} aria-hidden={true}
                                         className="OptionsView-infoIcon"/>
                                </div>
                            </Tooltip>
                        </div>
                        <div className="gl-flex gl-align-center">
                            <Tooltip
                                placement="top"
                                overlay={
                                    <div className="OptionsView-tooltip">
                                        The journey with the least amount of walking.
                                    </div>
                                }
                                align={{offset: [0, -10]}}
                                overlayClassName="app-style OptionsView-tooltip"
                                mouseEnterDelay={.5}
                            >
                                <div className="gl-flex gl-align-center">
                                    <RadioBtn name={"journey-prefs"}
                                              id="jp-lw"
                                              checked={this.isChecked(JourneyPref.LEAST_WALKING)}
                                              onChange={(checked: boolean) => this.onPrefCheckedChange(JourneyPref.LEAST_WALKING, checked)}
                                              ariaLabelledby={"label-jp-lw"}
                                    />
                                    <label htmlFor="jp-lw" id={"label-jp-lw"}>
                                        {JourneyPref.LEAST_WALKING}
                                    </label>
                                    <img src={Constants.absUrl("/images/ic-info-circle.svg")} aria-hidden={true}
                                         className="OptionsView-infoIcon"/>
                                </div>
                            </Tooltip>
                        </div>
                    </div>
                    <div className="h4-text OptionsView-separation OptionsView-sectionTitle"
                         tabIndex={0}>Special Services</div>
                    <div className="OptionsView-special-services gl-flex gl-space-around">
                        <div className="gl-flex gl-align-center">
                            <img src={Constants.absUrl("/images/modeicons/ic-wheelchair.svg")}
                                 className="gl-charSpace OptionsView-icon OptionsView-onDark gl-no-shrink"
                                 style={{
                                     border: "1px solid grey"
                                 }}
                                 aria-hidden={true}
                            />
                            <Tooltip
                                placement="top"
                                overlay={
                                    <div className="OptionsView-tooltip">
                                        Choosing this option will only display services with wheelchair accessibility.
                                    </div>
                                }
                                align={{offset: [0, -10]}}
                                overlayClassName="app-style OptionsView-tooltip"
                                mouseEnterDelay={.5}
                            >
                                <div className="gl-flex gl-align-center">
                                    <Checkbox id="ss-wa"
                                              checked={this.state.update.wheelchair}
                                              onChange={(checked: boolean) => this.onWheelchairChange(checked)}
                                              ariaLabelledby={"labe-ss-wa"}/>
                                    <label htmlFor="ss-wa" id={"labe-ss-wa"}>
                                        Wheelchair Accessible
                                    </label>
                                    <img src={Constants.absUrl("/images/ic-info-circle.svg")} aria-hidden={true}
                                         className="OptionsView-infoIcon"/>
                                </div>
                            </Tooltip>
                        </div>
                        <div className="gl-flex gl-align-center OptionsView-leftMargin">
                            <img src={Constants.absUrl("/images/modeicons/ic-bikeRack.svg")} className="gl-charSpace gl-no-shrink" style={{width: "24px", height: "24px"}} aria-hidden="true"/>
                            <Tooltip
                                placement="top"
                                overlay={
                                    <div className="OptionsView-tooltip">
                                        Choosing this option will only display services with bike racks.
                                    </div>
                                }
                                align={{offset: [0, -10]}}
                                overlayClassName="app-style OptionsView-tooltip"
                                mouseEnterDelay={.5}
                            >
                                <div className="gl-flex gl-align-center">
                                    <Checkbox id="ss-br"
                                              checked={this.state.update.bikeRacks}
                                              onChange={(checked: boolean) => this.onBikeRacksChange(checked)}
                                              ariaLabelledby={"label-ss-br"}/>
                                    <label htmlFor="ss-br" id={"label-ss-br"}>
                                        Bike Racks
                                    </label>
                                    <img src={Constants.absUrl("/images/ic-info-circle.svg")} aria-hidden={true}
                                         className="OptionsView-infoIcon"/>
                                </div>
                            </Tooltip>
                        </div>
                        { this.state.schools && schoolModeId ?
                            <div className="OptionsView-schoolBusPanel gl-flex gl-align-center OptionsView-leftMargin gl-no-shrink">
                                <img src={TransportUtil.getTransportIconModeId(schoolModeId, false, false)}
                                     className={"OptionsView-icon gl-no-shrink"}
                                     style={{
                                         border: "1px solid " + TransportUtil.getTransportColorByIconS(TransportUtil.modeIdToIconS(schoolModeId.identifier)),
                                     }}
                                     aria-hidden="true"
                                />
                                <Tooltip
                                    placement="top"
                                    overlay={
                                        <div className="OptionsView-tooltip">
                                            This option will display both dedicated school services and regular route services.
                                        </div>
                                    }
                                    align={{offset: [0, -10]}}
                                    overlayClassName="app-style OptionsView-tooltip"
                                    mouseEnterDelay={.5}
                                >
                                    <div className="gl-flex gl-align-center">
                                        <Checkbox checked={this.isModeEnabled(schoolModeId.identifier)}
                                                  onChange={(checked: boolean) => this.onModeCheckboxChange(schoolModeId.identifier, checked)}/>
                                        <label>
                                            <img src={Constants.absUrl("/images/ic-info-circle.svg")} aria-hidden={true}/>
                                        </label>
                                    </div>
                                </Tooltip>
                            </div> : null
                        }
                    </div>
                    <div className="h4-text OptionsView-separation OptionsView-sectionTitle"
                         tabIndex={0}>Map Options</div>
                    <div className="OptionsView-map-options gl-flex gl-space-around">
                        <div className="gl-flex gl-align-center">
                            <img src={Constants.absUrl("/images/modeicons/ic-myway.svg")} className="gl-charSpace" style={{width: "24px", height: "24px"}} aria-hidden="true"/>
                            <Checkbox id="mo-mw"
                                      checked={this.state.update.mapLayers.indexOf(MapLocationType.MY_WAY_FACILITY) !== -1}
                                      onChange={(checked: boolean) => this.onMapOptionChange(MapLocationType.MY_WAY_FACILITY, checked)}
                                      ariaLabelledby={"label-mo-mw"}/>
                            <label htmlFor="mo-mw" id={"label-mo-mw"}>
                                MyWay retailers
                            </label>
                        </div>
                        <div className="gl-flex gl-align-center">
                            <img src={Constants.absUrl("/images/modeicons/ic-parkAndRide.svg")} className="gl-charSpace" style={{width: "36px", height: "36px"}} aria-hidden="true"/>
                            <Checkbox id="mo-pr"
                                      checked={this.state.update.mapLayers.indexOf(MapLocationType.PARK_AND_RIDE_FACILITY) !== -1}
                                      onChange={(checked: boolean) => this.onMapOptionChange(MapLocationType.PARK_AND_RIDE_FACILITY, checked)}
                                      ariaLabelledby={"label-mo-pr"}/>
                            <label htmlFor="mo-pr" id={"label-mo-pr"}>
                                Park & Ride
                            </label>
                        </div>
                        <div className="gl-flex gl-align-center">
                            <img src={Constants.absUrl("/images/modeicons/ic-bikeShare.svg")} className="gl-charSpace" style={{width: "24px", height: "24px"}} aria-hidden="true"/>
                            <Tooltip
                                placement="top"
                                overlay={
                                    <div className="OptionsView-tooltip">
                                        This option displays bike share locations. Check current
                                        availability <a href="https://airbike.network/#download" target="_blank"
                                                        className="gl-link">here</a>.
                                    </div>
                                }
                                align={{offset: [0, -10]}}
                                overlayClassName="app-style OptionsView-tooltip"
                                mouseEnterDelay={.5}
                            >
                                <div className="gl-flex gl-align-center">
                                    <Checkbox id="mo-bs" checked={this.state.update.mapLayers.indexOf(MapLocationType.BIKE_POD) !== -1}
                                              onChange={(checked: boolean) => this.onMapOptionChange(MapLocationType.BIKE_POD, checked)}
                                              ariaLabelledby={"label-mo-bs"}/>
                                    <label htmlFor="mo-bs" id={"label-mo-bs"}>
                                        Bike Share
                                    </label>
                                    <img src={Constants.absUrl("/images/ic-info-circle.svg")} aria-hidden={true}
                                         className="OptionsView-infoIcon"/>
                                </div>
                            </Tooltip>
                        </div>
                    </div>
                    <div className="h4-text OptionsView-separation OptionsView-sectionTitle"
                         tabIndex={0}>Third Party Options</div>
                    <div className="OptionsView-modesPanel">
                        {this.props.region ? OptionsView.getOptionsModeIds(this.props.region)
                            .filter(thirdPartySectionFilter).map(modeToCheckbox): null}
                    </div>
                </div>
                <button className="gl-button gl-no-shrink" onClick={() => this.close(true)}>Apply</button>
            </div>
        );
    }
}

export default OptionsView;