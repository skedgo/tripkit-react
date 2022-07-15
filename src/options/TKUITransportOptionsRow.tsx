import * as React from "react";
import { CSSProps, overrideClass, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import { connect, PropsMapper } from "../config/TKConfigHelper";
import { tKUITransportOptionsRowStyle } from "./TKUITransportOptionsRow.css";
import { DisplayConf } from "../model/options/TKTransportOptions";
import ModeIdentifier from "../model/region/ModeIdentifier";
import TransportUtil from "../trip/TransportUtil";
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Checkbox, { CheckboxProps } from '@material-ui/core/Checkbox';
import { withStyles } from '@material-ui/core/styles';
import { ReactComponent as IconAngleDown } from "../images/ic-angle-down.svg";
import { black } from "../jss/TKUITheme";
import ModeInfo from "../model/trip/ModeInfo";
import { Subtract } from "utility-types";
import Util from "../util/Util";
import { IRoutingResultsContext, RoutingResultsContext } from "../trip-planner/RoutingResultsProvider";
import TKUserProfile, { WalkingSpeed } from "../model/options/TKUserProfile";
import TKUISlider from "./TKUISlider";
import RegionInfo from "../model/region/RegionInfo";
import TKUISelect, { SelectOption } from "../buttons/TKUISelect";
import { TranslationFunction } from "../i18n/TKI18nProvider";
import DeviceUtil, { BROWSER } from "../util/DeviceUtil";

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    mode: ModeIdentifier;
    value: TKUserProfile;
    onChange: (value: TKUserProfile) => void;
}

interface IConsumedProps {
    getRegionInfoP: () => (Promise<RegionInfo> | undefined);
}

interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> { }

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
    render: props => <TKUITransportOptionsRow {...props} />,
    styles: tKUITransportOptionsRowStyle,
    classNamePrefix: "TKUITransportOptionsRow"
};

interface IState {
    expanded: boolean;
    regionInfo?: RegionInfo;
}

class TKUITransportOptionsRow extends React.Component<IProps, IState> {

    private GreenCheckbox;
    private walkSpeedOptions: SelectOption[];
    private cycleSpeedOptions: SelectOption[];

    constructor(props: IProps) {
        super(props);
        this.state = {
            expanded: false
        };
        this.GreenCheckbox = withStyles({
            root: {
                color: black(1, props.theme.isDark),
                '&$checked': {
                    color: props.theme.colorPrimary,
                },
            },
            checked: {},
        })((props: CheckboxProps) => <Checkbox color="default" {...props} />);

        const t = this.props.t;
        this.walkSpeedOptions = (Object.values(WalkingSpeed).filter(value => typeof value === 'number'))
            .map((value) => {
                return { value: value, label: TKUITransportOptionsRow.walkingSpeedString(value as WalkingSpeed, t) };
            });
        this.cycleSpeedOptions = (Object.values(WalkingSpeed).filter(value => typeof value === 'number'))
            .map((value) => {
                return { value: value, label: TKUITransportOptionsRow.walkingSpeedString(value as WalkingSpeed, t) };
            });
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
        const regionInfo = this.state.regionInfo;
        const transitModes = regionInfo?.transitModes;
        const classes = this.props.classes;
        const t = this.props.t;
        const minimizedOption = false && // Hidden for now
            <div className={classes.checkboxRow}>
                <div>
                    Minimised
                </div>
                <this.GreenCheckbox
                    checked={displayValue === DisplayConf.BRIEF}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        const checked = event.target.checked;
                        const update = Util.deepClone(this.props.value);
                        update.transportOptions.setTransportOption(mode.identifier,
                            checked ? DisplayConf.BRIEF : DisplayConf.NORMAL);
                        this.props.onChange(update);
                    }}
                    value="primary"
                    inputProps={{ 'aria-label': 'primary checkbox' }}
                />
            </div>;
        const preferredTransportOption = mode.isPT() &&
            <div className={classes.section} tabIndex={0} aria-label="Preferred transport">
                <div className={classes.sectionTitle}>
                    {t("Preferred.transport")}
                </div>
                <div className={classes.sectionBody}>
                    {transitModes && transitModes.map((transMode: ModeInfo, i: number) =>
                        <div className={classes.checkboxRow} key={i}>
                            <img src={TransportUtil.getTransIcon(transMode, { onDark: this.props.theme.isDark })}
                                className={classes.transIcon}
                                aria-hidden={true}
                            />
                            <div className={classes.prefModeTitle}>
                                {transMode.alt}
                            </div>
                            <this.GreenCheckbox
                                checked={value.transportOptions.isPreferredTransport(transMode.identifier!)}
                                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                    const checked = event.target.checked;
                                    const update = Util.deepClone(value);
                                    update.transportOptions.setPreferredTransport(transMode.identifier!, checked);
                                    this.props.onChange(update);
                                }}
                                onClick={event => event.stopPropagation()}
                                onFocus={event => event.stopPropagation()}
                                inputProps={{ 'aria-label': transMode.alt }}
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
                    isDarkMode={this.props.theme.isDark}
                    aria-label={t("Min.transfer.time")}
                    theme={this.props.theme}
                />
            </div>;
        const concessionPricingOption = mode.isPT() && regionInfo?.transitConcessionPricing &&
            <div className={classes.checkboxRow}>
                <div>
                    Concession pricing
                </div>
                <this.GreenCheckbox
                    checked={value.transitConcessionPricing}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        const checked = event.target.checked;
                        const userProfileUpdate = Util.deepClone(value);
                        userProfileUpdate.transitConcessionPricing = checked;
                        this.props.onChange(userProfileUpdate);
                    }}
                    inputProps={{ 'aria-label': "Concession pricing" }}
                />
            </div>;
        const wheelchairOption = mode.isPT() &&
            <div className={classes.checkboxRow}>
                <div>
                    {t("Wheelchair.information")}
                </div>
                <this.GreenCheckbox
                    checked={value.wheelchair}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        const checked = event.target.checked;
                        const userProfileUpdate = Util.deepClone(value);
                        userProfileUpdate.wheelchair = checked;
                        this.props.onChange(userProfileUpdate);
                    }}
                    inputProps={{ 'aria-label': t("Wheelchair.information") }}
                />
            </div>;
        let walkSpeedSelect: any = undefined;
        if (mode.isWalk() || mode.isWheelchair()) {
            walkSpeedSelect =
                <TKUISelect
                    options={this.walkSpeedOptions}
                    value={this.walkSpeedOptions.find((option: any) => option.value === value.walkingSpeed)}
                    onChange={(option) => {
                        const walkSpeed = option.value;
                        const userProfileUpdate = Util.deepClone(value);
                        userProfileUpdate.walkingSpeed = walkSpeed;
                        this.props.onChange(userProfileUpdate);
                    }}
                    styles={{
                        main: overrideClass(this.props.injectedStyles.walkSpeedSelect),
                    }}
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
            cycleSpeedSelect =
                <TKUISelect
                    options={this.cycleSpeedOptions}
                    value={this.cycleSpeedOptions.find((option: any) => option.value === value.cyclingSpeed)}
                    onChange={(option) => {
                        const cycleSpeed = option.value;
                        const userProfileUpdate = Util.deepClone(value);
                        userProfileUpdate.cyclingSpeed = cycleSpeed;
                        this.props.onChange(userProfileUpdate);
                    }}
                    styles={{
                        main: overrideClass(this.props.injectedStyles.walkSpeedSelect),
                    }}
                    ariaLabel={t("Cycle.speed")}
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
                    this.setState({ expanded: expanded })
                }}
                classes={{
                    root: classes.expansionPanel
                }}
            >
                <ExpansionPanelSummary
                    expandIcon={displayValue !== DisplayConf.HIDDEN && hasContent ? <IconAngleDown className={classes.iconExpand} /> : undefined}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                    {...(displayValue === DisplayConf.HIDDEN || !hasContent) ? { role: undefined, tabIndex: -1 } : undefined}
                >
                    <div className={classes.main}>
                        <this.GreenCheckbox
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
                            inputProps={{ 'aria-label': mode.title }}
                        />
                        <img src={TransportUtil.getTransportIconModeId(mode, false, this.props.theme.isDark)}
                            className={classes.transIcon}
                            aria-hidden="true"
                        />
                        {mode.title}
                    </div>
                </ExpansionPanelSummary>
                {DeviceUtil.browser === BROWSER.SAFARI && !this.state.expanded ?
                    null : // To avoid focus to get trapped on checkbox on Safari.
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
                    </ExpansionPanelDetails>}
            </ExpansionPanel>
        );

    }

    private regionInfoP?: Promise<RegionInfo>;

    public componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<IState>) {
        // This may happen when unchecking mode, or checking mutually exclusive mode (e.g. wa_wal and wa_whe)
        const prevDisplayValue = prevProps.value.transportOptions.getTransportOption(prevProps.mode.identifier);
        const displayValue = this.props.value.transportOptions.getTransportOption(this.props.mode.identifier);
        if (displayValue === DisplayConf.HIDDEN && prevDisplayValue !== DisplayConf.HIDDEN) {
            this.setState({ expanded: false });
        }
        if (this.state.expanded && !prevState.expanded && !this.regionInfoP && this.props.mode.isPT()) {
            this.regionInfoP = this.props.getRegionInfoP();
            this.regionInfoP?.then(regionInfo => this.setState({ regionInfo }));
        }
    }

}

const Mapper: PropsMapper<IClientProps, Subtract<IProps, TKUIWithClasses<IStyle, IProps>>> =
    ({ inputProps, children }) =>
        <RoutingResultsContext.Consumer>
            {(routingContext: IRoutingResultsContext) => {
                const consumedProps: IConsumedProps = {
                    getRegionInfoP: routingContext.getRegionInfoP
                };
                return children!({ ...inputProps, ...consumedProps })
            }}
        </RoutingResultsContext.Consumer>;

export default connect((config: TKUIConfig) => config.TKUITransportOptionsRow, config, Mapper);