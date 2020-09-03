import * as React from "react";
import {ClassNameMap} from "react-jss";
import {ReactComponent as IconRightArrow} from "../images/ic-angle-right.svg";
import classNames from "classnames";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {connect, mapperFromFunction} from "../config/TKConfigHelper";
import {TKComponentDefaultConfig} from "../config/TKUIConfig";
import {tKUISettingLinkDefaultStyle} from "./TKUISettingLink.css";
import {Subtract} from "utility-types";

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    text: string;
    onClick: () => void;
}

export interface IStyle {
    optionRow: CSSProps<IProps>;
    optionLink: CSSProps<IProps>;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {}

export type TKUISettingLinkProps = IProps;
export type TKUISettingLinkStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUISettingLink {...props}/>,
    styles: tKUISettingLinkDefaultStyle,
    classNamePrefix: "TKUISettingLink"
};

const TKUISettingLink: React.SFC<IProps> = (props: IProps) => {
    const classes = props.classes;
    return (
        <div className={classNames(classes.optionRow, classes.optionLink)}
             onClick={props.onClick}
        >
            {props.text}
            <IconRightArrow/>
        </div>
    );
};

export default connect(() => undefined, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));