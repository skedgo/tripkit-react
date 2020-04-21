/// <reference types="react" />
import ServiceDeparture from "../model/service/ServiceDeparture";
import { CSSProps, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import TKUserProfile from "../model/options/TKUserProfile";
interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    value: ServiceDeparture;
    detailed?: boolean;
    onClick?: () => void;
    selected?: boolean;
    renderRight?: () => JSX.Element;
}
interface IConsumedProps {
    options: TKUserProfile;
}
interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> {
}
interface IStyle {
    main: CSSProps<IProps>;
    row: CSSProps<IProps>;
    rowSelected: CSSProps<IProps>;
    clickable: CSSProps<IProps>;
    leftPanel: CSSProps<IProps>;
    header: CSSProps<IProps>;
    timeAndOccupancy: CSSProps<IProps>;
    serviceNumber: CSSProps<IProps>;
    transIcon: CSSProps<IProps>;
    time: CSSProps<IProps>;
    cancelled: CSSProps<IProps>;
    delayed: CSSProps<IProps>;
    onTime: CSSProps<IProps>;
    separatorDot: CSSProps<IProps>;
    timeToDepart: CSSProps<IProps>;
    timeToDepartCancelled: CSSProps<IProps>;
    timeToDepartPast: CSSProps<IProps>;
    serviceDescription: CSSProps<IProps>;
    occupancy: CSSProps<IProps>;
    trainOccupancy: CSSProps<IProps>;
    alertIcon: CSSProps<IProps>;
}
export declare type TKUIServiceDepartureRowProps = IProps;
export declare type TKUIServiceDepartureRowStyle = IStyle;
export declare function getRealtimeDiffInMinutes(departure: ServiceDeparture): number;
declare const _default: (props: IClientProps) => JSX.Element;
export default _default;
