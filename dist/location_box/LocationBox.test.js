import * as React from "react";
import * as ReactDOM from "react-dom";
import LocationBox from "./LocationBox";
import MultiGeocoder from "./MultiGeocoder";
import Location from '../model/Location';
import LatLng from "../model/LatLng";
var LocationBoxWithGMapsApi = function () {
    var geocodingData = new MultiGeocoder(true);
    return React.createElement(LocationBox, { geocodingData: geocodingData, placeholder: "Enter an address...", value: Location.create(LatLng.createLatLng(10, 10), "", "", "") });
};
it('renders without crashing', function () {
    var div = document.createElement('div');
    ReactDOM.render(React.createElement(LocationBoxWithGMapsApi, null), div);
    ReactDOM.unmountComponentAtNode(div);
});
//# sourceMappingURL=LocationBox.test.js.map