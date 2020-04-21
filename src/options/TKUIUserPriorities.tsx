import * as React from "react";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {tKUIUserPrioritiesDefaultStyle} from "./TKUIUserPriorities.css";
import {connect, PropsMapper} from "../config/TKConfigHelper";
import TKWeightingPreferences, {WeightingPreference} from "../model/options/TKWeightingPreferences";
import TKUISlider from "./TKUISlider";
import iconMoney from "../images/badges/ic-badge-money.svg";
import iconCarbon from "../images/badges/ic-badge-leaf.svg";
import iconTime from "../images/ic-clock.svg";
import iconHassle from "../images/badges/ic-badge-like.svg";
import TKUICard, {CardPresentation} from "../card/TKUICard";
import {Subtract} from "utility-types";
import {TKUIViewportUtil, TKUIViewportUtilProps} from "../util/TKUIResponsiveUtil";
import {TKUISlideUpOptions} from "../card/TKUISlideUp";
import TKUIButton, {TKUIButtonType} from "../buttons/TKUIButton";

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    value: TKWeightingPreferences;
    onChange: (update: TKWeightingPreferences) => void;
    onRequestClose?: () => void;
    slideUpOptions?: TKUISlideUpOptions;
}

export interface IConsumedProps extends TKUIViewportUtilProps {}

export interface IStyle {
    main: CSSProps<IProps>;
    resetBtn: CSSProps<IProps>;
}

interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> {}

export type TKUIUserPrioritiesProps = IProps;
export type TKUIUserPrioritiesStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIUserPriorities {...props}/>,
    styles: tKUIUserPrioritiesDefaultStyle,
    classNamePrefix: "TKUIUserPriorities"
};

class TKUIUserPriorities extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        const classes = this.props.classes;
        const priorities = this.props.value;
        const t = this.props.t;
        return (
            <TKUICard
                title={t("My.Priorities")}
                presentation={this.props.landscape ? CardPresentation.MODAL : CardPresentation.SLIDE_UP}
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
                            this.props.onChange(TKWeightingPreferences.slidePrefTo(priorities, WeightingPreference.money, value/100));
                        }) as any}
                        thumbIcon={iconMoney}
                        label={t("rQd-ri-hHa.text")}
                        leftLabel={t("I.dont.care")}
                        rightLabel={t("yuP-f9-IR1.text")}
                        min={0}
                        max={200}
                        // valueLabelDisplay={'on'}
                        // valueLabelFormat={(value: number) => "Money"}
                    />
                    <TKUISlider
                        value={priorities.time * 100}
                        onChange={((event: any, value: any) =>
                            this.props.onChange(TKWeightingPreferences.slidePrefTo(priorities, WeightingPreference.time, value/100))) as any}
                        thumbIcon={iconTime}
                        label={t("o4h-JW-YBy.text")}
                        leftLabel={t("I.dont.care")}
                        rightLabel={t("KSL-Sc-UHU.text")}
                        min={0}
                        max={200}
                    />
                    <TKUISlider
                        value={priorities.carbon * 100}
                        onChange={((event: any, value: any) =>
                            this.props.onChange(TKWeightingPreferences.slidePrefTo(priorities, WeightingPreference.carbon, value/100))) as any}
                        thumbIcon={iconCarbon}
                        label={t("EzB-oD-wvZ.text")}
                        leftLabel={t("I.dont.care")}
                        rightLabel={t("RKH-vV-EU9.text")}
                        min={0}
                        max={200}
                    />
                    <TKUISlider
                        value={priorities.hassle * 100}
                        onChange={((event: any, value: any) =>
                            this.props.onChange(TKWeightingPreferences.slidePrefTo(priorities, WeightingPreference.hassle, value/100))) as any}
                        thumbIcon={iconHassle}
                        label={t("brC-tq-EEG.text")}
                        leftLabel={t("I.dont.care")}
                        rightLabel={t("g7e-OY-rPw.text")}
                        min={0}
                        max={200}
                    />
                    <TKUIButton text={"Reset"}
                                type={TKUIButtonType.SECONDARY}
                                className={classes.resetBtn}
                                onClick={() => this.props.onChange(TKWeightingPreferences.create())}
                    />
                </div>
            </TKUICard>
        );
    }
}

const Mapper: PropsMapper<IClientProps, Subtract<IProps, TKUIWithClasses<IStyle, IProps>>> =
    ({inputProps, children}) =>
        <TKUIViewportUtil>
            {(viewportProps: TKUIViewportUtilProps) =>
                children!({...inputProps, ...viewportProps})}
        </TKUIViewportUtil>;

export default connect((config: TKUIConfig) => config.TKUIUserPriorities, config, Mapper);