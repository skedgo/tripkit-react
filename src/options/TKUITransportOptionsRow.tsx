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
import {tKUIColors, tKUIDeaultTheme} from "../jss/TKUITheme";
import ModeInfo from "../model/trip/ModeInfo";
import {Subtract} from "utility-types";
import Util from "../util/Util";
import {IRoutingResultsContext, RoutingResultsContext} from "../trip-planner/RoutingResultsProvider";
import TKUserProfile, {WalkingSpeed} from "../model/options/TKUserProfile";
import TKUISlider from "./TKUISlider";
import RegionInfo from "../model/region/RegionInfo";
import TKUISelect from "../buttons/TKUISelect";
import {TranslationFunction} from "../i18n/TKI18nProvider";

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    mode: ModeIdentifier;
    value: TKUserProfile;
    onChange: (value: TKUserProfile) => void;
}

interface IConsumedProps {
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

    private static walkingSpeedString(walkingSpeed: WalkingSpeed, t: TranslationFunction) {
        switch (walkingSpeed) {
            case WalkingSpeed.SLOW: return t("Slow");
            case WalkingSpeed.AVERAGE: return t("Medium");
            default: return t("Fast");
        }
    }

    public render(): React.ReactNode {
        const mode = this.props.mode;
        const value = this.props.value;
        const displayValue = value.transportOptions.getTransportOption(mode.identifier);
        const regionInfo = this.props.regionInfo;
        const transitModes = regionInfo && regionInfo.transitModes;
        const classes = this.props.classes;
        const t = this.props.t;
        const minimizedOption = false && // Hidden for now
            <div className={classes.checkboxRow}>
                <div>
                    Minimised
                </div>
                <GreenCheckbox
                    checked={displayValue === DisplayConf.BRIEF}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        const checked = event.target.checked;
                        const update = Util.deepClone(this.props.value);
                        update.transportOptions.setTransportOption(mode.identifier,
                            checked ? DisplayConf.BRIEF : DisplayConf.NORMAL);
                        this.props.onChange(update);
                    }}
                    value="primary"
                    inputProps={{'aria-label': 'primary checkbox'}}
                />
            </div>;
        const preferredTransportOption = mode.identifier === 'pt_pub' &&
            <div className={classes.section}>
                <div className={classes.sectionTitle}>
                    {t("Preferred.transport")}
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
                                checked={value.transportOptions.isPreferredTransport(transMode.identifier!)}
                                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                    const checked = event.target.checked;
                                    const update = Util.deepClone(value);
                                    update.transportOptions.setPreferredTransport(transMode.identifier!, checked);
                                    this.props.onChange(update);
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
        const minTransferTimeOption = mode.isPT() &&
            <div className={classes.sliderRow}>
                <div className={classes.sliderHeader}>
                    <div>
                        {t("Min.transfer.time")}
                    </div>
                    <div>
                        {value.minimumTransferTime + " mins"}
                    </div>
                </div>
                <TKUISlider
                    value={value.minimumTransferTime}
                    onChange={((event: any, value: any) => {
                        const userProfileUpdate = Util.deepClone(this.props.value);
                        userProfileUpdate.minimumTransferTime = value;
                        this.props.onChange(userProfileUpdate);
                    }) as any}
                    min={0}
                    max={100}
                />
            </div>;
        const concessionPricingOption = mode.isPT() && regionInfo && regionInfo.transitConcessionPricing &&
            <div className={classes.checkboxRow}>
                <div>
                    Concession pricing
                </div>
                <GreenCheckbox
                    checked={value.transitConcessionPricing}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        const checked = event.target.checked;
                        const userProfileUpdate = Util.deepClone(value);
                        userProfileUpdate.transitConcessionPricing = checked;
                        this.props.onChange(userProfileUpdate);
                    }}
                    value="primary"
                    inputProps={{'aria-label': 'primary checkbox'}}
                />
            </div>;
        const wheelchairOption = mode.isPT() &&
            <div className={classes.checkboxRow}>
                <div>
                    {t("Wheelchair.information")}
                </div>
                <GreenCheckbox
                    checked={value.wheelchair}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        const checked = event.target.checked;
                        const userProfileUpdate = Util.deepClone(value);
                        userProfileUpdate.wheelchair = checked;
                        this.props.onChange(userProfileUpdate);
                    }}
                    value="primary"
                    inputProps={{ 'aria-label': 'primary checkbox' }}
                />
            </div>;
        let walkSpeedSelect: any = undefined;
        if (mode.isWalk() || mode.isWheelchair()) {
            const walkSpeedOptions: any[] = (Object.values(WalkingSpeed).filter(value => typeof value === 'number'))
                .map((value) => {
                    return { value: value, label: TKUITransportOptionsRow.walkingSpeedString(value as WalkingSpeed, t)};
                });
            walkSpeedSelect =
                <TKUISelect
                    options={walkSpeedOptions}
                    value={walkSpeedOptions.find((option: any) => option.value === value.walkingSpeed)}
                    onChange={(option) => {
                        const walkSpeed = option.value;
                        const userProfileUpdate = Util.deepClone(value);
                        userProfileUpdate.walkingSpeed = walkSpeed;
                        this.props.onChange(userProfileUpdate);
                    }}
                    className={classes.walkSpeedSelect}
                />
        }
        const walkSpeedOption = walkSpeedSelect &&
            <div className={classes.checkboxRow}>
                <div>
                    {mode.isWalk() ? t("Walk.speed") : t("Roll.speed")}
                </div>
                {walkSpeedSelect}
            </div>;
        let cycleSpeedSelect: any = undefined;
        if (mode.isBicycle()) {
            const cycleSpeedOptions: any[] = (Object.values(WalkingSpeed).filter(value => typeof value === 'number'))
                .map((value) => {
                    return { value: value, label: TKUITransportOptionsRow.walkingSpeedString(value as WalkingSpeed, t)};
                });
            cycleSpeedSelect =
                <TKUISelect
                    options={cycleSpeedOptions}
                    value={cycleSpeedOptions.find((option: any) => option.value === value.cyclingSpeed)}
                    onChange={(option) => {
                        const cycleSpeed = option.value;
                        const userProfileUpdate = Util.deepClone(value);
                        userProfileUpdate.cyclingSpeed = cycleSpeed;
                        this.props.onChange(userProfileUpdate);
                    }}
                    className={classes.walkSpeedSelect}
                />
        }
        const cycleSpeedOption = cycleSpeedSelect &&
            <div className={classes.checkboxRow}>
                <div>
                    {t("Cycle.speed")}
                </div>
                {cycleSpeedSelect}
            </div>;
        const hasContent = minimizedOption || preferredTransportOption || minTransferTimeOption || concessionPricingOption ||
            wheelchairOption || walkSpeedSelect || cycleSpeedOption;
        return (
            <ExpansionPanel
                expanded={this.state.expanded}
                onChange={(event: any, expanded: boolean) => {
                    if (displayValue === DisplayConf.HIDDEN || !hasContent) {
                        return;
                    }
                    this.setState({expanded: expanded})
                }}
                classes={{
                    root: classes.expansionPanel
                }}
            >
                <ExpansionPanelSummary
                    expandIcon={displayValue !== DisplayConf.HIDDEN && hasContent ? <IconAngleDown className={classes.iconExpand}/> : undefined}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                >
                    <div className={classes.main}>
                        <GreenCheckbox
                            checked={displayValue !== DisplayConf.HIDDEN}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                const checked = event.target.checked;
                                const update = Util.deepClone(this.props.value);
                                update.transportOptions.setTransportOption(mode.identifier,
                                    checked ? DisplayConf.NORMAL : DisplayConf.HIDDEN);
                                this.props.onChange(update);
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

    public componentDidUpdate(prevProps: Readonly<IProps>) {
        // This may happen when unchecking mode, or checking mutually exclusive mode (e.g. wa_wal and wa_whe)
        const prevDisplayValue = prevProps.value.transportOptions.getTransportOption(prevProps.mode.identifier);
        const displayValue = this.props.value.transportOptions.getTransportOption(this.props.mode.identifier);
        if (displayValue === DisplayConf.HIDDEN && prevDisplayValue !== DisplayConf.HIDDEN) {
            this.setState({expanded: false});
        }
    }

}

const Mapper: PropsMapper<IClientProps, Subtract<IProps, TKUIWithClasses<IStyle, IProps>>> =
    ({inputProps, children}) =>
        <RoutingResultsContext.Consumer>
            {(routingContext: IRoutingResultsContext) => {
                const consumedProps: IConsumedProps = {
                    regionInfo: routingContext.regionInfo
                };
                return children!({...inputProps, ...consumedProps})
            }}
        </RoutingResultsContext.Consumer>;

export default connect((config: TKUIConfig) => config.TKUITransportOptionsRow, config, Mapper);