import React from 'react';
import ReactDOM from 'react-dom';
import {TKUITripPlanner, TKUIProvider, TKUIConfig} from '../index';


const config: TKUIConfig = {
    apiKey: '790892d5eae024712cfd8616496d7317'
};

ReactDOM.render(
    <TKUIProvider config={config}>
        <TKUITripPlanner/>
    </TKUIProvider>, document.getElementById("tripgo-sample-root"));