/// <reference types="react" />
import { CSSProps, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import RealTimeAlert from "../model/service/RealTimeAlert";
import { TKUICardClientProps } from "../card/TKUICard";
import { TKUISlideUpOptions } from "../card/TKUISlideUp";
export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    alerts: RealTimeAlert[];
    slideUpOptions?: TKUISlideUpOptions;
    onRequestClose?: () => void;
}
interface IConsumedProps {
    renderCard: (props: TKUICardClientProps, id: any) => void;
}
interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> {
}
interface IStyle {
    main: CSSProps<IProps>;
    alert: CSSProps<IProps>;
    content: CSSProps<IProps>;
    alertIcon: CSSProps<IProps>;
    title: CSSProps<IProps>;
    text: CSSProps<IProps>;
}
export declare type TKUIAlertsViewProps = IProps;
export declare type TKUIAlertsViewStyle = IStyle;
declare const _default: (props: IClientProps) => JSX.Element;
export default _default;
