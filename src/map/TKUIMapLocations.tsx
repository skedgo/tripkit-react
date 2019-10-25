import * as React from "react";
import BBox from "../model/BBox";
import LocationsData from "../data/LocationsData";
import Location from "../model/Location";
import {MapLocationType, mapLocationTypeToGALabel} from "../model/location/MapLocationType";
import GATracker from "../analytics/GATracker";
import StopLocation from "../model/StopLocation";
import Constants from "../util/Constants";
import MapLocationPopup from "./MapLocationPopup";
import {Marker, Popup} from "react-leaflet";
import L from "leaflet";
import {renderToStaticMarkup} from "react-dom/server";
import StopIcon from "./StopIcon";
import MapUtil from "../util/MapUtil";
import LocationsResult from "../model/location/LocationsResult";
import OptionsData from "../data/OptionsData";
import Options from "../model/Options";
import RegionsData from "../data/RegionsData";

interface IProps {
    zoom: number,
    bounds: BBox,
    prefetchFactor?: number,
    enabledMapLayers: MapLocationType[],
    onLocAction?: (type: MapLocationType, loc: Location) => void;
}

class TKUIMapLocations extends React.Component<IProps, {}> {

    public static defaultProps: Partial<IProps> = {
        prefetchFactor: 1.5
    };

    private readonly ZOOM_ALL_LOCATIONS = 15;
    private readonly ZOOM_PARENT_LOCATIONS = 11;

    constructor(props: Readonly<IProps>) {
        super(props);
        LocationsData.instance.addChangeListener((locResult: LocationsResult) => this.forceUpdate());
        OptionsData.instance.addChangeListener((update: Options, prev: Options) => {
            // TODO: receive Options through prop so don't need to force update.
            if (update.mapLayers !== prev.mapLayers) {
                this.forceUpdate()
            }
        });
    }

    private getLocMarker(mapLocType: MapLocationType, loc: Location): React.ReactNode {
        const actionHandler = mapLocType === MapLocationType.STOP ?
            () => this.props.onLocAction && this.props.onLocAction(mapLocType, loc) : undefined;
        const popup = <Popup
            offset={[0, 0]}
            closeButton={false}
            className="LeafletMap-mapLocPopup"
            // TODO: disabled auto pan to fit popup on open since it messes with viewport. Fix it.
            autoPan={false}
        >
            <MapLocationPopup value={loc} onAction={actionHandler}/>
        </Popup>;
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
                    onpopupopen={() => GATracker.instance.send('map location', 'click', mapLocationTypeToGALabel(mapLocType))}
                    key={key}
                >
                    {popup}
                </Marker>;
            case MapLocationType.MY_WAY_FACILITY:
                return <Marker
                    position={loc}
                    icon={L.icon({
                        iconUrl: Constants.absUrl("/images/modeicons/ic-myway.svg"),
                        iconSize: [20, 20],
                        iconAnchor: [10, 10]
                    })}
                    onpopupopen={() => GATracker.instance.send('map location', 'click', mapLocationTypeToGALabel(mapLocType))}
                    key={key}
                >
                    {popup}
                </Marker>;
            case MapLocationType.PARK_AND_RIDE_FACILITY:
                return <Marker
                    position={loc}
                    icon={L.icon({
                        iconUrl: Constants.absUrl("/images/modeicons/ic-parkAndRide.svg"),
                        iconSize: [20, 20],
                        iconAnchor: [10, 10]
                    })}
                    onpopupopen={() => GATracker.instance.send('map location', 'click', mapLocationTypeToGALabel(mapLocType))}
                    key={key}
                >
                    {popup}
                </Marker>;
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
                    // onclick={() => this.props.onClick && this.props.onClick(loc)}
                    key={key}
                >
                    {popup}
                </Marker>;
            default:
                return <Marker position={loc} key={key}/>;
        }
    }


    public render(): React.ReactNode {
        const region = RegionsData.instance.getRegion(this.props.bounds.getCenter());
        let locMarkers: React.ReactNode[] = [];
        const enabledMapLayers = this.props.enabledMapLayers;
        if (region && enabledMapLayers.length > 0) {
            const bounds = MapUtil.expand(this.props.bounds, .5);
            const zoom = this.props.zoom;
            if (zoom >= this.ZOOM_PARENT_LOCATIONS) {
                const level1Result = LocationsData.instance.getRequestLocations(region.name, 1);
                for (const locType of enabledMapLayers) {
                    locMarkers.push(...level1Result.getByType(locType)
                        .map((loc: Location) => this.getLocMarker(locType, loc)));
                }
            }
            if (zoom >= this.ZOOM_ALL_LOCATIONS) {
                const level2Result = LocationsData.instance.getRequestLocations(region.name, 2, bounds);
                for (const locType of enabledMapLayers) {
                    locMarkers.push(...level2Result.getByType(locType)
                        .map((loc: Location) => this.getLocMarker(locType, loc)));
                }
            }
        }
        return locMarkers;
    }

    public shouldComponentUpdate(nextProps: IProps): boolean {
        return nextProps.zoom !== this.props.zoom
            || (JSON.stringify(MapUtil.cellsForBounds(nextProps.bounds, LocationsData.cellsPerDegree))
            !== JSON.stringify(MapUtil.cellsForBounds(this.props.bounds, LocationsData.cellsPerDegree)));
    }

}

export default TKUIMapLocations;