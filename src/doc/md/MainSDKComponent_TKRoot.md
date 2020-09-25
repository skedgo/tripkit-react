[](TKRoot) is a component to be used as root of (the sub-tree of the app using) the SDK components. 

It handles the global state of the SDK ([](TKState)), the TripGo API traffic, and the injection of general and component-specific configs 
to the system.

### Config property

It receives a [config object](TKUIConfig) as property, which allows to specify the *TripGo API key* (required) and 
optionally other general customization options, as *theme*, *i18n resources* (translations of SDK strings), 
*google analytics configs* (including API keys), *geocoding sources*, etc. It also allows to specify component-specific configs 
for any component of the SDK,  which will be applied to the component when rendered anywhere below TKRoot in the tree.

### Global state

The TKRoot component maintains a global state accessible by the SDK components, composed by values and callback 
functions to update them. For instance, the current *routing query* (from + to + time + time preference, 
possibly partially specified), and the corresponding *routing results* 
(computed vía the TripGo API, if the query is fully specified), are part of the global state.

Some of the SDK components (specially high-level ones) become, by default, **automatically connected to the part** of the 
global state **relevant to the component** when placing it anywhere below TKRoot in the components hierarchy.
This connection happens through the component's (well-specified) props: by 
**injecting state values (and update callbacks) as deault values** for some props. 

For instance, the query input component ([](TKUIRoutingQueryInput)) has optional properties

```static
value: RoutingQuery;
onChange: (routingQuery: RoutingQuery) => void;
```

that if not provided when calling the component they default to the query and query update callback of the global 
state.

This feature makes really easy to integrate different SDK components to get the most typical interactions between them.
As an example, the code below integrates [](TKUIRoutingQueryInput) (query input component) and [](TKUIMapView) (map component) 
just by putting them somewhere below TKRoot, and so they become automatically connected to the global state.

```jsx static
import {TKRoot, TKUIRoutingQueryInput, TKUIMapView, LatLng, RoutingQuery, TKLocation, 
        TKStateController, tKRequestCurrentLocation} from 'tripkit-react';
        
const config = {
    apiKey: '790892d5eae024712cfd8616496d7317', 
    isDarkDefault: false,
    onInitState: state => {
                    tKRequestCurrentLocation(true, true)    // Set map viewport according to user position
                        .then(userPos => state.onViewportChange({center: userPos.latLng, zoom: 13}));
                    state.onDirectionsView(true);           // Enable directions view flag    
                },
    onUpdateState: (state, prevState) =>
                (!prevState.trips || prevState.trips.length === 0) 
                && state.trips && state.trips.length > 0 
                && state.onChange(state.trips[0]) // Select first trip by default
};

<TKRoot config={config}>
    <div style={{height: '500px'}}>
        <div style={{position: 'absolute', zIndex: '1', margin: '10px', width: '300px'}}>
            <TKUIRoutingQueryInput/>
        </div>
        <TKUIMapView/>
    </div>
</TKRoot>
```

```jsx noeditor
import {TKRoot, TKUIRoutingQueryInput, TKUIMapView, LatLng, RoutingQuery, TKLocation, 
        TKStateController, tKRequestCurrentLocation} from 'tripkit-react';
        
const config = {
    apiKey: '790892d5eae024712cfd8616496d7317', 
    isDarkDefault: false,
    onInitState: state => {
                    tKRequestCurrentLocation(true, true)    // Set map viewport according to user position
                        .then(userPos => state.onViewportChange({center: userPos.latLng, zoom: 13}));
                    state.onDirectionsView(true);           // Enable directions view flag
                },
    onUpdateState: (state, prevState) =>
                (!prevState.trips || prevState.trips.length === 0) 
                && state.trips && state.trips.length > 0 
                && state.onChange(state.trips[0]) // Select first trip by default
};

<TKRoot config={config}>
    <div style={{height: '500px'}}>
        <div style={{position: 'absolute', zIndex: '1', margin: '10px', width: '300px'}}>
            <TKUIRoutingQueryInput/>
        </div>
        <TKUIMapView/>
    </div>
</TKRoot>
```

Then by picking *from* or *to* location from query input component it will also be reflected on map, and conversely, by
dropping a pin on map will set the corresponding location as *from* or *to* on query input.

Also notice that after setting both *from* and *to* locations, computation of routing results via TripGo API is 
automatically triggered, and when the first result arrives we set it as the selected trip (global state value) and so
it becomes displayed on the map. If we also include the [](TKUIResultsView) component to show the list of all routing 
results, then it will automatically display trip selection too (see [TripGo trip planner](https://tripgo.com)).

**Code highlights:**
- onInitState and onUpdateState are functions that can be provided through SDK config to do actions on state 
initialization and update, respectively. Both functions receive the state, which includes state values and update 
callbacks, allowing to read and write the state.
- In our example, on state init we calculate user position and set map viewport (state value) accordingly, and also
set behaviour mode to 'directions' (further explained [here]()). On state update we detect that routing 
results (for the current query) have arrived, and set the first as the selected one.

