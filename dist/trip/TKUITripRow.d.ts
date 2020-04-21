/// <reference types="react" />
import TripGroup from "../model/trip/TripGroup";
import Trip from "../model/trip/Trip";
import { EventEmitter } from "fbemitter";
import { CSSProps, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { Badges } from "./TKMetricClassifier";
interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    value: Trip;
    selected?: boolean;
    className?: string;
    brief?: boolean;
    onClick?: () => void;
    onFocus?: () => void;
    onAlternativeClick?: (group: TripGroup, alt: Trip) => void;
    onDetailClick?: () => void;
    onKeyDown?: (e: any) => void;
    eventBus?: EventEmitter;
    reference?: (ref: any) => void;
    badge?: Badges;
    visibleAlternatives?: number;
    expanded?: boolean;
    onExpand?: (expand: boolean) => void;
}
interface IStyle {
    main: CSSProps<IProps>;
    badge: CSSProps<IProps>;
    info: CSSProps<IProps>;
    trackAndAction: CSSProps<IProps>;
    track: CSSProps<IProps>;
    footer: CSSProps<IProps>;
    alternative: CSSProps<IProps>;
    pastAlternative: CSSProps<IProps>;
    selectedAlternative: CSSProps<IProps>;
}
interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {
}
export declare type TKUITripRowProps = IProps;
export declare type TKUITripRowStyle = IStyle;
export declare function badgeColor(badge: Badges): string;
declare const _default: (props: IClientProps) => JSX.Element;
export default _default;
