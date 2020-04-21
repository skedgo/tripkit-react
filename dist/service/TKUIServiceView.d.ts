/// <reference types="react" />
import ServiceDeparture from "../model/service/ServiceDeparture";
import { EventEmitter } from "fbemitter";
import { CSSProps, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { TKUISlideUpOptions } from "../card/TKUISlideUp";
import TKUserProfile from "../model/options/TKUserProfile";
interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    onRequestClose?: () => void;
    slideUpOptions?: TKUISlideUpOptions;
}
interface IStyle {
    main: CSSProps<IProps>;
    serviceOverview: CSSProps<IProps>;
    pastStop: CSSProps<IProps>;
    currStop: CSSProps<IProps>;
    currStopMarker: CSSProps<IProps>;
    realtimePanel: CSSProps<IProps>;
    iconAngleDown: CSSProps<IProps>;
    realtimeInfo: CSSProps<IProps>;
    realtimeInfoDetailed: CSSProps<IProps>;
    actionsPanel: CSSProps<IProps>;
    alertsSummary: CSSProps<IProps>;
    alertsBrief: CSSProps<IProps>;
}
interface IConsumedProps {
    title: string;
    departure: ServiceDeparture;
    eventBus?: EventEmitter;
    options: TKUserProfile;
}
interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> {
    actions?: (service: ServiceDeparture) => JSX.Element[];
}
export declare type TKUIServiceViewProps = IProps;
export declare type TKUIServiceViewStyle = IStyle;
export declare const STOP_CLICKED_EVENT = "stopClicked";
declare const _default: (props: IClientProps) => JSX.Element;
export default _default;
