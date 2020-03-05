import React from 'react';
import ReactDOM from 'react-dom';
import {TKUITripPlanner, TKRoot, TKUIConfig, TKShareHelper, TKUIReportBtnProps, LatLng} from '../index';
import {ReactComponent as IconReport} from './images/icon-usersnap.svg';
import classNames from 'classnames';
import Usersnap from "./usersnap/Usersnap";


const config: TKUIConfig = {
    apiKey: 'xxx'
};

const urlQuery = TKShareHelper.getSharedQueryURL();

ReactDOM.render(
    <TKUIProvider config={config} initQuery={urlQuery}>
        <TKUITripPlanner/>
    </TKUIProvider>, document.getElementById("tripgo-sample-root"));