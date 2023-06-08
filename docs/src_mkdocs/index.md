# TripKit SDK for React

This is the documentation of TripKit React, the React SDK for the [TripGo API](https://developer.tripgo.com).

## Installation

```
npm install tripkit-react
```


## Usage

[Get a TriGo API key](https://tripgo.3scale.net/signup?plan_ids[]=2357356192718) and pass it to the
[TKRoot component](reference/#/Components%20API/TKRoot) through the [config object](reference/#/Model/TKUIConfig).


```
import React from 'react';
import ReactDOM from 'react-dom/client';
import 'reflect-metadata';  // Important: Polyfill for Metadata Reflection API
import { TKRoot, TKUITripPlanner } from 'tripkit-react';

const config = {
    apiKey: <MY_TRIPGO_API_KEY>
};

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <TKRoot config={config}>
    <TKUITripPlanner />
  </TKRoot>);
```