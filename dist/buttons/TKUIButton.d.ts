/// <reference types="react" />
import { CSSProps, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import * as CSS from 'csstype';
export declare enum TKUIButtonType {
    PRIMARY = 0,
    SECONDARY = 1,
    PRIMARY_VERTICAL = 2,
    SECONDARY_VERTICAL = 3,
    PRIMARY_LINK = 4
}
export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    type?: TKUIButtonType;
    text?: string;
    icon?: JSX.Element;
    style?: CSS.Properties;
    onClick?: (e: any) => void;
    disabled?: boolean;
    className?: string;
}
interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {
}
interface IStyle {
    main: CSSProps<IProps>;
    primary: CSSProps<IProps>;
    secondary: CSSProps<IProps>;
    link: CSSProps<IProps>;
    iconContainer: CSSProps<IProps>;
    verticalPanel: CSSProps<IProps>;
}
export declare type TKUIButtonProps = IProps;
export declare type TKUIButtonStyle = IStyle;
declare const _default: (props: IClientProps) => JSX.Element;
export default _default;
