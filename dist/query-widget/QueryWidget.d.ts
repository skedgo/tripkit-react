import * as React from 'react';
import './QueryWidget.css';
import '../css/global.css';
import '../css/device.css';
import 'react-tabs/style/react-tabs.css';
import RoutingQuery from "../model/RoutingQuery";
import LatLng from "../model/LatLng";
import BBox from "../model/BBox";
interface IProps {
    plannerUrl?: string;
}
interface IState {
    selectedTab: TabView;
    routingQuery: RoutingQuery;
    showOptions: boolean;
    queryInputBounds?: BBox;
    queryInputFocusLatLng?: LatLng;
}
declare enum TabView {
    PLANNER = "PLANNER",
    FAVOURITES = "FAVOURITES"
}
declare class QueryWidget extends React.Component<IProps, IState> {
    constructor(props: IProps);
    private onTabClicked;
    /**
     * Not triggered by QueryInput if not complete.
     */
    private onGoClicked;
    private onFavClicked;
    private onShowOptions;
    private onOptionsChange;
    componentDidMount(): void;
    private onModalRequestedClose;
    render(): JSX.Element;
}
export default QueryWidget;
