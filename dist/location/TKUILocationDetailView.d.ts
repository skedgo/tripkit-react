/// <reference types="react" />
import { CSSProps, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import Location from "../model/Location";
import { TKUISlideUpOptions } from "../card/TKUISlideUp";
export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    location: Location;
    slideUpOptions?: TKUISlideUpOptions;
}
export interface IStyle {
    main: CSSProps<IProps>;
    actionsPanel: CSSProps<IProps>;
}
interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {
    actions?: (location: Location) => (JSX.Element | undefined)[];
}
export declare type TKUILocationDetailViewProps = IProps;
export declare type TKUILocationDetailViewStyle = IStyle;
declare const _default: (props: IClientProps) => JSX.Element;
export default _default;
