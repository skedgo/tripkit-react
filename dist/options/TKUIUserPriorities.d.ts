/// <reference types="react" />
import { CSSProps, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import TKWeightingPreferences from "../model/options/TKWeightingPreferences";
import { TKUIViewportUtilProps } from "../util/TKUIResponsiveUtil";
import { TKUISlideUpOptions } from "../card/TKUISlideUp";
export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    value: TKWeightingPreferences;
    onChange: (update: TKWeightingPreferences) => void;
    onRequestClose?: () => void;
    slideUpOptions?: TKUISlideUpOptions;
}
export interface IConsumedProps extends TKUIViewportUtilProps {
}
export interface IStyle {
    main: CSSProps<IProps>;
    resetBtn: CSSProps<IProps>;
}
interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> {
}
export declare type TKUIUserPrioritiesProps = IProps;
export declare type TKUIUserPrioritiesStyle = IStyle;
declare const _default: (props: IClientProps) => JSX.Element;
export default _default;
