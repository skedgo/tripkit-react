/// <reference types="react" />
import { CSSProps, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { TKUIViewportUtilProps } from "../util/TKUIResponsiveUtil";
import TKUserProfile from "../model/options/TKUserProfile";
import { TKUISlideUpOptions } from "../card/TKUISlideUp";
export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    value: TKUserProfile;
    onChange: (value: TKUserProfile) => void;
    onShowTransportOptions: () => void;
    onRequestClose?: () => void;
    slideUpOptions?: TKUISlideUpOptions;
}
interface IConsumedProps extends TKUIViewportUtilProps {
}
export interface IStyle {
    main: CSSProps<IProps>;
    section: CSSProps<IProps>;
    sectionTitle: CSSProps<IProps>;
    sectionBody: CSSProps<IProps>;
    sectionFooter: CSSProps<IProps>;
    optionRow: CSSProps<IProps>;
    optionTitle: CSSProps<IProps>;
    optionDescription: CSSProps<IProps>;
    optionLink: CSSProps<IProps>;
    checkboxRow: CSSProps<IProps>;
}
interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> {
}
export declare type TKUIPrivacyOptionsViewProps = IProps;
export declare type TKUIPrivacyOptionsViewStyle = IStyle;
declare const _default: (props: IClientProps) => JSX.Element;
export default _default;
