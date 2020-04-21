import * as React from "react";
import BBox from "../model/BBox";
import Location from "../model/Location";
import { MapLocationType } from "../model/location/MapLocationType";
interface IProps {
    zoom: number;
    bounds: BBox;
    prefetchFactor?: number;
    enabledMapLayers: MapLocationType[];
    onClick?: (type: MapLocationType, loc: Location) => void;
    onLocAction?: (type: MapLocationType, loc: Location) => void;
    omit?: Location[];
}
declare class TKUIMapLocations extends React.Component<IProps, {}> {
    static defaultProps: Partial<IProps>;
    private readonly ZOOM_ALL_LOCATIONS;
    private readonly ZOOM_PARENT_LOCATIONS;
    private locListenerSubscription;
    constructor(props: Readonly<IProps>);
    private getLocMarker;
    render(): React.ReactNode;
    shouldComponentUpdate(nextProps: IProps): boolean;
    componentWillUnmount(): void;
}
export default TKUIMapLocations;
