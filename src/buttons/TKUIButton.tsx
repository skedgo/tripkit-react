import * as React from "react";
import {ClassNameMap} from 'react-jss';
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import classNames from "classnames";
import {tKUIButtonDefaultStyle} from "./TKUIButton.css";
import * as CSS from 'csstype';
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {connect, mapperFromFunction} from "../config/TKConfigHelper";

export enum TKUIButtonType {
    PRIMARY, SECONDARY, PRIMARY_VERTICAL, SECONDARY_VERTICAL, PRIMARY_LINK
}

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    /**
     *  Values: ```PRIMARY, SECONDARY, PRIMARY_VERTICAL, SECONDARY_VERTICAL, PRIMARY_LINK```
     */
    type?: TKUIButtonType;
    text?: string;
    icon?: JSX.Element;
    style?: CSS.Properties;
    onClick?: (e: any) => void;
    disabled?: boolean;
    className?: string;
    'aria-hidden'?: boolean;
    tabIndex?: number;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {}

interface IStyle {
    main: CSSProps<IProps>;
    primary: CSSProps<IProps>;
    secondary: CSSProps<IProps>;
    link: CSSProps<IProps>;
    iconContainer: CSSProps<IProps>;
    verticalPanel: CSSProps<IProps>;
}

export type TKUIButtonProps = IProps;
export type TKUIButtonStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIButton {...props}/>,
    styles: tKUIButtonDefaultStyle,
    classNamePrefix: "TKUIButton"
};

class TKUIButton extends React.Component<IProps, {}> {

    static defaultProps: Partial<IProps> = {
        type: TKUIButtonType.PRIMARY
    };

    public render(): React.ReactNode {
        const classes = this.props.classes;
        const type = this.props.type;
        const secondary = type === TKUIButtonType.SECONDARY || type === TKUIButtonType.SECONDARY_VERTICAL;
        const vertical = type === TKUIButtonType.PRIMARY_VERTICAL || type === TKUIButtonType.SECONDARY_VERTICAL;
        const link = type === TKUIButtonType.PRIMARY_LINK;
        if (link) {
            return (
                <button className={classNames(classes.main, classes.link, this.props.className)}
                        style={this.props.style}
                        onClick={this.props.onClick}
                        disabled={this.props.disabled}
                        aria-hidden={this.props['aria-hidden']}
                        tabIndex={this.props.tabIndex}
                >
                    {this.props.text}
                </button>
            )
        }
        return (
            vertical ?
                <div className={classNames(classes.verticalPanel, this.props.className)}
                     style={this.props.style}
                     onClick={this.props.onClick}
                >
                    <button className={classNames(classes.main,
                        secondary ? classes.secondary : classes.primary)}
                            aria-label={this.props.text}
                            aria-hidden={this.props['aria-hidden']}
                            tabIndex={this.props.tabIndex}
                    >
                        {this.props.icon &&
                        <div className={classes.iconContainer}>
                            {this.props.icon}
                        </div>}
                    </button>
                    {this.props.text}
                </div>
                :
                <button className={classNames(classes.main,
                    secondary ? classes.secondary : classes.primary, this.props.className)}
                        style={this.props.style}
                        onClick={this.props.onClick}
                        disabled={this.props.disabled}
                        aria-hidden={this.props['aria-hidden']}
                        tabIndex={this.props.tabIndex}
                >
                    {this.props.icon &&
                    <div className={classes.iconContainer}>
                        {this.props.icon}
                    </div>
                    }
                    {this.props.text}
                </button>
        );
    }

}

export default connect((config: TKUIConfig) => config.TKUIButton, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));