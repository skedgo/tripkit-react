<img src="https://tripgo.com/images/external/api-mark-logo.svg" alt="TripGo API" width="30" height="30">  TripKit SDK for React
======================================

The React SDK for the [TripGo API](https://developer.tripgo.com/).

## Installation

```
npm install tripkit-react
```

## Usage

[Get a TriGo API key](https://tripgo.3scale.net/signup?plan_ids[]=2357356192718) and pass it to the
[TKRoot component](https://react.developer.tripgo.com/reference/#/Main%20SDK%20component%3A%20TKRoot) through the [config object](https://react.developer.tripgo.com/reference/#/Model/TKUIConfig).


```jsx
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

## SDK Reference

- ### [Main SDK Component: TKRoot](https://react.developer.tripgo.com/reference/#/Main%20SDK%20component%3A%20TKRoot)

- ### [Customization](https://react.developer.tripgo.com/reference/#/Customization)

- ### [Components API](https://react.developer.tripgo.com/reference/#/Components%20API)