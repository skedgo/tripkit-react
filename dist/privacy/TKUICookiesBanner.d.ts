/// <reference types="react" />
import { CSSProps, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
}
export interface IStyle {
    main: CSSProps<IProps>;
}
interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {
}
export declare type TKUICookiesBannerProps = IProps;
export declare type TKUICookiesBannerStyle = IStyle;
declare const _default: (props: IClientProps) => JSX.Element;
export default _default;
