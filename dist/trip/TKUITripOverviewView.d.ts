/// <reference types="react" />
import Trip from "../model/trip/Trip";
import Segment from "../model/trip/Segment";
import { CardPresentation } from "../card/TKUICard";
import { CSSProps, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { TKUISlideUpOptions } from "../card/TKUISlideUp";
export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    value: Trip;
    onRequestClose?: () => void;
    handleRef?: (ref: any) => void;
    slideUpOptions?: TKUISlideUpOptions;
    cardPresentation?: CardPresentation;
}
export interface IStyle {
    main: CSSProps<IProps>;
    actionsPanel: CSSProps<IProps>;
}
interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {
    actions?: (trip: Trip) => JSX.Element[];
    segmentActions?: (segment: Segment) => JSX.Element[];
}
export declare type TKUITripOverviewViewProps = IProps;
export declare type TKUITripOverviewViewStyle = IStyle;
declare const _default: (props: IClientProps) => JSX.Element;
export default _default;
