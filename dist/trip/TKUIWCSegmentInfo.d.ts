/// <reference types="react" />
import Segment from "../model/trip/Segment";
import { CSSProps, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    value: Segment;
}
interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {
}
export interface IStyle {
    main: CSSProps<IProps>;
    references: CSSProps<IProps>;
    safeRef: CSSProps<IProps>;
    unsafeRef: CSSProps<IProps>;
    dismountRef: CSSProps<IProps>;
    unknownRef: CSSProps<IProps>;
    bar: CSSProps<IProps>;
    safeBar: CSSProps<IProps>;
    unsafeBar: CSSProps<IProps>;
    dismountBar: CSSProps<IProps>;
    mtsLabels: CSSProps<IProps>;
    safeMtsLabel: CSSProps<IProps>;
    unsafeMtsLabel: CSSProps<IProps>;
    dismountMtsLabel: CSSProps<IProps>;
    unknownMtsLabel: CSSProps<IProps>;
}
export declare type TKUIWCSegmentInfoProps = IProps;
export declare type TKUIWCSegmentInfoStyle = IStyle;
declare const _default: (props: IClientProps) => JSX.Element;
export default _default;
