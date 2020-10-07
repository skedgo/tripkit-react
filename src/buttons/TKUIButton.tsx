import * as React from "react";
import {MouseEvent} from "react";
import {ClassNameMap} from 'react-jss';
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import classNames from "classnames";
import {tKUIButtonDefaultStyle} from "./TKUIButton.css";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {connect, mapperFromFunction} from "../config/TKConfigHelper";

export enum TKUIButtonType {
    PRIMARY, SECONDARY, PRIMARY_VERTICAL, SECONDARY_VERTICAL, PRIMARY_LINK
}

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    /**
     *  Values: ```TKUIButtonType.PRIMARY, TKUIButtonType.SECONDARY, TKUIButtonType.PRIMARY_VERTICAL, TKUIButtonType.SECONDARY_VERTICAL, TKUIButtonType.PRIMARY_LINK```
     *  @ctype
     *  @default TKUIButtonType.PRIMARY
     */
    type?: TKUIButtonType;
    /**
     * Button text.
     */
    text?: string;
    /**
     * Button icon.
     * @ctype JSX.Element
     */
    icon?: JSX.Element;

    /**
     * Button click handler.
     * @ctype (e: React.MouseEvent) => void
     */
    onClick?: (e: MouseEvent) => void;

    /**
     * Stating if button is disabled.
     */
    disabled?: boolean;

    /**
     * Forwarded to button element.
     */
    'aria-hidden'?: boolean;

    /**
     * Forwarded to button element.
     */
    tabIndex?: number;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {}

interface IStyle {
    main: CSSProps<IProps>;
    primary: CSSProps<IProps>;
    secondary: CSSProps<IProps>;
    vertical: CSSProps<IProps>;
    link: CSSProps<IProps>;
    iconContainer: CSSProps<IProps>;
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
                <button className={classNames(classes.main, classes.link)}
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
                <button className={classNames(classes.main, classes.vertical)}
                        onClick={this.props.onClick}
                        disabled={this.props.disabled}
                >
                    <div className={classNames(secondary ? classes.secondary : classes.primary)}
                            aria-label={this.props.text}
                            aria-hidden={this.props['aria-hidden']}
                            tabIndex={this.props.tabIndex}
                    >
                        {this.props.icon &&
                        <div className={classes.iconContainer}>
                            {this.props.icon}
                        </div>}
                    </div>
                    {this.props.text}
                </button>
                :
                <button className={classNames(classes.main, secondary ? classes.secondary : classes.primary)}
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


    componentDidUpdate(prevProps: Readonly<IProps>) {
        // Manually refresh styles if they changed. Temporal workaround until discover how to make dynamic update of
        // sheets work. Needed for TKUIFavouriteAction, for instance.
        if (this.props.styles !== prevProps.styles) {
            this.props.refreshStyles()
        }
    }

}

export default connect((config: TKUIConfig) => config.TKUIButton, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));