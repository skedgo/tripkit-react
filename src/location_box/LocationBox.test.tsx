import * as React from "react";
import * as ReactDOM from "react-dom";
import TKUILocationBox from "./TKUILocationBox";
import MultiGeocoder from "../geocode/MultiGeocoder";
import Location from '../model/Location';
import LatLng from "../model/LatLng";


const LocationBoxWithGMapsApi = () => {
    const geocodingData: MultiGeocoder = new MultiGeocoder();
    return <TKUILocationBox
        geocodingData={geocodingData}
        placeholder="Enter an address..."
        value={Location.create(LatLng.createLatLng(10, 10), "", "","")}
    />
};

it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<LocationBoxWithGMapsApi />, div);
    ReactDOM.unmountComponentAtNode(div);
});