import React from 'react';
import ReactDOM from 'react-dom';
import {TKUITripPlanner, TKRoot, TKUIConfig, TKShareHelper} from '../index';
import DeviceUtil from "../util/DeviceUtil";


const config: TKUIConfig = {
    apiKey: 'xxx'
};

const urlQuery = TKShareHelper.getSharedQueryURL();

ReactDOM.render(
    <TKUIProvider config={config} initQuery={urlQuery}>
        <TKUITripPlanner/>
    </TKUIProvider>, document.getElementById("tripgo-sample-root"));