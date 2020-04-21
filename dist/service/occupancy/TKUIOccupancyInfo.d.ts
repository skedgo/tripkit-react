import * as React from "react";
import { ClassNameMap } from "react-jss";
import { CSSProps } from "../../jss/StyleHelper";
import { OccupancyStatus } from "../../model/service/VehicleComponent";
export interface ITKUIOccupancyInfoProps {
    status: OccupancyStatus;
    brief?: boolean;
}
interface IProps extends ITKUIOccupancyInfoProps {
    classes: ClassNameMap<keyof ITKUIOccupancyInfoStyle>;
}
export interface ITKUIOccupancyInfoStyle {
    main: CSSProps<ITKUIOccupancyInfoProps>;
    passengers: CSSProps<ITKUIOccupancyInfoProps>;
    passengerSlot: CSSProps<ITKUIOccupancyInfoProps>;
    passenger: CSSProps<ITKUIOccupancyInfoProps>;
    text: CSSProps<ITKUIOccupancyInfoProps>;
}
export declare const Connect: (RawComponent: React.ComponentType<IProps>) => (props: ITKUIOccupancyInfoProps) => JSX.Element;
declare const _default: (props: ITKUIOccupancyInfoProps) => JSX.Element;
export default _default;
