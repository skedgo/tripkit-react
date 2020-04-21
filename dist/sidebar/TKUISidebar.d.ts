/// <reference types="react" />
import { CSSProps, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    open?: boolean;
    onRequestClose: () => void;
    onShowFavourites?: () => void;
    onShowSettings?: () => void;
}
export interface IStyle {
    modalContainer: CSSProps<IProps>;
    modal: CSSProps<IProps>;
    main: CSSProps<IProps>;
    header: CSSProps<IProps>;
    closeBtn: CSSProps<IProps>;
    body: CSSProps<IProps>;
    menuItems: CSSProps<IProps>;
    nativeAppLinksPanel: CSSProps<IProps>;
}
interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {
    logo?: () => JSX.Element;
    menuItems?: () => JSX.Element[];
    nativeAppLinks?: () => JSX.Element[];
}
export declare type TKUISidebarProps = IProps;
export declare type TKUISidebarStyle = IStyle;
declare const _default: (props: IClientProps) => JSX.Element;
export default _default;
