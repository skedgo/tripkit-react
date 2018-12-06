import LeafletMap from "./LeafletMap";

class MboxMap extends LeafletMap {

    constructor(containerId: string) {
        require('mapbox.js/theme/style.css');
        const { mapbox } = require('mapbox.js');
        mapbox.accessToken = "pk.eyJ1IjoibWdvbWV6bHVjZXJvIiwiYSI6ImNqa3N3aTQ0cjAxZ3UzdnRnbWtyZDY4bXMifQ.mLGxFRgw2xvCmNa8DVrtxA";
        super(mapbox.map(containerId, "mapbox.streets"));
    }

}

export default MboxMap;