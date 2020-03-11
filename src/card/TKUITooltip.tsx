import * as React from "react";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {connect, mapperFromFunction} from "../config/TKConfigHelper";
import Tooltip from "rc-tooltip";
import {RCTooltip} from "rc-tooltip";
import {tKUITooltipDefaultStyle} from "./TKUITooltip.css";
import classNames from "classnames";

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    placement?: string;
    overlay: React.ReactNode;
    mouseEnterDelay?: number;
    trigger?: string[];
    arrowContent?: React.ReactNode;
    className?: string;
    arrowColor?: string;
    children?: any;
    visible?: boolean;
}

export interface IStyle {
    main: CSSProps<IProps>;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {}

export type TKUITooltipProps = IProps;
export type TKUITooltipStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUITooltip {...props}/>,
    styles: tKUITooltipDefaultStyle,
    classNamePrefix: "TKUITooltip"
};

class TKUITooltip extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        return (
            <Tooltip
                {...this.props as RCTooltip.Props}
                overlayClassName={classNames(this.props.classes.main, this.props.className)}
                arrowContent={this.props.arrowContent}
            >
                {this.props.children}
            </Tooltip>
        );
    }

}

export default connect((config: TKUIConfig) => config.TKUITooltip, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));

