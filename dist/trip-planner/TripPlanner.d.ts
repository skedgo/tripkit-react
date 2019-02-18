import * as React from "react";
import './TripPlanner.css';
import '../css/act-app.css';
import LatLng from "../model/LatLng";
import RoutingQuery from "../model/RoutingQuery";
import BBox from "../model/BBox";
import Trip from "../model/trip/Trip";
import Region from "../model/region/Region";
import ITripPlannerProps from "./ITripPlannerProps";
import Location from "../model/Location";
interface IState {
    tripsSorted: Trip[] | null;
    selected?: Trip;
    mapView: boolean;
    showOptions: boolean;
    region?: Region;
    preFrom?: Location;
    preTo?: Location;
    queryTimePanelOpen: boolean;
    feedbackTooltip: boolean;
    viewport: {
        center?: LatLng;
        zoom?: number;
    };
    mapBounds?: BBox;
}
declare class TripPlanner extends React.Component<ITripPlannerProps, IState> {
    private eventBus;
    private ref;
    private mapRef;
    private geocodingData;
    constructor(props: ITripPlannerProps);
    onQueryChange(query: RoutingQuery): void;
    private onFavClicked;
    private onOptionsChange;
    private onShowOptions;
    private onMapLocChanged;
    private checkFitLocation;
    private fitMap;
    private onSelected;
    render(): React.ReactNode;
    private onModalRequestedClose;
    private getFeedback;
    componentDidMount(): void;
    componentDidUpdate(prevProps: Readonly<ITripPlannerProps>, prevState: Readonly<IState>, snapshot?: any): void;
}
export default TripPlanner;
