/// <reference types="react" />
import { CSSProps, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import RealTimeVehicle from "../model/service/RealTimeVehicle";
import Color from "../model/trip/Color";
export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    value: RealTimeVehicle;
    label?: string;
    color?: Color;
}
export interface IStyle {
    main: CSSProps<IProps>;
    vehicleBackground: CSSProps<IProps>;
    bodyBackground: CSSProps<IProps>;
    frontBackground: CSSProps<IProps>;
    vehicle: CSSProps<IProps>;
    body: CSSProps<IProps>;
    front: CSSProps<IProps>;
    label: CSSProps<IProps>;
}
interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {
}
export declare type TKUIRealtimeVehicleProps = IProps;
export declare type TKUIRealtimeVehicleStyle = IStyle;
declare const _default: (props: IClientProps) => JSX.Element;
export default _default;
