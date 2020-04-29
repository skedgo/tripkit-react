import * as React from "react";
import BBox from "../model/BBox";
import LocationsData from "../data/LocationsData";
import Location from "../model/Location";
import {MapLocationType, mapLocationTypeToGALabel} from "../model/location/MapLocationType";
import GATracker from "../analytics/GATracker";
import StopLocation from "../model/StopLocation";
import Constants from "../util/Constants";
import {Marker, Popup} from "react-leaflet";
import L from "leaflet";
import {renderToStaticMarkup} from "react-dom/server";
import StopIcon from "./StopIcon";
import MapUtil from "../util/MapUtil";
import LocationsResult from "../model/location/LocationsResult";
import OptionsData from "../data/OptionsData";
import RegionsData from "../data/RegionsData";
import {EventSubscription} from "fbemitter";
import TKUserProfile from "../model/options/TKUserProfile";
import LocationUtil from "../util/LocationUtil";

interface IProps {
    zoom: number,
    bounds: BBox,
    prefetchFactor?: number,
    enabledMapLayers: MapLocationType[],
    onClick?: (type: MapLocationType, loc: Location) => void;
    onLocAction?: (type: MapLocationType, loc: Location) => void;
    omit?: Location[];
}

class TKUIMapLocations extends React.Component<IProps, {}> {

    public static defaultProps: Partial<IProps> = {
        prefetchFactor: 1.5
    };

    private readonly ZOOM_ALL_LOCATIONS = 16;
    private readonly ZOOM_PARENT_LOCATIONS = 11;

    private locListenerSubscription: EventSubscription;

    constructor(props: Readonly<IProps>) {
        super(props);
        this.locListenerSubscription = LocationsData.instance.addChangeListener((locResult: LocationsResult) => this.forceUpdate());
    }

    private getLocMarker(mapLocType: MapLocationType, loc: Location): React.ReactNode {
        const clickHandler = () => this.props.onClick && this.props.onClick(mapLocType, loc);
        const actionHandler = mapLocType === MapLocationType.STOP ?
            () => this.props.onLocAction && this.props.onLocAction(mapLocType, loc) : undefined;
        const key = loc.getKey();
        switch (mapLocType) {
            case MapLocationType.BIKE_POD:
                return <Marker
                    position={loc}
                    icon={L.icon({
                        iconUrl: Constants.absUrl("/images/modeicons/ic-bikeShare.svg"),
                        iconSize: [20, 20],
                        iconAnchor: [10, 10]
                    })}
                    onpopupopen={() => GATracker.event({
                        category: "map location",
                        action: "click",
                        label: mapLocationTypeToGALabel(mapLocType)
                    })}
                    key={key}
                    onclick={clickHandler}
                />;
            case MapLocationType.MY_WAY_FACILITY:
                return <Marker
                    position={loc}
                    icon={L.icon({
                        iconUrl: Constants.absUrl("/images/modeicons/ic-myway.svg"),
                        iconSize: [20, 20],
                        iconAnchor: [10, 10]
                    })}
                    onpopupopen={() => GATracker.event({
                        category: "map location",
                        action: "click",
                        label: mapLocationTypeToGALabel(mapLocType)
                    })}
                    key={key}
                    onclick={clickHandler}
                />;
            case MapLocationType.PARK_AND_RIDE_FACILITY:
                return <Marker
                    position={loc}
                    icon={L.icon({
                        iconUrl: Constants.absUrl("/images/modeicons/ic-parkAndRide.svg"),
                        iconSize: [20, 20],
                        iconAnchor: [10, 10]
                    })}
                    onpopupopen={() => GATracker.event({
                        category: "map location",
                        action: "click",
                        label: mapLocationTypeToGALabel(mapLocType)
                    })}
                    key={key}
                    onclick={clickHandler}
                />;
            case MapLocationType.STOP:
                const transIconHTML = renderToStaticMarkup(<StopIcon stop={loc as StopLocation} />);
                const icon = L.divIcon({
                    html: transIconHTML,
                    iconSize: [20, 20],
                    iconAnchor: [10, 10],
                    className: ""
                });
                return <Marker
                    position={loc}
                    icon={icon}
                    onclick={clickHandler}
                    key={key}
                />;
            default:
                return <Marker position={loc} key={key}/>;
        }
    }


    public render(): React.ReactNode {
        const region = RegionsData.instance.getRegion(this.props.bounds.getCenter());
        let locMarkers: React.ReactNode[] = [];
        const enabledMapLayers = this.props.enabledMapLayers;
        const omit = this.props.omit || [];
        if (region && enabledMapLayers.length > 0) {
            const bounds = MapUtil.expand(this.props.bounds, .5);
            const zoom = this.props.zoom;
            if (zoom >= this.ZOOM_PARENT_LOCATIONS) {
                const level1Result = LocationsData.instance.getRequestLocations(region.name, 1);
                for (const locType of enabledMapLayers) {
                    locMarkers.push(...level1Result.getByType(locType)
                        .map((loc: Location) => !omit.find((omitLoc) => LocationUtil.equal(omitLoc, loc)) && this.getLocMarker(locType, loc)));
                }
            }
            if (zoom >= this.ZOOM_ALL_LOCATIONS) {
                const level2Result = LocationsData.instance.getRequestLocations(region.name, 2, bounds);
                for (const locType of enabledMapLayers) {
                    locMarkers.push(...level2Result.getByType(locType)
                        .map((loc: Location) => !omit.includes(loc) && this.getLocMarker(locType, loc)));
                }
            }
        }
        return locMarkers;
    }

    public shouldComponentUpdate(nextProps: IProps): boolean {
        return nextProps.zoom !== this.props.zoom
            || (this.props.zoom >= this.ZOOM_PARENT_LOCATIONS && (JSON.stringify(MapUtil.cellsForBounds(nextProps.bounds, LocationsData.cellsPerDegree))
            !== JSON.stringify(MapUtil.cellsForBounds(this.props.bounds, LocationsData.cellsPerDegree))))
            || JSON.stringify(nextProps.omit) !== JSON.stringify(this.props.omit);
    }

    public componentWillUnmount() {
        if (this.locListenerSubscription) {
            this.locListenerSubscription.remove();
        }
    }

}

export default TKUIMapLocations;