import * as React from "react";
import {Map, Marker, Popup, TileLayer} from "react-leaflet";
import {LatLngExpression} from "leaflet";
// import * as L from 'leaflet';

class ReactMap extends React.Component<{}, {}> {
    public render(): React.ReactNode {
        // const { Map, TileLayer, Marker, Popup } = require('../../node_modules/react-leaflet');
        const position: LatLngExpression = [51.505, -0.09];
        return (
            <Map
                className="map-canvas avoidVerticalScroll gl-flex gl-grow"
                center={position}
            >
                <TileLayer
                    attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                    // url="http://{s}.tile.osm.org/{z}/{x}/{y}.png"
                    // url="https://api.mapbox.com/styles/v1/mgomezlucero/cjle1r3go0axx2rqh15dcenzo.html?fresh=true&title=true&access_token=pk.eyJ1IjoibWdvbWV6bHVjZXJvIiwiYSI6ImNqa3N3aTQ0cjAxZ3UzdnRnbWtyZDY4bXMifQ.mLGxFRgw2xvCmNa8DVrtxA#12.0/48.866500/2.317600/0"
                    // url="https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWdvbWV6bHVjZXJvIiwiYSI6ImNqa3N3aTQ0cjAxZ3UzdnRnbWtyZDY4bXMifQ.mLGxFRgw2xvCmNa8DVrtxA"
                    // url="https://api.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWdvbWV6bHVjZXJvIiwiYSI6ImNqa3N3aTQ0cjAxZ3UzdnRnbWtyZDY4bXMifQ.mLGxFRgw2xvCmNa8DVrtxA"
                    url="https://api.mapbox.com/styles/v1/mgomezlucero/cjle1r3go0axx2rqh15dcenzo.html/tiles/256/{z}/{x}/{y}?fresh=true&title=true&access_token=pk.eyJ1IjoibWdvbWV6bHVjZXJvIiwiYSI6ImNqa3N3aTQ0cjAxZ3UzdnRnbWtyZDY4bXMifQ.mLGxFRgw2xvCmNa8DVrtxA#12.0/48.866500/2.317600/0"
                />
                <Marker position={position}>
                    <Popup>
                        A pretty CSS3 popup. <br /> Easily customizable.
                    </Popup>
                </Marker>
            </Map>
        )
    }
}

export default ReactMap;