import * as React from "react";
import { CSSProps, overrideClass, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import { tKUIUserPrioritiesDefaultStyle } from "./TKUIUserPriorities.css";
import { connect, PropsMapper } from "../config/TKConfigHelper";
import TKWeightingPreferences, { WeightingPreference } from "../model/options/TKWeightingPreferences";
import TKUISlider from "./TKUISlider";
import { CardPresentation, default as TKUICard } from "../card/TKUICard";
import { Subtract } from "utility-types";
import { TKUIViewportUtil, TKUIViewportUtilProps } from "../util/TKUIResponsiveUtil";
import TKUIButton, { TKUIButtonType } from "../buttons/TKUIButton";
import HasCard, { HasCardKeys } from "../card/HasCard";
import { TKUIConfigContext } from "../config/TKUIConfigProvider";
import Constants from "../util/Constants";

export interface IClientProps extends TKUIWithStyle<IStyle, IProps>, Pick<HasCard, HasCardKeys.onRequestClose | HasCardKeys.cardPresentation | HasCardKeys.slideUpOptions> {
    value: TKWeightingPreferences;
    onChange: (update: TKWeightingPreferences) => void;
}
export interface IConsumedProps extends TKUIViewportUtilProps {
    config: TKUIConfig;
}
export interface IStyle {
    main: CSSProps<IProps>;
}

interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> { }

export type TKUIUserPrioritiesProps = IProps;
export type TKUIUserPrioritiesStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIUserPriorities {...props} />,
    styles: tKUIUserPrioritiesDefaultStyle,
    classNamePrefix: "TKUIUserPriorities"
};

class TKUIUserPriorities extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        const { classes, t, value: priorities, cardPresentation, config } = this.props;
        return (
            <TKUICard
                title={t("My.Priorities")}
                presentation={cardPresentation ?? (this.props.landscape ? CardPresentation.MODAL : CardPresentation.SLIDE_UP)}
                focusTrap={true}
                onRequestClose={this.props.onRequestClose}
                slideUpOptions={this.props.slideUpOptions}
            >
                <div className={classes.main}>
                    <TKUISlider
                        // TODO: consider using defaultValue + onChangeCommited, which is more efficient than value + onChange.
                        // Warning: with defaultValue + onChangeCommited slider won't update if priorities modified from
                        // outside.
                        value={priorities.money * 100}
                        onChange={((event: any, value: any) => {
                            this.props.onChange(TKWeightingPreferences.slidePrefTo(priorities, WeightingPreference.money, value / 100));
                        }) as any}
                        thumbIconUrl={Constants.absUrl("/images/priorities/ic-priority-money.svg")}
                        label={t("rQd-ri-hHa.text")}
                        leftLabel={t("I.dont.care")}
                        rightLabel={t("yuP-f9-IR1.text")}
                        min={0}
                        max={200}
                        // valueLabelDisplay={'on'}
                        // valueLabelFormat={(value: number) => "Money"}
                        isDarkMode={this.props.theme.isDark}
                        aria-label={t("rQd-ri-hHa.text")}
                        theme={this.props.theme}
                    />
                    <TKUISlider
                        value={priorities.time * 100}
                        onChange={((event: any, value: any) =>
                            this.props.onChange(TKWeightingPreferences.slidePrefTo(priorities, WeightingPreference.time, value / 100))) as any}
                        thumbIconUrl={Constants.absUrl("/images/priorities/ic-priority-time.svg")}
                        label={t("o4h-JW-YBy.text")}
                        leftLabel={t("I.dont.care")}
                        rightLabel={t("KSL-Sc-UHU.text")}
                        min={0}
                        max={200}
                        isDarkMode={this.props.theme.isDark}
                        aria-label={t("o4h-JW-YBy.text")}
                        theme={this.props.theme}
                    />
                    <TKUISlider
                        value={priorities.carbon * 100}
                        onChange={((event: any, value: any) =>
                            this.props.onChange(TKWeightingPreferences.slidePrefTo(priorities, WeightingPreference.carbon, value / 100))) as any}
                        thumbIconUrl={Constants.absUrl("/images/priorities/ic-priority-environment.svg")}
                        label={t("EzB-oD-wvZ.text")}
                        leftLabel={t("I.dont.care")}
                        rightLabel={t("RKH-vV-EU9.text")}
                        min={0}
                        max={200}
                        isDarkMode={this.props.theme.isDark}
                        aria-label={t("EzB-oD-wvZ.text")}
                        theme={this.props.theme}
                    />
                    <TKUISlider
                        value={priorities.hassle * 100}
                        onChange={((event: any, value: any) =>
                            this.props.onChange(TKWeightingPreferences.slidePrefTo(priorities, WeightingPreference.hassle, value / 100))) as any}
                        thumbIconUrl={Constants.absUrl("/images/priorities/ic-priority-convenience.svg")}
                        label={t("brC-tq-EEG.text")}
                        leftLabel={t("I.dont.care")}
                        rightLabel={t("g7e-OY-rPw.text")}
                        min={0}
                        max={200}
                        isDarkMode={this.props.theme.isDark}
                        aria-label={t("brC-tq-EEG.text")}
                        theme={this.props.theme}
                    />
                    <TKUIButton text={t("Reset")}
                        type={TKUIButtonType.SECONDARY}
                        styles={{
                            main: overrideClass({
                                marginTop: '20px'
                            })
                        }}
                        onClick={() => this.props.onChange(TKWeightingPreferences.create(config.defaultUserProfile?.weightingPrefs))}
                    />
                </div>
            </TKUICard>
        );
    }
}

const Mapper: PropsMapper<IClientProps, Subtract<IProps, TKUIWithClasses<IStyle, IProps>>> =
    ({ inputProps, children }) =>
        <TKUIConfigContext.Consumer>
            {(config: TKUIConfig) =>
                <TKUIViewportUtil>
                    {(viewportProps: TKUIViewportUtilProps) =>
                        children!({ ...inputProps, ...viewportProps, config })}
                </TKUIViewportUtil>}
        </TKUIConfigContext.Consumer>;

export default connect((config: TKUIConfig) => config.TKUIUserPriorities, config, Mapper);