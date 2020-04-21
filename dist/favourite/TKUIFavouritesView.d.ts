/// <reference types="react" />
import { CSSProps, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import Favourite from "../model/favourite/Favourite";
import { TKUISlideUpOptions } from "../card/TKUISlideUp";
export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    title?: string;
    filter?: (favouriteList: Favourite[], recentList: Favourite[]) => Favourite[];
    onFavouriteClicked?: (item: Favourite) => void;
    onRequestClose?: () => void;
    slideUpOptions?: TKUISlideUpOptions;
}
interface IConsumedProps {
    favouriteList: Favourite[];
    recentList: Favourite[];
    onRemoveFavourite: (value: Favourite) => void;
}
export interface IStyle {
    main: CSSProps<IProps>;
    subHeader: CSSProps<IProps>;
    editBtn: CSSProps<IProps>;
}
interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> {
}
export declare type TKUIFavouritesViewProps = IProps;
export declare type TKUIFavouritesViewStyle = IStyle;
declare const _default: (props: IClientProps) => JSX.Element;
export default _default;
