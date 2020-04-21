/// <reference types="react" />
import '../css/app.css';
import LatLng from "../model/LatLng";
import { IServiceResultsContext } from "../service/ServiceResultsProvider";
import { IRoutingResultsContext } from "./RoutingResultsProvider";
import { CSSProps, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { TKUIViewportUtilProps } from "../util/TKUIResponsiveUtil";
import TKUserProfile from "../model/options/TKUserProfile";
interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
}
interface IConsumedProps extends IRoutingResultsContext, IServiceResultsContext, TKUIViewportUtilProps {
    userProfile: TKUserProfile;
    onUserProfileChange: (update: TKUserProfile) => void;
    userLocationPromise?: Promise<LatLng>;
}
export interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> {
}
export interface IStyle {
    main: CSSProps<IProps>;
    queryPanel: CSSProps<IProps>;
    mapMain: CSSProps<IProps>;
    reportBtn: CSSProps<IProps>;
    reportBtnLandscape: CSSProps<IProps>;
    reportBtnPortrait: CSSProps<IProps>;
}
export declare type TKUITKUITripPlannerProps = IProps;
export declare type TKUITKUITripPlannerStyle = IStyle;
declare const _default: (props: IClientProps) => JSX.Element;
export default _default;
