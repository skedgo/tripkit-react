/// <reference types="react" />
import { CSSProps, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import Favourite from "../model/favourite/Favourite";
export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    value: Favourite;
    onClick?: () => void;
    onRemove?: () => void;
}
export interface IStyle {
    main: CSSProps<IProps>;
    iconPanel: CSSProps<IProps>;
    text: CSSProps<IProps>;
    removeBtn: CSSProps<IProps>;
}
interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {
}
export declare type TKUIFavouriteRowProps = IProps;
export declare type TKUIFavouriteRowStyle = IStyle;
declare const _default: (props: IClientProps) => JSX.Element;
export default _default;
