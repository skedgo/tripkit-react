import * as React from "react";
import {Map, Marker, Popup, TileLayer} from "react-leaflet";
import NetworkUtil from "../util/NetworkUtil";
import LatLng from "../model/LatLng";
import Location from "../model/Location";
import Constants from "../util/Constants";
import L from "leaflet";
import BBox from "../model/BBox";
import LeafletUtil from "../util/LeafletUtil";
// import * as L from 'leaflet';

interface IProps {
    from?: Location;
    to?: Location;
    viewport?: {center?: LatLng, zoom?: number};
    bounds?: BBox;
    onclick?: (latLng: LatLng) => void;
    ondragend?: (from: boolean, latLng: LatLng) => void;
    onViewportChanged?: (viewport: {center?: LatLng, zoom?: number}) => void;
}

// interface IState {
//     boundsSet: BBox;
// }

// class ReactMap<P extends MapProps & IProps> extends React.Component<P, {}> {
class ReactMap extends React.Component<IProps, {}> {

    private leafletElement: any;

    public render(): React.ReactNode {
        const lbounds = this.props.bounds ? L.latLngBounds([this.props.bounds.sw, this.props.bounds.ne]) : undefined;
        return (
            <Map
                className="map-canvas avoidVerticalScroll gl-flex gl-grow"
                // center={position}
                // zoom={13}
                // style={{height: "500px"}}
                // viewport={{center: [10, 5], zoom: 13}}
                viewport={this.props.viewport}
                bounds={lbounds}
                boundsOptions={{padding: [20, 20]}}
                onViewportChanged={this.props.onViewportChanged}
                onclick={(event: L.LeafletMouseEvent) => {
                    if (this.props.onclick) {
                        this.props.onclick(LatLng.createLatLng(event.latlng.lat, event.latlng.lng))
                    }
                }}
                ref={(ref: any) => {
                    if (ref) {
                        this.leafletElement = ref.leafletElement;
                    }
                }}
            >
                <TileLayer
                    attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                    // url="http://{s}.tile.osm.org/{z}/{x}/{y}.png"
                    // url="https://api.mapbox.com/styles/v1/mgomezlucero/cjle1r3go0axx2rqh15dcenzo.html?fresh=true&title=true&access_token=pk.eyJ1IjoibWdvbWV6bHVjZXJvIiwiYSI6ImNqa3N3aTQ0cjAxZ3UzdnRnbWtyZDY4bXMifQ.mLGxFRgw2xvCmNa8DVrtxA#12.0/48.866500/2.317600/0"
                    // url="https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWdvbWV6bHVjZXJvIiwiYSI6ImNqa3N3aTQ0cjAxZ3UzdnRnbWtyZDY4bXMifQ.mLGxFRgw2xvCmNa8DVrtxA"
                    // url="https://api.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWdvbWV6bHVjZXJvIiwiYSI6ImNqa3N3aTQ0cjAxZ3UzdnRnbWtyZDY4bXMifQ.mLGxFRgw2xvCmNa8DVrtxA"
                    // url="https://api.mapbox.com/styles/v1/mgomezlucero/cjle1r3go0axx2rqh15dcenzo.html/tiles/256/{z}/{x}/{y}?fresh=true&title=true&access_token=pk.eyJ1IjoibWdvbWV6bHVjZXJvIiwiYSI6ImNqa3N3aTQ0cjAxZ3UzdnRnbWtyZDY4bXMifQ.mLGxFRgw2xvCmNa8DVrtxA#12.0/48.866500/2.317600/0"
                    url="http://1.base.maps.cit.api.here.com/maptile/2.1/maptile/newest/normal.day/{z}/{x}/{y}/256/png8?app_id=aYTqZORZ7FFwqoFZ7c4j&app_code=qUK5XVczkZcFESPnGPFKPg"
                />
                {this.props.from && this.props.from.isResolved() &&
                <Marker position={this.props.from!}
                        icon={L.icon({
                            iconUrl: Constants.absUrl("/images/map/ic-map-pin-from.svg"),
                            iconSize: [35, 35],
                            iconAnchor: [17, 35],
                            className: "LeafletMap-pinFrom"
                        })}
                        draggable={true}
                        riseOnHover={true}
                        ondragend={(event: L.DragEndEvent) => {
                            if (this.props.ondragend) {
                                const latLng = event.target.getLatLng();
                                this.props.ondragend(true, LatLng.createLatLng(latLng.lat, latLng.lng));
                            }
                        }}
                >
                    <Popup>
                        A pretty CSS3 popup. <br /> Easily customizable.
                    </Popup>
                </Marker>
                }
                {this.props.to && this.props.to.isResolved() &&
                <Marker position={this.props.to!}
                        icon={L.icon({
                            iconUrl: Constants.absUrl("/images/map/ic-map-pin.svg"),
                            iconSize: [35, 35],
                            iconAnchor: [17, 35],
                            className: "LeafletMap-pinTo"
                        })}
                        draggable={true}
                        riseOnHover={true}
                        ondragend={(event: L.DragEndEvent) => {
                            if (this.props.ondragend) {
                                const latLng = event.target.getLatLng();
                                this.props.ondragend(false, LatLng.createLatLng(latLng.lat, latLng.lng));
                            }
                        }}
                >
                    <Popup>
                        A pretty CSS3 popup. <br /> Easily customizable.
                    </Popup>
                </Marker>
                }
            </Map>
        )
    }

    public componentWillMount(): void {
        NetworkUtil.loadCss("https://unpkg.com/leaflet@1.3.4/dist/leaflet.css");
    }

    public fitBounds(bounds: BBox) {
        if (this.leafletElement) {
            this.leafletElement.fitBounds(L.latLngBounds([bounds.sw, bounds.ne]));
        }
    }

    public alreadyFits(bounds: BBox): boolean {
        return this.leafletElement ? this.leafletElement.getBounds().contains(LeafletUtil.fromBBox(bounds)) : false;
    }

    public onResize() {
        this.leafletElement.invalidateSize();
    }
}

export default ReactMap;