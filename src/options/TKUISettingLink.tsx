import * as React from "react";
import { ReactComponent as IconRightArrow } from "../images/ic-angle-right.svg";
import { CSSProps, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { connect, mapperFromFunction } from "../config/TKConfigHelper";
import { TKComponentDefaultConfig } from "../config/TKUIConfig";
import { tKUISettingLinkDefaultStyle } from "./TKUISettingLink.css";

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    text: string | JSX.Element;
    onClick: () => void;
    rightIcon?: () => JSX.Element;
}

export interface IStyle {
    optionLink: CSSProps<IProps>;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> { }

export type TKUISettingLinkProps = IProps;
export type TKUISettingLinkStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUISettingLink {...props} />,
    styles: tKUISettingLinkDefaultStyle,
    classNamePrefix: "TKUISettingLink"
};

const TKUISettingLink: React.FunctionComponent<IProps> = (props: IProps) => {
    const classes = props.classes;
    return (
        <button className={classes.optionLink}
            onClick={props.onClick}
        >
            {props.text}
            {props.rightIcon ? props.rightIcon() : <IconRightArrow />}
        </button>
    );
};

export default connect(() => undefined, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));