/// <reference types="react" />
import { CSSProps, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import Region from "../model/region/Region";
import { TKUIViewportUtilProps } from "../util/TKUIResponsiveUtil";
import RegionInfo from "../model/region/RegionInfo";
import TKUserProfile from "../model/options/TKUserProfile";
import { TKUISlideUpOptions } from "../card/TKUISlideUp";
export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    onRequestClose?: () => void;
    value: TKUserProfile;
    onChange: (value: TKUserProfile) => void;
    slideUpOptions?: TKUISlideUpOptions;
}
interface IConsumedProps extends TKUIViewportUtilProps {
    region?: Region;
    regionInfo?: RegionInfo;
}
interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> {
}
interface IStyle {
    main: CSSProps<IProps>;
}
export declare type TKUITransportOptionsViewProps = IProps;
export declare type TKUITransportOptionsViewStyle = IStyle;
declare const _default: (props: IClientProps) => JSX.Element;
export default _default;
