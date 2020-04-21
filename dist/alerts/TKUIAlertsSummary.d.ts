/// <reference types="react" />
import { CSSProps, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import RealTimeAlert from "../model/service/RealTimeAlert";
import { TKUISlideUpOptions } from "../card/TKUISlideUp";
export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    alerts: RealTimeAlert[];
    slideUpOptions?: TKUISlideUpOptions;
}
interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {
}
interface IStyle {
    main: CSSProps<IProps>;
    header: CSSProps<IProps>;
    alertIcon: CSSProps<IProps>;
    numOfAlerts: CSSProps<IProps>;
    alertTitle: CSSProps<IProps>;
}
export declare type TKUIAlertsSummaryProps = IProps;
export declare type TKUIAlertsSummaryStyle = IStyle;
declare const _default: (props: IClientProps) => JSX.Element;
export default _default;
