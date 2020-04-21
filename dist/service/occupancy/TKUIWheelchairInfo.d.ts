import * as React from "react";
import { ClassNameMap } from "react-jss";
import { CSSProps } from "../../jss/StyleHelper";
export interface ITKUIWheelchairInfoProps {
    accessible?: boolean;
    brief?: boolean;
}
interface IProps extends ITKUIWheelchairInfoProps {
    classes: ClassNameMap<keyof ITKUIWheelchairInfoStyle>;
}
export interface ITKUIWheelchairInfoStyle {
    main: CSSProps<ITKUIWheelchairInfoProps>;
    icon: CSSProps<ITKUIWheelchairInfoProps>;
    text: CSSProps<ITKUIWheelchairInfoProps>;
}
export declare const Connect: (RawComponent: React.ComponentType<IProps>) => (props: ITKUIWheelchairInfoProps) => JSX.Element;
declare const _default: (props: ITKUIWheelchairInfoProps) => JSX.Element;
export default _default;
