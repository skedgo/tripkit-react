import { CSSProps, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { CSSProperties } from "react";
export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    options: any[];
    value: any;
    onChange: (value: any) => void;
    menuIsOpen?: boolean;
    components?: any;
    className?: string;
    controlStyle?: CSSProperties;
    menuStyle?: CSSProperties;
}
interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {
}
interface IStyle {
    container: CSSProps<IProps>;
    menu: CSSProps<IProps>;
    control: CSSProps<IProps>;
    option: CSSProps<IProps>;
    optionFocused: CSSProps<IProps>;
    optionSelected: CSSProps<IProps>;
}
export declare type TKUISelectProps = IProps;
export declare type TKUISelectStyle = IStyle;
declare const _default: (props: IClientProps) => JSX.Element;
export default _default;
