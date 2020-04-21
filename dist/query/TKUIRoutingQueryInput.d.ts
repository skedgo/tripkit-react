import * as React from "react";
import Location from "../model/Location";
import BBox from "../model/BBox";
import LatLng from "../model/LatLng";
import 'react-datepicker/dist/react-datepicker.css';
import RoutingQuery from "../model/RoutingQuery";
import 'rc-tooltip/assets/bootstrap_white.css';
import MultiGeocoderOptions from "../geocode/MultiGeocoderOptions";
import { CSSProps, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import Region from "model/region/Region";
import { TKUIViewportUtilProps } from "../util/TKUIResponsiveUtil";
import { TranslationFunction } from "../i18n/TKI18nProvider";
interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    title?: string;
    showTransportsBtn?: boolean;
    onShowTransportOptions?: () => void;
    isTripPlanner?: boolean;
    resolveCurrLocInFrom?: boolean;
    collapsable?: boolean;
    geocoderOptions?: MultiGeocoderOptions;
    onClearClicked?: () => void;
}
interface IConsumedProps extends TKUIViewportUtilProps {
    value: RoutingQuery;
    onChange?: (routingQuery: RoutingQuery) => void;
    onPreChange?: (from: boolean, location?: Location) => void;
    onInputTextChange?: (from: boolean, text: string) => void;
    bounds?: BBox;
    focusLatLng?: LatLng;
    region?: Region;
}
interface IProps extends IConsumedProps, IClientProps, TKUIWithClasses<IStyle, IProps> {
}
interface IStyle {
    main: CSSProps<IProps>;
    header: CSSProps<IProps>;
    title: CSSProps<IProps>;
    btnClear: CSSProps<IProps>;
    iconClear: CSSProps<IProps>;
    btnBack: CSSProps<IProps>;
    fromToPanel: CSSProps<IProps>;
    fromToInputsPanel: CSSProps<IProps>;
    locSelector: CSSProps<IProps>;
    locIcon: CSSProps<IProps>;
    locTarget: CSSProps<IProps>;
    dotIcon: CSSProps<IProps>;
    divider: CSSProps<IProps>;
    swap: CSSProps<IProps>;
    footer: CSSProps<IProps>;
    transportsBtn: CSSProps<IProps>;
    timePrefSelect: CSSProps<IProps>;
}
export declare type TKUIRoutingQueryInputProps = IProps;
export declare type TKUIRoutingQueryInputStyle = IStyle;
interface IState {
    timePanelOpen: boolean;
    fromTooltip: boolean;
    toTooltip: boolean;
    fromTooltipText?: string;
    toTooltipText?: string;
    showTransportSwitches: boolean;
}
declare class TKUIRoutingQueryInput extends React.Component<IProps, IState> {
    private geocodingDataFrom;
    private geocodingDataTo;
    private fromLocRef;
    private toLocRef;
    private fromTooltipRef;
    private toTooltipRef;
    constructor(props: IProps);
    private onPrefChange;
    private onSwapClicked;
    private updateQuery;
    private setQuery;
    private showTooltip;
    private static timePrefString;
    static getTimePrefOptions(t: TranslationFunction): any[];
    render(): React.ReactNode;
    private getErrorMessage;
    componentDidUpdate(prevProps: Readonly<IProps>): void;
}
declare const _default: (props: IClientProps) => JSX.Element;
export default _default;
export { TKUIRoutingQueryInput as TKUIRoutingQueryInputClass };
