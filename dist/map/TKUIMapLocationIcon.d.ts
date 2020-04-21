/// <reference types="react" />
import Location from "../model/Location";
import { CSSProps, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    location: Location;
    from?: boolean;
    selected?: boolean;
}
export interface IStyle {
    main: CSSProps<IProps>;
    iconPin: CSSProps<IProps>;
    icon: CSSProps<IProps>;
    clickAndHold: CSSProps<IProps>;
}
interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {
}
export declare type TKUIMapLocationIconProps = IProps;
export declare type TKUIMapLocationIconStyle = IStyle;
declare const _default: (props: IClientProps) => JSX.Element;
export default _default;
