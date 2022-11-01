import * as React from "react";
import { TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import { tKUIUserPrioritiesDefaultStyle } from "./TKUIUserPriorities.css";
import { connect, PropsMapper } from "../config/TKConfigHelper";
import TKWeightingPreferences, { WeightingPreference } from "../model/options/TKWeightingPreferences";
import { CardPresentation, default as TKUICard } from "../card/TKUICard";
import { Subtract } from "utility-types";
import { TKUIViewportUtil, TKUIViewportUtilProps } from "../util/TKUIResponsiveUtil";
import HasCard, { HasCardKeys } from "../card/HasCard";
import { TKUIConfigContext } from "../config/TKUIConfigProvider";
import Constants from "../util/Constants";
import TKUIPrioritySlider from "./TKUIPrioritySlider";
import Util from "../util/Util";
export interface IClientProps extends TKUIWithStyle<IStyle, IProps>, Pick<HasCard, HasCardKeys.onRequestClose | HasCardKeys.cardPresentation | HasCardKeys.slideUpOptions> {
    value: TKWeightingPreferences;
    onChange: (update: TKWeightingPreferences) => void;
}
export interface IConsumedProps extends TKUIViewportUtilProps {
    config: TKUIConfig;
}

interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> { }

type IStyle = ReturnType<typeof tKUIUserPrioritiesDefaultStyle>;

export type TKUIUserPrioritiesProps = IProps;
export type TKUIUserPrioritiesStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIUserPriorities {...props} />,
    styles: tKUIUserPrioritiesDefaultStyle,
    classNamePrefix: "TKUIUserPriorities"
};

const slidePrefTo = (prefs: TKWeightingPreferences, pref: WeightingPreference, value: number): TKWeightingPreferences => {
    const result = Util.clone(prefs);
    if (value === 2) {
        Object.keys(WeightingPreference).forEach(prefName => result[prefName] = Math.min(result[prefName], 1))
    }
    result[pref] = value;
    return result;
}

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
                    <div>
                        {t("Use.the.sliders.to.choose.your.highest.and.lowest.priorities.when.travelling..Only.one.priority.can.be.maximised.")}
                        &nbsp;
                        {t("aMf-bu-Gcg.text")}
                        .
                    </div>
                    <div className={classes.priorities}>
                        <div>
                            <div className={classes.priority}>
                                <TKUIPrioritySlider
                                    value={priorities.money as 0 | 1 | 2}
                                    onChange={value => {
                                        this.props.onChange(slidePrefTo(priorities, WeightingPreference.money, value));
                                    }}
                                    thumbIconUrl={Constants.absUrl("/images/priorities/ic-priority-money.svg")}
                                    color={'#8e59f7'}
                                    isDarkMode={this.props.theme.isDark}
                                    aria-label={t("rQd-ri-hHa.text")}
                                    theme={this.props.theme}
                                />
                                <label>{t("rQd-ri-hHa.text")}</label>
                            </div>
                            <div className={classes.priority}>
                                <TKUIPrioritySlider
                                    value={priorities.time as 0 | 1 | 2}
                                    onChange={value => {
                                        this.props.onChange(slidePrefTo(priorities, WeightingPreference.time, value));
                                    }}
                                    thumbIconUrl={Constants.absUrl("/images/priorities/ic-priority-time.svg")}
                                    color={'#e87aa4'}
                                    isDarkMode={this.props.theme.isDark}
                                    aria-label={t("o4h-JW-YBy.text")}
                                    theme={this.props.theme}
                                />
                                <label>{t("o4h-JW-YBy.text")}</label>
                            </div>
                        </div>
                        <div>
                            <div className={classes.priority}>
                                <TKUIPrioritySlider
                                    value={priorities.carbon as 0 | 1 | 2}
                                    onChange={value => {
                                        this.props.onChange(slidePrefTo(priorities, WeightingPreference.carbon, value));
                                    }}
                                    thumbIconUrl={Constants.absUrl("/images/priorities/ic-priority-environment.svg")}
                                    color={'#b8e295'}
                                    isDarkMode={this.props.theme.isDark}
                                    aria-label={t("EzB-oD-wvZ.text")}
                                    theme={this.props.theme}
                                />
                                <label>{t("EzB-oD-wvZ.text")}</label>
                            </div>
                            <div className={classes.priority}>
                                <TKUIPrioritySlider
                                    value={priorities.hassle as 0 | 1 | 2}
                                    onChange={value => {
                                        this.props.onChange(slidePrefTo(priorities, WeightingPreference.hassle, value));
                                    }}
                                    thumbIconUrl={Constants.absUrl("/images/priorities/ic-priority-convenience.svg")}
                                    color={'#f4a78a'}
                                    isDarkMode={this.props.theme.isDark}
                                    aria-label={t("brC-tq-EEG.text")}
                                    theme={this.props.theme}
                                />
                                <label>{t("brC-tq-EEG.text")}</label>
                            </div>
                        </div>
                        <div className={classes.priority}>
                            <TKUIPrioritySlider
                                value={priorities.exercise as 0 | 1 | 2}
                                onChange={value => {
                                    this.props.onChange(slidePrefTo(priorities, WeightingPreference.exercise, value));
                                }}
                                thumbIconUrl={Constants.absUrl("/images/priorities/ic-priority-exercise.svg")}
                                color={'#78d6f9'}
                                isDarkMode={this.props.theme.isDark}
                                aria-label={t("juE-EN-u70.text")}
                                theme={this.props.theme}
                            />
                            <label>{t("juE-EN-u70.text")}</label>
                        </div>
                    </div>
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