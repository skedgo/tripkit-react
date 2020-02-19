import * as React from "react";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {connect, PropsMapper} from "../config/TKConfigHelper";
import {tKUITransportOptionsRowStyle} from "./TKUITransportOptionsRow.css";
import {DisplayConf} from "../model/options/TKTransportOptions";
import ModeIdentifier from "../model/region/ModeIdentifier";
import TransportUtil from "../trip/TransportUtil";
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Checkbox, { CheckboxProps } from '@material-ui/core/Checkbox';
import { withStyles } from '@material-ui/core/styles';
import {ReactComponent as IconAngleDown} from "../images/ic-angle-down.svg";
import {withTheme} from "react-jss";
import {tKUIColors, tKUIDeaultTheme, TKUITheme} from "../jss/TKUITheme";
import ModeInfo from "../model/trip/ModeInfo";
import {IOptionsContext, OptionsContext} from "./OptionsProvider";
import {Subtract} from "utility-types";
import Util from "../util/Util";
import {IRoutingResultsContext, RoutingResultsContext} from "../trip-planner/RoutingResultsProvider";
import TKUserProfile, {WalkingSpeed} from "../model/options/TKUserProfile";
import TKUISlider from "./TKUISlider";
import RegionInfo from "../model/region/RegionInfo";
import TKUISelect from "../buttons/TKUISelect";

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    mode: ModeIdentifier;
    value: DisplayConf;
    onChange: (value: DisplayConf) => void;
}

interface IConsumedProps {
    userProfile: TKUserProfile;
    onUserProfileChange: (options: TKUserProfile) => void;
    regionInfo?: RegionInfo;
}

interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> {}

interface IStyle {
    main: CSSProps<IProps>;
    iconExpand: CSSProps<IProps>;
    transIcon: CSSProps<IProps>;
    expansionPanel: CSSProps<IProps>;
    expansionPanelDetails: CSSProps<IProps>;
    section: CSSProps<IProps>;
    sectionTitle: CSSProps<IProps>;
    sectionBody: CSSProps<IProps>;
    checkboxRow: CSSProps<IProps>;
    sliderRow: CSSProps<IProps>;
    sliderHeader: CSSProps<IProps>;
    prefModeTitle: CSSProps<IProps>;
    walkSpeedSelect: CSSProps<IProps>;
}

export type TKUITransportOptionsRowProps = IProps;
export type TKUITransportOptionsRowStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUITransportOptionsRow {...props}/>,
    styles: tKUITransportOptionsRowStyle,
    classNamePrefix: "TKUITransportOptionsRow"
};

const GreenCheckbox = withStyles({
        root: {
            color: tKUIColors.black1,
            '&$checked': {
                color: tKUIDeaultTheme.colorPrimary,    // TODO: avoid hardcoding
            },
        },
        checked: {},
    })((props: CheckboxProps) => <Checkbox color="default" {...props} />);

interface IState {
    expanded: boolean;
}

class TKUITransportOptionsRow extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);
        this.state = {
            expanded: false
        }
    }

    private static walkingSpeedString(walkingSpeed: WalkingSpeed) {
        switch (walkingSpeed) {
            case WalkingSpeed.SLOW: return "Slow";
            case WalkingSpeed.AVERAGE: return "Medium";
            default: return "Fast";
        }
    }

    public render(): React.ReactNode {
        const mode = this.props.mode;
        const value = this.props.value;
        const regionInfo = this.props.regionInfo;
        const transitModes = regionInfo && regionInfo.transitModes;
        const userProfile = this.props.userProfile;
        const classes = this.props.classes;
        const minimizedOption = false && // Hidden for now
            <div className={classes.checkboxRow}>
                <div>
                    Minimised
                </div>
                <GreenCheckbox
                    checked={value === DisplayConf.BRIEF}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        const checked = event.target.checked;
                        this.props.onChange(checked ? DisplayConf.BRIEF : DisplayConf.NORMAL);
                    }}
                    value="primary"
                    inputProps={{'aria-label': 'primary checkbox'}}
                />
            </div>;
        const preferredTransportOption = mode.identifier === 'pt_pub' &&
            <div className={classes.section}>
                <div className={classes.sectionTitle}>
                    Preferred Transport
                </div>
                <div className={classes.sectionBody}>
                    {transitModes && transitModes.map((transMode: ModeInfo, i: number) =>
                        <div className={classes.checkboxRow} key={i}>
                            <img src={TransportUtil.getTransportIcon(transMode, false, false)}
                                 className={classes.transIcon}
                            />
                            <div className={classes.prefModeTitle}>
                                {transMode.alt}
                            </div>
                            <GreenCheckbox
                                checked={this.props.userProfile.transportOptions.isPreferredTransport(transMode.identifier!)}
                                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                    const checked = event.target.checked;
                                    const userProfileUpdate = Util.deepClone(userProfile);
                                    userProfileUpdate.transportOptions.setPreferredTransport(transMode.identifier!, checked);
                                    this.props.onUserProfileChange(userProfileUpdate);
                                }}
                                onClick={event => event.stopPropagation()}
                                onFocus={event => event.stopPropagation()}
                                value="primary"
                                inputProps={{'aria-label': 'primary checkbox'}}
                            />
                        </div>
                    )}
                </div>
            </div>;
        const minTransferTimeOption = TransportUtil.isPT(mode.identifier) &&
            <div className={classes.sliderRow}>
                <div className={classes.sliderHeader}>
                    <div>
                        Min transfer time
                    </div>
                    <div>
                        {userProfile.minimumTransferTime + " mins"}
                    </div>
                </div>
                <TKUISlider
                    value={userProfile.minimumTransferTime}
                    onChange={(event: any, value: any) => {
                        const userProfileUpdate = Util.deepClone(userProfile);
                        userProfileUpdate.minimumTransferTime = value;
                        this.props.onUserProfileChange(userProfileUpdate);
                    }}
                    min={0}
                    max={100}
                />
            </div>;
        const concessionPricingOption = TransportUtil.isPT(mode.identifier) && regionInfo && regionInfo.transitConcessionPricing &&
            <div className={classes.checkboxRow}>
                <div>
                    Concession pricing
                </div>
                <GreenCheckbox
                    checked={userProfile.transitConcessionPricing}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        const checked = event.target.checked;
                        const userProfileUpdate = Util.deepClone(userProfile);
                        userProfileUpdate.transitConcessionPricing = checked;
                        this.props.onUserProfileChange(userProfileUpdate);
                    }}
                    value="primary"
                    inputProps={{'aria-label': 'primary checkbox'}}
                />
            </div>;
        const wheelchairOption = TransportUtil.isPT(mode.identifier) &&
            <div className={classes.checkboxRow}>
                <div>
                    Wheelchair information
                </div>
                <GreenCheckbox
                    checked={userProfile.wheelchair}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        const checked = event.target.checked;
                        const userProfileUpdate = Util.deepClone(userProfile);
                        userProfileUpdate.wheelchair = checked;
                        this.props.onUserProfileChange(userProfileUpdate);
                    }}
                    value="primary"
                    inputProps={{ 'aria-label': 'primary checkbox' }}
                />
            </div>;
        let walkSpeedSelect = undefined;
        if (TransportUtil.isWalk(mode.identifier)) {
            const walkSpeedOptions: any[] = (Object.values(WalkingSpeed).filter(value => typeof value === 'number'))
                .map((value) => {
                    return { value: value, label: TKUITransportOptionsRow.walkingSpeedString(value as WalkingSpeed)};
                });
            walkSpeedSelect =
                <TKUISelect
                    options={walkSpeedOptions}
                    value={walkSpeedOptions.find((option: any) => option.value === userProfile.walkingSpeed)}
                    onChange={(option) => {
                        const walkSpeed = option.value;
                        const userProfileUpdate = Util.deepClone(userProfile);
                        userProfileUpdate.walkingSpeed = walkSpeed;
                        this.props.onUserProfileChange(userProfileUpdate);
                    }}
                    className={classes.walkSpeedSelect}
                />
        }
        const walkSpeedOption = walkSpeedSelect &&
            <div className={classes.checkboxRow}>
                <div>
                    Walk speed
                </div>
                {walkSpeedSelect}
            </div>;
        let cycleSpeedSelect = undefined;
        if (TransportUtil.isCycle(mode.identifier)) {
            const cycleSpeedOptions: any[] = (Object.values(WalkingSpeed).filter(value => typeof value === 'number'))
                .map((value) => {
                    return { value: value, label: TKUITransportOptionsRow.walkingSpeedString(value as WalkingSpeed)};
                });
            cycleSpeedSelect =
                <TKUISelect
                    options={cycleSpeedOptions}
                    value={cycleSpeedOptions.find((option: any) => option.value === userProfile.cyclingSpeed)}
                    onChange={(option) => {
                        const cycleSpeed = option.value;
                        const userProfileUpdate = Util.deepClone(userProfile);
                        userProfileUpdate.cyclingSpeed = cycleSpeed;
                        this.props.onUserProfileChange(userProfileUpdate);
                    }}
                    className={classes.walkSpeedSelect}
                />
        }
        const cycleSpeedOption = cycleSpeedSelect &&
            <div className={classes.checkboxRow}>
                <div>
                    Cycle speed
                </div>
                {cycleSpeedSelect}
            </div>;
        const hasContent = minimizedOption || preferredTransportOption || minTransferTimeOption || concessionPricingOption ||
            wheelchairOption || walkSpeedSelect || cycleSpeedOption;
        return (
            <ExpansionPanel
                expanded={this.state.expanded}
                onChange={(event: any, expanded: boolean) => {
                    if (value === DisplayConf.HIDDEN || !hasContent) {
                        return;
                    }
                    this.setState({expanded: expanded})
                }}
                classes={{
                    root: classes.expansionPanel
                }}
            >
                <ExpansionPanelSummary
                    expandIcon={value !== DisplayConf.HIDDEN && hasContent ? <IconAngleDown className={classes.iconExpand}/> : undefined}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                >
                    <div className={classes.main}>
                        <GreenCheckbox
                            checked={value !== DisplayConf.HIDDEN}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                const checked = event.target.checked;
                                this.props.onChange(checked ? DisplayConf.NORMAL : DisplayConf.HIDDEN);
                                if (!checked && this.state.expanded) {
                                    this.setState({expanded: false})
                                }
                            }}
                            onClick={event => event.stopPropagation()}
                            onFocus={event => event.stopPropagation()}
                            value="primary"
                            inputProps={{ 'aria-label': 'primary checkbox' }}
                        />
                        <img src={TransportUtil.getTransportIconModeId(mode, false, false)}
                             className={classes.transIcon}
                        />
                        {mode.title}
                    </div>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails
                    classes={{
                        root: classes.expansionPanelDetails
                    }}
                >
                    {minimizedOption}
                    {preferredTransportOption}
                    <div className={classes.sectionBody}>
                        {minTransferTimeOption}
                        {concessionPricingOption}
                        {wheelchairOption}
                        {walkSpeedOption}
                        {cycleSpeedOption}
                    </div>
                </ExpansionPanelDetails>
            </ExpansionPanel>
        );

    }

}

const Mapper: PropsMapper<IClientProps, Subtract<IProps, TKUIWithClasses<IStyle, IProps>>> =
    ({inputProps, children}) =>
        <OptionsContext.Consumer>
            {(optionsContext: IOptionsContext) =>
                <RoutingResultsContext.Consumer>
                    {(routingContext: IRoutingResultsContext) => {
                        const consumedProps: IConsumedProps = {
                            userProfile: optionsContext.value,
                            onUserProfileChange: optionsContext.onChange,
                            regionInfo: routingContext.regionInfo
                        };
                        return children!({...inputProps, ...consumedProps})
                    }}
                </RoutingResultsContext.Consumer>
            }
        </OptionsContext.Consumer>;

export default connect((config: TKUIConfig) => config.TKUITransportOptionsRow, config, Mapper);