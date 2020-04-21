/// <reference types="react" />
import Segment from "../model/trip/Segment";
import { CSSProps, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    segment: Segment;
    brief?: boolean;
    info?: boolean;
}
interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {
}
interface IStyle {
    main: CSSProps<IProps>;
    compositeIcon: CSSProps<IProps>;
    icon: CSSProps<IProps>;
    alertIcon: CSSProps<IProps>;
    info: CSSProps<IProps>;
    subtitle: CSSProps<IProps>;
}
export declare type TKUITrackTransportProps = IProps;
export declare type TKUITrackTransportStyle = IStyle;
declare const _default: (props: IClientProps) => JSX.Element;
export default _default;
