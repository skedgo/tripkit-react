/// <reference types="react" />
import Segment from "../model/trip/Segment";
import { CSSProps, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import TKUserProfile from "../model/options/TKUserProfile";
export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    value: Segment;
    actions?: JSX.Element[];
}
interface IConsumedProps {
    options: TKUserProfile;
    onTimetableForSegment: (segment?: Segment) => void;
}
interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> {
}
interface IStyle {
    main: CSSProps<IProps>;
    header: CSSProps<IProps>;
    title: CSSProps<IProps>;
    subtitle: CSSProps<IProps>;
    time: CSSProps<IProps>;
    preTime: CSSProps<IProps>;
    track: CSSProps<IProps>;
    body: CSSProps<IProps>;
    preLine: CSSProps<IProps>;
    posLine: CSSProps<IProps>;
    line: CSSProps<IProps>;
    noLine: CSSProps<IProps>;
    circle: CSSProps<IProps>;
    iconPin: CSSProps<IProps>;
    icon: CSSProps<IProps>;
    description: CSSProps<IProps>;
    action: CSSProps<IProps>;
    notes: CSSProps<IProps>;
    occupancy: CSSProps<IProps>;
    alertsSummary: CSSProps<IProps>;
}
export declare type TKUISegmentOverviewProps = IProps;
export declare type TKUISegmentOverviewStyle = IStyle;
declare const _default: (props: IClientProps) => JSX.Element;
export default _default;
