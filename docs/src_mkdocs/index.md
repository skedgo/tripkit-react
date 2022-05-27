# TripKit SDK for React

This is the documentation of TripKit React, the React SDK for the [TripGo API](https://developer.tripgo.com).

## Installation

```
npm install tripkit-react
```


## Usage

[Get a TriGo API key](https://tripgo.3scale.net/signup?plan_ids[]=2357356192718) and pass it to 
[TKRoot component](reference/#/Components%20API/TKRoot) through [config object](reference/#/Model/TKUIConfig).


```
import React from 'react';
import ReactDOM from 'react-dom';
import {TKRoot, TKUITripPlanner} from 'tripkit-react';

const config = {
    apiKey: <MY_TRIPGO_API_KEY>
};

ReactDOM.render(
    <TKRoot config={config}>
        <TKUITripPlanner/>
    </TKRoot>, document.getElementById('root'));
```