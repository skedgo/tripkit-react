/// <reference types="react" />
import Trip from "../model/trip/Trip";
import TripGroup from "../model/trip/TripGroup";
import { CSSProps, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { TripSort } from "../api/WithRoutingResults";
import RoutingQuery from "../model/RoutingQuery";
import Region from "../model/region/Region";
import { TKUISlideUpOptions } from "../card/TKUISlideUp";
import { TKUIViewportUtilProps } from "../util/TKUIResponsiveUtil";
interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    onChange?: (value: Trip) => void;
    onDetailsClicked?: () => void;
    className?: string;
    onShowOptions?: () => void;
    slideUpOptions?: TKUISlideUpOptions;
}
interface IConsumedProps extends TKUIViewportUtilProps {
    values: Trip[];
    value?: Trip;
    onChange?: (value: Trip) => void;
    waiting?: boolean;
    onAlternativeChange?: (group: TripGroup, alt: Trip) => void;
    query: RoutingQuery;
    sort: TripSort;
    onSortChange: (sort: TripSort) => void;
    onQueryUpdate: (update: Partial<RoutingQuery>) => void;
    region?: Region;
}
export interface IStyle {
    main: CSSProps<IProps>;
    row: CSSProps<IProps>;
    iconLoading: CSSProps<IProps>;
    sortBar: CSSProps<IProps>;
    sortSelect: CSSProps<IProps>;
    sortSelectControl: CSSProps<IProps>;
    transportsBtn: CSSProps<IProps>;
    footer: CSSProps<IProps>;
    timePrefSelect: CSSProps<IProps>;
    noResults: CSSProps<IProps>;
}
interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> {
}
export declare type TKUIResultsViewProps = IProps;
export declare type TKUIResultsViewStyle = IStyle;
declare const _default: (props: IClientProps) => JSX.Element;
export default _default;
