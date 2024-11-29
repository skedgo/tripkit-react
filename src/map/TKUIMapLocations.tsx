import React, { useContext, useEffect, useMemo } from "react";
import BBox from "../model/BBox";
import LocationsData from "../data/LocationsData";
import Location from "../model/Location";
import { Marker } from "react-leaflet";
import L from "leaflet";
import TKUIModeLocationIcon from "./TKUIModeLocationIcon";
import MapUtil from "../util/MapUtil";
import LocationsResult from "../model/location/LocationsResult";
import RegionsData from "../data/RegionsData";
import { EventSubscription } from "fbemitter";
import LocationUtil from "../util/LocationUtil";
import TKTransportOptions from "../model/options/TKTransportOptions";
import { renderToStaticMarkup } from "../jss/StyleHelper";
import ModeLocation from "../model/location/ModeLocation";
import TKUIConfigProvider, { TKUIConfigContext } from "../config/TKUIConfigProvider";
import TransportUtil from "../trip/TransportUtil";
import NetworkUtil from "../util/NetworkUtil";

interface TKUIModeLocationMarkerProps {
    loc: ModeLocation;
    onClick?: () => void;
    isDarkMode?: boolean;
}

export const TKUIModeLocationMarker: React.FunctionComponent<TKUIModeLocationMarkerProps> =
    ({ loc, onClick, isDarkMode }) => {
        const [imgHtml, setImgHtml] = React.useState<string>("");
        useEffect(() => {
            if (loc.modeInfo.remoteIconIsTemplate && TransportUtil.getTransportIconRemote(loc.modeInfo)) {
                NetworkUtil.fetch(TransportUtil.getTransportIconRemote(loc.modeInfo)!, {}, true)
                    .then((data) => setImgHtml(data))
                    .catch((error) => console.error('Error fetching SVG:', error));
            }
        }, [loc, isDarkMode]);
        const config = useContext(TKUIConfigContext);
        const key = loc.getKey();
        const icon = useMemo(() => {
            const transIconHTML = renderToStaticMarkup(
                <TKUIConfigProvider config={config}>
                    <TKUIModeLocationIcon location={loc} isDarkMode={isDarkMode} imgHtml={imgHtml} />
                </TKUIConfigProvider>
            );
            return L.divIcon({
                html: transIconHTML,
                iconSize: [20, 20],
                iconAnchor: [10, 10],
                className: ""
            });
        }, [loc, isDarkMode, imgHtml]);
        return (
            <Marker
                position={loc}
                icon={icon}
                onclick={onClick}
                key={key}
                keyboard={false}
            />
        );
    }
interface IProps {
    zoom: number,
    bounds: BBox,
    prefetchFactor?: number,
    onClick?: (loc: Location) => void;
    omit?: Location[];
    isDarkMode?: boolean;
    transportOptions?: TKTransportOptions;
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

    private enabledModes(props: IProps = this.props): string[] {
        const region = RegionsData.instance.getRegion(props.bounds.getCenter());
        if (!region) {
            return [];
        }
        const modes = region.modes;
        return modes.filter((mode: string) => !props.transportOptions || (props.transportOptions.isModeEnabled(mode) && LocationsResult.isModeRelevant(mode)));
    }

    public render(): React.ReactNode {
        const region = RegionsData.instance.getRegion(this.props.bounds.getCenter());
        if (!region) {
            return null;
        }
        let locations: ModeLocation[] = [];
        const omit = this.props.omit || [];
        const enabledModes = this.enabledModes();
        if (enabledModes.length > 0) {
            const bounds = MapUtil.expand(this.props.bounds, .5);
            const zoom = this.props.zoom;
            if (zoom >= this.ZOOM_PARENT_LOCATIONS) {
                locations = LocationsData.instance.getRequestLocations(region.name, 1, enabledModes).getLocations();
            }
            if (zoom >= this.ZOOM_ALL_LOCATIONS) {
                locations.push(...LocationsData.instance.getRequestLocations(region.name, 2, enabledModes, bounds).getLocations());
            }
        }
        return locations.filter(loc => !omit.find(omitLoc => LocationUtil.equal(omitLoc, loc)))
            .map((loc, i) => <TKUIModeLocationMarker loc={loc} onClick={() => this.props.onClick?.(loc)} isDarkMode={this.props.isDarkMode} key={loc.getKey() ?? i} />);
    }

    public shouldComponentUpdate(nextProps: IProps): boolean {
        return nextProps.zoom !== this.props.zoom
            || JSON.stringify(this.enabledModes()) !== JSON.stringify(this.enabledModes(nextProps))
            || (this.props.zoom >= this.ZOOM_PARENT_LOCATIONS && RegionsData.instance.getRegion(nextProps.bounds.getCenter()) !== RegionsData.instance.getRegion(this.props.bounds.getCenter()))
            || (this.props.zoom >= this.ZOOM_ALL_LOCATIONS && (JSON.stringify(MapUtil.cellsForBounds(nextProps.bounds, LocationsData.cellsPerDegree))
                !== JSON.stringify(MapUtil.cellsForBounds(this.props.bounds, LocationsData.cellsPerDegree))))
            || JSON.stringify(nextProps.omit) !== JSON.stringify(this.props.omit)
            || nextProps.isDarkMode !== this.props.isDarkMode;
    }

    public componentWillUnmount() {
        if (this.locListenerSubscription) {
            this.locListenerSubscription.remove();
        }
    }

}

export default TKUIMapLocations;