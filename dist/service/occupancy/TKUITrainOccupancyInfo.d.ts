/// <reference types="react" />
import { CSSProps, TKUIWithClasses, TKUIWithStyle } from "../../jss/StyleHelper";
import VehicleComponent from "../../model/service/VehicleComponent";
interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    components: VehicleComponent[][];
}
interface IStyle {
    icon: CSSProps<IProps>;
    empty: CSSProps<IProps>;
    manySeatsAvailable: CSSProps<IProps>;
    fewSeatsAvailable: CSSProps<IProps>;
    standingRoomOnly: CSSProps<IProps>;
    crushedStandingRoomOnly: CSSProps<IProps>;
    full: CSSProps<IProps>;
    notAcceptingPassengers: CSSProps<IProps>;
}
interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {
}
export declare type TKUITrainOccupancyInfoProps = IProps;
export declare type TKUITrainOccupancyInfoStyle = IStyle;
declare const _default: (props: IClientProps) => JSX.Element;
export default _default;
