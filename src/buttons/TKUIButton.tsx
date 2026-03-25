import React, { forwardRef } from "react";
import { TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import classNames from "classnames";
import { tKUIButtonDefaultStyle } from "./TKUIButton.css";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import { connect, mapperFromFunction } from "../config/TKConfigHelper";
import { Subtract } from "utility-types";

export enum TKUIButtonType {
    PRIMARY, SECONDARY, PRIMARY_VERTICAL, SECONDARY_VERTICAL, PRIMARY_LINK
}

export interface IClientProps extends TKUIWithStyle<IStyle, IProps>, Subtract<React.ButtonHTMLAttributes<HTMLButtonElement>, { type?: "submit" | "reset" | "button" | undefined; }> {
    /**
     *  Values: ```TKUIButtonType.PRIMARY, TKUIButtonType.SECONDARY, TKUIButtonType.PRIMARY_VERTICAL, TKUIButtonType.SECONDARY_VERTICAL, TKUIButtonType.PRIMARY_LINK```
     *  @ctype
     *  @default TKUIButtonType.PRIMARY
     */
    type?: TKUIButtonType;
    /**
     * Button text.
     */
    text?: string | JSX.Element;
    /**
     * Button icon.
     * @ctype JSX.Element
     */
    icon?: React.ReactNode;

    /**
     * Button click handler.
     * @ctype (e: React.MouseEvent) => void
     */
    onClick?: (e: any) => void;

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

    'aria-pressed'?: boolean;

    role?: string;

    'aria-label'?: string;

    onKeyDown?: (e: React.KeyboardEvent<HTMLButtonElement>) => void;

    name?: string;

    buttonRef?: React.Ref<HTMLButtonElement>;
}

type IStyle = ReturnType<typeof tKUIButtonDefaultStyle>;

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> { }

export type TKUIButtonProps = IProps;
export type TKUIButtonStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIButton {...props} />,
    styles: tKUIButtonDefaultStyle,
    classNamePrefix: "TKUIButton"
};

const TKUIButton: React.FC<IProps> = (props: IProps) => {
    const {
        type = TKUIButtonType.PRIMARY, text, icon, classes, injectedStyles, theme, refreshStyles, styles, t, buttonRef,
        ...otherProps
    } = props;
    // Remove all other properties that are not part of HTMLButtonElement.
    const {
        defaultStyles, propStyles, configStyles, randomizeClassNames, classNamePrefix, verboseClassNames, i18nOverridden,
        ...nativeButtonProps
    } = otherProps as any;
    const secondary = type === TKUIButtonType.SECONDARY || type === TKUIButtonType.SECONDARY_VERTICAL;
    const vertical = type === TKUIButtonType.PRIMARY_VERTICAL || type === TKUIButtonType.SECONDARY_VERTICAL;
    const link = type === TKUIButtonType.PRIMARY_LINK;
    if (link) {
        return (
            <button
                className={classNames(classes.main, classes.link)}
                onClick={props.onClick}
                disabled={props.disabled}
                {...nativeButtonProps}
                ref={buttonRef}
            >
                {text}
            </button>
        )
    }
    return (
        vertical ?
            <button
                className={classNames(classes.main, classes.vertical)}
                onClick={props.onClick}
                disabled={props.disabled}
                {...nativeButtonProps}
                ref={buttonRef}
            >
                <div className={classNames(secondary ? classes.secondary : classes.primary)}>
                    {icon &&
                        <div className={classes.iconContainer}>
                            {icon}
                        </div>}
                </div>
                {text}
            </button>
            :
            <button
                className={classNames(classes.main, secondary ? classes.secondary : classes.primary)}
                onClick={props.onClick}
                disabled={props.disabled}
                {...nativeButtonProps}
                ref={buttonRef}
            >
                {icon &&
                    <div className={classes.iconContainer}>
                        {icon}
                    </div>}
                {text}
            </button>
    );
};

const TKUIButtonConnected = connect((config: TKUIConfig) => config.TKUIButton, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));

export default forwardRef<HTMLButtonElement, IClientProps>((props, ref) =>
    <TKUIButtonConnected {...props} buttonRef={ref} />);