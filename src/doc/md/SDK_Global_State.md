The [](TKRoot) component provides a global state maintaining data that is typically useful for a trip planning application.
Such a global state is composed by properties and updater functions to update them or trigger interactions with the TripGo api.

For instance, the global state maintains a *routing query* (from + to + time + time preference), 
which may be partially specified. When the query becomes completly specified, computation of *routing results* 
via TripGo api is triggered automatically (this can be disabled to be triggered manually, instead).
When results arrive, they are also stored as part of the global state, and are maintained up to date with respect to changes
to the routing query, as well as real-time updates.

To facilitate building a UI that interacts with this global state, some of the SDK components (specially high-level ones) provide
connection helpers, which are just wrapper components that provides properties to the target component (values and callbacks) so 
it becomes connected with the global state. 

Let's show with an example how components connected to the global state will interact with each other vía the state, and achieve
interesting beheaviour with little effort.

The routing query input component ([](TKUIRoutingQueryInput)) can be used to building or update a [routing query object]() in a controlled way, through `query` and `onChange` properties. Also, the TKUIMapView can be used to display from and to locations of a routing query, as well as updating them by dropping / drag & dropping pins.

The next example shows how to use both components to define and display a routing query, withough using the global state.

```jsx
import { useState, useEffect, useRef } from "react";
import { TKRoot, TKUIRoutingQueryInput, TKUIMapView, tKRequestCurrentLocation, RoutingQuery, TKUtil } from 'tripkit-react';
        
const config = {
    apiKey: '424353266689764a5f15b5dc7e619aa1' // Use your TripGo api key here.
};

const [query, setQuery] = useState(new RoutingQuery());
const mapRef = useRef();

useEffect(() => {
    tKRequestCurrentLocation(true, true)            
        .then(userPos => mapRef.current.setViewport(userPos.latLng, 13));
}, []);

<TKRoot config={config}>
    <div style={{height: '500px'}}>
        <div style={{position: 'absolute', zIndex: '1', margin: '10px', width: '300px'}}>
            <TKUIRoutingQueryInput 
                value={query}
                onChange={setQuery}
            />           
        </div>        
        <TKUIMapView 
            from={query.from}
            onFromChange={update => setQuery(TKUtil.iAssign(query, {from: update}))}                        
            to={query.to}
            onToChange={update => setQuery(TKUtil.iAssign(query, {to: update}))}            
            ref={mapRef}
        />        
    </div>
</TKRoot>
```

Instead, we can do as follows, and make the components to interact with each other through the state.

```jsx
import { TKRoot, TKUIRoutingQueryInput, TKUIRoutingQueryInputHelpers, TKUIMapView, TKUIMapViewHelpers, tKRequestCurrentLocation } from 'tripkit-react';
import { queryMapConfig } from 'doc-helper';
        
const config = {
    apiKey: 'TRIPGO_API_KEY',
    onInitState: state => {
        // Set map viewport to focus user position
        tKRequestCurrentLocation(true, true)
            .then(userPos => state.setViewport({ center: userPos.latLng, zoom: 13 }));

        // Enable directions view flag    
        state.onComputeTripsForQuery(true);           
    },
    onUpdateState: (state, prevState) =>
        // Select the first trip by default  
        (!prevState.trips || prevState.trips.length === 0) && state.trips && state.trips.length > 0
            && state.onChange(state.trips[0]),
    ...queryMapConfig
};

<TKRoot config={config}>
    <div style={{height: '500px'}}>
        <div style={{position: 'absolute', zIndex: '1', margin: '10px', width: '300px'}}>
            <TKUIRoutingQueryInputHelpers.TKStateProps>
                {stateProps => <TKUIRoutingQueryInput {...stateProps}/>}
            </TKUIRoutingQueryInputHelpers.TKStateProps>
        </div>
        <TKUIMapViewHelpers.TKStateProps>
            {stateProps => <TKUIMapView {...stateProps}/>}
        </TKUIMapViewHelpers.TKStateProps>        
    </div>
</TKRoot>
```

Notice that there is more logic there w.r.t. the example above: on location higlight it focuses on map.

TO BE CONTINUED


They does not need to be rendered by the same component / at the same level. 

<!-- This feature makes really easy to integrate different SDK components to get the most typical interactions between them.
For instance, the example below integrates [](TKUIRoutingQueryInput) (query input component) and [](TKUIMapView) (map component) 
just by putting them somewhere below [](TKRoot), and so they become automatically connected to the global state. -->

Finally, trip computation.


 *  You can connect the component with the SDK global state, {@link TKState}, by forwarding the props
 *  provided by TKUIRoutingQueryInputHelpers.TKStateProps, in the following way:
 * 
 *  ```
 *   <TKUIRoutingQueryInputHelpers.TKStateProps>
 *      {stateProps => 
 *          <TKUIRoutingQueryInput 
 *              {...stateProps}
 *              // Other props
 *          />}
 *   </TKUIRoutingQueryInputHelpers.TKStateProps>
 *  ```


Then by picking *from* or *to* locations from the query input component it will also be reflected on the map, and conversely, by
dropping a pin on the map it will set the corresponding location as *from* or *to* on the query input.

Also notice that after setting both *from* and *to* locations, computation of routing results via TripGo API is 
automatically triggered, and when the first result arrives we set it as the selected trip (global state value) and so
it becomes displayed on the map. If we also include the [](TKUIRoutingResultsView) component to show the list of all routing 
results, then it will automatically display the trip selection, too (see [TripGo trip planner](https://tripgo.com)).

**Code highlights**
- onInitState and onUpdateState are functions that can be provided through SDK config to do actions on global state 
initialization and update, respectively. Both functions receive the state, which include values and update 
callbacks, allowing to read and write the global state.
- In our example, on state init we calculate the user position and set the map viewport (state value) accordingly, and also
set behaviour mode to 'directions' (further explained [here]()). On state update we detect that routing 
results (for the current query) have arrived, and set the first as the selected one.

**Disconnection from the state**

By explicitly passing a value for a connection property it will avoid that property to connect to the state.
If you want to avoid the connection but don't want to provide any specific value to the property,
then you can explicitly pass _undefined_ as property value.