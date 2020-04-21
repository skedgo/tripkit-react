import * as React from "react";
import Segment from "../model/trip/Segment";
import ServiceDeparture from "../model/service/ServiceDeparture";
import { CSSProps, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    icon: string;
    label: string;
    rotation?: number;
    firstSegment?: boolean;
    arriveSegment?: boolean;
}
interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {
}
interface IStyle {
    main: CSSProps<IProps>;
    pin: CSSProps<IProps>;
    transport: CSSProps<IProps>;
    timeLabel: CSSProps<IProps>;
    base: CSSProps<IProps>;
    firstSegment: CSSProps<IProps>;
    arriveSegment: CSSProps<IProps>;
}
export declare type TKUITransportPinProps = IProps;
export declare type TKUITransportPinStyle = IStyle;
declare class TKUITransportPin extends React.Component<IProps, {}> {
    static createForSegment(segment: Segment): JSX.Element;
    static createForService(serviceDeparture: ServiceDeparture): JSX.Element;
    render(): React.ReactNode;
}
export { TKUITransportPin };
