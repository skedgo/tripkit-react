import * as React from "react";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {tKUIUserPrioritiesDefaultStyle} from "./TKUIUserPriorities.css";
import {connect, mapperFromFunction} from "../config/TKConfigHelper";
import TKWeightingPreferences, {WeightingPreference} from "../model/options/TKWeightingPreferences";
import TKUISlider from "./TKUISlider";
import iconMoney from "../images/badges/ic-badge-money.svg";
import iconCarbon from "../images/badges/ic-badge-leaf.svg";
import iconTime from "../images/ic-clock.svg";
import iconHassle from "../images/badges/ic-badge-like.svg";

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    value: TKWeightingPreferences;
    onChange: (update: TKWeightingPreferences) => void;
}

export interface IStyle {
    main: CSSProps<IProps>;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {}

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
        return (
            <div className={classes.main}>
                <TKUISlider
                    // TODO: consider using defaultValue + onChangeCommited, which is more efficient than value + onChange.
                    // Warning: with defaultValue + onChangeCommited slider won't update if priorities modified from
                    // outside.
                    value={priorities.money * 100}
                    onChange={(event: any, value: any) => {
                        this.props.onChange(TKWeightingPreferences.slidePrefTo(priorities, WeightingPreference.money, value/100));
                    }}
                    thumbIcon={iconMoney}
                    label={"Money"}
                    leftLabel={"I don't care"}
                    rightLabel={"Save money"}
                    min={0}
                    max={200}
                    // valueLabelDisplay={'on'}
                    // valueLabelFormat={(value: number) => "Money"}
                />
                <TKUISlider
                    value={priorities.time * 100}
                    onChange={(event: any, value: any) =>
                        this.props.onChange(TKWeightingPreferences.slidePrefTo(priorities, WeightingPreference.time, value/100))}
                    thumbIcon={iconTime}
                    label={"Time"}
                    leftLabel={"I don't care"}
                    rightLabel={"Save time"}
                    min={0}
                    max={200}
                />
                <TKUISlider
                    value={priorities.carbon * 100}
                    onChange={(event: any, value: any) =>
                        this.props.onChange(TKWeightingPreferences.slidePrefTo(priorities, WeightingPreference.carbon, value/100))}
                    thumbIcon={iconCarbon}
                    label={"Carbon"}
                    leftLabel={"I don't care"}
                    rightLabel={"Reduce carbon"}
                    min={0}
                    max={200}
                />
                <TKUISlider
                    value={priorities.hassle * 100}
                    onChange={(event: any, value: any) =>
                        this.props.onChange(TKWeightingPreferences.slidePrefTo(priorities, WeightingPreference.hassle, value/100))}
                    thumbIcon={iconHassle}
                    label={"Convenience"}
                    leftLabel={"I don't care"}
                    rightLabel={"Less hassle"}
                    min={0}
                    max={200}
                />
            </div>
        );
    }
}

export default connect((config: TKUIConfig) => config.TKUIUserPriorities, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));