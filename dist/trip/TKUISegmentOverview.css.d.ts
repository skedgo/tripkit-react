import { TKUIStyles } from "../jss/StyleHelper";
import { TKUISegmentOverviewProps, TKUISegmentOverviewStyle } from "./TKUISegmentOverview";
import Segment from "../model/trip/Segment";
export declare const tKUISegmentOverviewDefaultStyle: TKUIStyles<TKUISegmentOverviewStyle, TKUISegmentOverviewProps>;
export declare function isIconOnDark(segment: Segment): boolean;
export declare function isUnconnected(segment: Segment): boolean;
export declare function prevWaitingSegment(segment: Segment): Segment | undefined;
