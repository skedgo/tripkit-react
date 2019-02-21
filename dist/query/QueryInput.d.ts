import * as React from "react";
import "./QueryInput.css";
import Location from "../model/Location";
import BBox from "../model/BBox";
import LatLng from "../model/LatLng";
import 'react-datepicker/dist/react-datepicker.css';
import RoutingQuery from "../model/RoutingQuery";
import 'rc-tooltip/assets/bootstrap_white.css';
import { ReactElement } from "react";
import MultiGeocoderOptions from "../location_box/MultiGeocoderOptions";
interface IProps {
    value?: RoutingQuery;
    onChange?: (routingQuery: RoutingQuery) => void;
    onPreChange?: (from: boolean, location?: Location) => void;
    onGoClicked?: (routingQuery: RoutingQuery) => void;
    bounds?: BBox;
    focusLatLng?: LatLng;
    className?: string;
    isTripPlanner?: boolean;
    bottomRightComponent?: ReactElement<any>;
    bottomLeftComponent?: ReactElement<any>;
    collapsable?: boolean;
    onTimePanelOpen?: (open: boolean) => void;
    geocoderOptions?: MultiGeocoderOptions;
}
interface IState {
    routingQuery: RoutingQuery;
    preselFrom: Location | null;
    preselTo: Location | null;
    timePanelOpen: boolean;
    fromTooltip: boolean;
    toTooltip: boolean;
    collapsed: boolean;
}
declare class QueryInput extends React.Component<IProps, IState> {
    private geocodingData;
    private dateTimePickerRef;
    private fromLocRef;
    private toLocRef;
    private goBtnRef;
    constructor(props: IProps);
    private getTimeBtnText;
    private onPrefClicked;
    private onSwapClicked;
    private updateQuery;
    private setQuery;
    private showTooltip;
    componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<IState>, snapshot?: any): void;
    render(): React.ReactNode;
}
export default QueryInput;
