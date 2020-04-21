/// <reference types="react" />
import { CSSProps, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import MultiGeocoderOptions from "../geocode/MultiGeocoderOptions";
import Location from "../model/Location";
import BBox from "../model/BBox";
import LatLng from "../model/LatLng";
import { TKUIViewportUtilProps } from "../util/TKUIResponsiveUtil";
interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    onShowSideBar?: () => void;
    geocoderOptions?: MultiGeocoderOptions;
    onDirectionsClicked?: () => void;
}
interface IConsumedProps extends TKUIViewportUtilProps {
    value: Location | null;
    onChange?: (value: Location | null) => void;
    onPreChange?: (location?: Location) => void;
    onInputTextChange?: (text: string) => void;
    bounds?: BBox;
    focusLatLng?: LatLng;
}
interface IProps extends IConsumedProps, IClientProps, TKUIWithClasses<IStyle, IProps> {
}
interface IStyle {
    main: CSSProps<IProps>;
    sideBarBtn: CSSProps<IProps>;
    sideBarIcon: CSSProps<IProps>;
    locationBox: CSSProps<IProps>;
    locationBoxInput: CSSProps<IProps>;
    resultsMenu: CSSProps<IProps>;
    glassIcon: CSSProps<IProps>;
    divider: CSSProps<IProps>;
    directionsBtn: CSSProps<IProps>;
    directionsIcon: CSSProps<IProps>;
}
export declare type TKUILocationSearchProps = IProps;
export declare type TKUILocationSearchStyle = IStyle;
declare const _default: (props: IClientProps) => JSX.Element;
export default _default;
