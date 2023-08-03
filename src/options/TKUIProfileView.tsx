import React, { useContext } from "react";
import Util from "../util/Util";
import Region from "../model/region/Region";
import RegionsData from "../data/RegionsData";
import ModeIdentifier from "../model/region/ModeIdentifier";
import { IOptionsContext, OptionsContext } from "./OptionsProvider";
import { IRoutingResultsContext, RoutingResultsContext } from "../trip-planner/RoutingResultsProvider";
import TKUICard, { CardPresentation } from "../card/TKUICard";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import { connect, PropsMapper } from "../config/TKConfigHelper";
import { CSSProps, overrideClass, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { tKUIProfileViewDefaultStyle } from "./TKUIProfileView.css";
import { Subtract } from "utility-types";
import TKUIUserPriorities from "./TKUIUserPriorities";
import TKUserProfile from "../model/options/TKUserProfile";
import TKWeightingPreferences from "../model/options/TKWeightingPreferences";
import { TKUIViewportUtil, TKUIViewportUtilProps } from "../util/TKUIResponsiveUtil";
import { ReactComponent as IconAngleDown } from "../images/ic-angle-down.svg";
import TKUITransportOptionsView from "./TKUITransportOptionsView";
import TKUIPrivacyOptionsView from "./TKUIPrivacyOptionsView";
import { TKUISlideUpOptions, TKUISlideUpPosition } from "../card/TKUISlideUp";
import { cardSpacing } from "../jss/TKUITheme";
import TKUISelect, { SelectOption } from "../buttons/TKUISelect";
import TKUISettingSection from "./TKUISettingSection";
import TKUISettingLink from "./TKUISettingLink";
import { IAccountContext, SignInStatus, TKAccountContext } from "../account/TKAccountContext";
import TKUIMyBookings from "../booking/TKUIMyBookings";
import { TKUIConfigContext } from "../config/TKUIConfigProvider";


export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    onRequestClose?: () => void;
    slideUpOptions?: TKUISlideUpOptions;
    accountSettings?: () => React.ReactNode;
    customSettings?: () => React.ReactNode;
}

interface IConsumedProps extends IOptionsContext, TKUIViewportUtilProps, IAccountContext {
    region?: Region;
    config: TKUIConfig;
}

export interface IStyle {
    main: CSSProps<IProps>;
    link: CSSProps<IProps>;
    checkboxRow: CSSProps<IProps>;
    optionSelect: CSSProps<IProps>;
}

interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> { }

export type TKUIProfileViewProps = IProps;
export type TKUIProfileViewStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIProfileView {...props} />,
    styles: tKUIProfileViewDefaultStyle,
    classNamePrefix: "TKUIProfileView"
};

interface IState {
    update: TKUserProfile;
    schoolModeId?: ModeIdentifier;
    pickSchoolError: boolean;
    showPersonalData: boolean;
    showMyBookings: boolean;
    showTransports: boolean;
    showPriorities: boolean;
}

class TKUIProfileView extends React.Component<IProps, IState> {

    private appearanceOptions: SelectOption[];

    constructor(props: IProps) {
        super(props);
        this.state = {
            update: this.props.userProfile,
            pickSchoolError: false,
            showPersonalData: false,
            showMyBookings: false,
            showTransports: false,
            showPriorities: false
        };
        RegionsData.instance.getModeIdentifierP(ModeIdentifier.SCHOOLBUS_ID).then((modeId?: ModeIdentifier) =>
            this.setState({ schoolModeId: modeId }));
        const t = this.props.t;
        this.appearanceOptions = [
            { value: undefined, label: t("Match.OS") },
            { value: false, label: t("Light") },
            { value: true, label: t("Dark") }
        ];
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
                onChange={(update: TKUserProfile) => this.setState({ update: update })}
                onShowTransportOptions={() => this.setState({ showTransports: true })}
                onRequestClose={() =>
                    this.setState({ showPersonalData: false },
                        () => this.applyChanges())}
                slideUpOptions={{
                    position: TKUISlideUpPosition.UP,
                    modalUp: { top: cardSpacing(this.props.landscape), unit: 'px' },
                    draggable: false
                }}
            />;
        const transportSettings = this.state.showTransports &&
            <TKUITransportOptionsView
                value={this.state.update}
                onChange={(update: TKUserProfile) => this.setState({ update: update })}
                onRequestClose={() =>
                    this.setState({ showTransports: false },
                        () => this.applyChanges())}
                slideUpOptions={{
                    initPosition: TKUISlideUpPosition.UP,
                    modalUp: { top: cardSpacing(this.props.landscape), unit: 'px' },
                    draggable: false
                }}
            />;
        const myBookings = this.state.showMyBookings &&
            <TKUIMyBookings
                onRequestClose={closeAll => {
                    this.setState({ showMyBookings: false });
                    if (closeAll) {
                        this.props.onRequestClose && this.props.onRequestClose();
                    }
                }}
                slideUpOptions={this.props.slideUpOptions}
            />;
        const prioritiesSettings = this.state.showPriorities
            && <TKUIUserPriorities
                onRequestClose={() => this.setState({ showPriorities: false },
                    () => this.applyChanges())}
                value={this.state.update.weightingPrefs}
                onChange={(prefsUpdate: TKWeightingPreferences) =>
                    this.setState((prevState: IState) => ({ update: Util.iAssign(prevState.update, { weightingPrefs: prefsUpdate }) }))}
                slideUpOptions={{
                    position: TKUISlideUpPosition.UP,
                    modalUp: { top: cardSpacing(this.props.landscape), unit: 'px' },
                    draggable: false
                }}
            />;
        const t = this.props.t;
        const accountSettings = this.props.accountSettings && this.props.accountSettings();
        const customSettings = this.props.customSettings && this.props.customSettings();
        return (
            <TKUICard
                title={t("Profile")}
                presentation={this.props.landscape ? CardPresentation.MODAL : CardPresentation.SLIDE_UP}
                focusTrap={true}
                onRequestClose={() => this.close(true)}
                slideUpOptions={this.props.slideUpOptions}
            >
                <div className={classes.main}>
                    <TKUISettingSection>
                        {accountSettings}
                        <TKUISettingLink
                            text={t("My.Personal.Data")}
                            onClick={() => this.setState({ showPersonalData: true })} />
                    </TKUISettingSection>
                    {this.props.status === SignInStatus.signedIn &&
                        <TKUISettingSection>
                            <TKUISettingLink
                                text={t("My.Bookings")}
                                onClick={() => this.setState({ showMyBookings: true })}
                            />
                        </TKUISettingSection>}
                    <TKUISettingSection>
                        <TKUISettingLink
                            text={t("Transport")}
                            onClick={() => this.setState({ showTransports: true })}
                        />
                        <TKUISettingLink
                            text={t("Priorities")}
                            onClick={() => this.setState({ showPriorities: true })}
                        />
                    </TKUISettingSection>
                    {this.props.config.isDarkMode === undefined &&
                        <TKUISettingSection>
                            <div className={classes.checkboxRow}>
                                <div>
                                    {t("Appearance")}
                                </div>
                                <TKUISelect
                                    options={this.appearanceOptions}
                                    value={this.appearanceOptions.find((option: SelectOption) => option.value === this.state.update.isDarkMode)!}
                                    onChange={(option) => {
                                        this.setState((prevState: IState) => ({
                                            update: Util.iAssign(prevState.update, { isDarkMode: option.value })
                                        }), () => {
                                            this.applyChanges();
                                        });
                                    }}
                                    styles={() => ({
                                        main: overrideClass(this.props.injectedStyles.optionSelect),
                                        menu: overrideClass({ marginTop: '2px' })
                                    })}
                                    components={{
                                        IndicatorsContainer: () => <IconAngleDown style={{ width: '11px', height: '11px', marginRight: '5px' }} />
                                    }}
                                    ariaLabel={t("Appearance")}
                                />
                            </div>
                        </TKUISettingSection>}
                    {customSettings}
                </div>
                {personalDataSettings}
                {transportSettings}
                {prioritiesSettings}
                {myBookings}
            </TKUICard >
        );
    }

    componentDidUpdate(prevProps: Readonly<IProps>) {
        if (this.props.userProfile !== prevProps.userProfile) {
            this.setState({ update: this.props.userProfile })
        }
    }

}

const Consumer: React.FunctionComponent<{ children: (props: IConsumedProps) => React.ReactNode }> = (props: { children: (props: IConsumedProps) => React.ReactNode }) => {
    const accountContext = useContext(TKAccountContext);
    const config = useContext(TKUIConfigContext);
    return (
        <TKUIViewportUtil>
            {(viewportProps: TKUIViewportUtilProps) =>
                <OptionsContext.Consumer>
                    {(optionsContext: IOptionsContext) =>
                        <RoutingResultsContext.Consumer>
                            {(routingContext: IRoutingResultsContext) =>
                                props.children!({ ...optionsContext, region: routingContext.region, ...viewportProps, ...accountContext, config })
                            }
                        </RoutingResultsContext.Consumer>
                    }
                </OptionsContext.Consumer>
            }
        </TKUIViewportUtil>
    );
};

const Mapper: PropsMapper<IClientProps, Subtract<IProps, TKUIWithClasses<IStyle, IProps>>> =
    ({ inputProps, children }) =>
        <Consumer>
            {(consumedProps: IConsumedProps) =>
                children!({ ...inputProps, ...consumedProps })}
        </Consumer>;

export default connect((config: TKUIConfig) => config.TKUIProfileView, config, Mapper);