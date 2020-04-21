/// <reference types="react" />
import Region from "../model/region/Region";
import { IOptionsContext } from "./OptionsProvider";
import { CSSProps, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { TKUIViewportUtilProps } from "../util/TKUIResponsiveUtil";
import { TKUISlideUpOptions } from "../card/TKUISlideUp";
export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    onRequestClose?: () => void;
    slideUpOptions?: TKUISlideUpOptions;
}
interface IConsumedProps extends IOptionsContext, TKUIViewportUtilProps {
    region?: Region;
}
export interface IStyle {
    main: CSSProps<IProps>;
    scrollPanel: CSSProps<IProps>;
    section: CSSProps<IProps>;
    sectionTitle: CSSProps<IProps>;
    sectionBody: CSSProps<IProps>;
    optionRow: CSSProps<IProps>;
    optionLink: CSSProps<IProps>;
    specialServices: CSSProps<IProps>;
    icon: CSSProps<IProps>;
    infoIcon: CSSProps<IProps>;
    tooltip: CSSProps<IProps>;
    tooltipOverlay: CSSProps<IProps>;
    checkboxGroup: CSSProps<IProps>;
    closeBtn: CSSProps<IProps>;
}
interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> {
}
export declare type TKUIProfileViewProps = IProps;
export declare type TKUIProfileViewStyle = IStyle;
declare const _default: (props: IClientProps) => JSX.Element;
export default _default;
