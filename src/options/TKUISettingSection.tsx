import * as React from "react";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {TKUIViewportUtil, TKUIViewportUtilProps} from "../util/TKUIResponsiveUtil";
import {connect, PropsMapper} from "../config/TKConfigHelper";
import {TKComponentDefaultConfig} from "../config/TKUIConfig";
import {Subtract} from "utility-types";
import {tKUISettingSectionDefaultStyle} from "./TKUISettingSection.css";

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    title?: string;
    children: React.ReactNode;
}

interface IConsumedProps extends TKUIViewportUtilProps {}

export interface IStyle {
    section: CSSProps<IProps>;
    sectionTitle: CSSProps<IProps>;
    sectionBody: CSSProps<IProps>;
}

interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> {}

export type TKUISettingSectionProps = IProps;
export type TKUISettingSectionStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUISettingSection {...props}/>,
    styles: tKUISettingSectionDefaultStyle,
    classNamePrefix: "TKUISettingSection"
};

const TKUISettingSection: React.SFC<IProps> = (props: IProps) => {
    const classes = props.classes;
    const t = props.t;
    return (
        <div className={classes.section}>
            {props.title &&
            <div className={classes.sectionTitle}>
                {t("My.Transport")}
            </div>}
            <div className={classes.sectionBody}>
                {props.children}
            </div>
        </div>
    );
};

const Mapper: PropsMapper<IClientProps, Subtract<IProps, TKUIWithClasses<IStyle, IProps>>> =
    ({inputProps, children}) =>
        <TKUIViewportUtil>
            {(viewportProps: TKUIViewportUtilProps) =>
                children!({...inputProps, ...viewportProps})}
        </TKUIViewportUtil>;

export default connect(() => undefined, config, Mapper);