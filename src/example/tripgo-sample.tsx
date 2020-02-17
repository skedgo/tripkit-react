import React from 'react';
import ReactDOM from 'react-dom';
import {TKUITripPlanner, TKUIConfig, TKShareHelper} from '../index';
import TKRoot from "../config/TKRoot";


const config: TKUIConfig = {
    apiKey: 'xxx'
};

const urlQuery = TKShareHelper.getSharedQueryURL();

ReactDOM.render(
    <TKUIProvider config={config} initQuery={urlQuery}>
        <TKUITripPlanner/>
    </TKUIProvider>, document.getElementById("tripgo-sample-root"));