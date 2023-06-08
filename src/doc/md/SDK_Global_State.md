The [](TKRoot) component provides a global state maintaining data that is typically useful for a trip planning application.

Such a global state is composed by properties and updater functions to update them or trigger interactions with the TripGo api.

For instance, the global state maintains a *routing query* (from + to + time + time preference), 
which may be partially or completly specified at any moment. Also, when automatic trip computation is enabled 
(will illustrate this in an example below), then *routing results* will be calculated automatically, via TripGo api, 
whenever the query becomes completly specified.
When results arrive, they are also stored as part of the global state, and are maintained up to date with respect to changes
to the routing query, as well as real-time updates.


### Accessing the state with `useTKState`

The global state can be accessed at any component below `TKRoot` by using the `useTKState` hook.

The next example is a version of the last one at [Main SDK component: TKRoot](#/Main%20SDK%20component%3A%20TKRoot) but using
`query` from state.

```jsx
import { useState, useEffect, useRef } from "react";
import { TKRoot, TKUIRoutingQueryInput, TKUIMapView, tKRequestCurrentLocation, RoutingQuery, TKUtil, useTKState } from 'tripkit-react';
import "./styles.css";

function TripPlanner() {
    
    const { query, onQueryChange } = useTKState();
    const mapRef = useRef();

    useEffect(() => {
        // Fit map to user's current location, if available.
        tKRequestCurrentLocation(true, true)            
            .then(userPos => mapRef.current.setViewport(userPos.latLng, 13));
    }, []);

    return (
        <div className="trip-planner-main">
            <div className="trip-planner-floating-left">
                <TKUIRoutingQueryInput 
                    value={query}
                    onChange={onQueryChange}
                />           
            </div>        
            <TKUIMapView 
                from={query.from}
                onFromChange={update => onQueryChange(TKUtil.iAssign(query, {from: update}))}                        
                to={query.to}
                onToChange={update => onQueryChange(TKUtil.iAssign(query, {to: update}))}            
                ref={mapRef}
            />        
        </div>
    );
}

const config = {
    apiKey: '424353266689764a5f15b5dc7e619aa1' // Use your TripGo api key here.
};

<TKRoot config={config}>
    <TripPlanner />    
</TKRoot>
```

We can get more features by connecting to the global state, as getting trips calculated (via TripGo api) and displayed for the current query, including re-calculating trips on query udpates.

The next example adds the [](TKUIRoutingResultsView) component to display calculated trips for current query, as well as allowing selecting
a trip. The selected trip will also be displayed on map. Also changing the query will cause trips to be re-calculated.

```jsx
import { useState, useEffect, useRef } from "react";
import { TKRoot, TKUIRoutingQueryInput, TKUIMapView, TKUIRoutingResultsView, tKRequestCurrentLocation, RoutingQuery, TKUtil, useTKState, CardPresentation } from 'tripkit-react';
import "./styles.css";

function TripPlanner() {
    
    const { query, onQueryChange, onComputeTripsForQuery, waiting, trips, selectedTrip, onSelectedTripChange } = useTKState();
    const mapRef = useRef();

    useEffect(() => {
        // Fit map to user's current location, if available.
        tKRequestCurrentLocation(true, true)            
            .then(userPos => mapRef.current.setViewport(userPos.latLng, 13));
        // Enable automatic computation of trips when query is complete.
        onComputeTripsForQuery(true);
    }, []);

    return (
        <div className="trip-planner-main">
            <div className="trip-planner-floating-left">
                <TKUIRoutingQueryInput 
                    value={query}
                    onChange={onQueryChange}
                />            
                {trips &&                    
                    <TKUIRoutingResultsView
                        values={trips}
                        onChange={onSelectedTripChange}
                        waiting={waiting}
                        cardPresentation={CardPresentation.NONE}
                        showTimeSelect={false}
                        showTransportsBtn={false}
                    />}            
            </div>        
            <TKUIMapView 
                from={query.from}
                onFromChange={update => onQueryChange(TKUtil.iAssign(query, {from: update}))}                        
                to={query.to}
                onToChange={update => onQueryChange(TKUtil.iAssign(query, {to: update}))}
                padding={{left: 300}}
                trip={selectedTrip}
                ref={mapRef}                
            />        
        </div>
    );
}

const config = {
    apiKey: '424353266689764a5f15b5dc7e619aa1' // Use your TripGo api key here.
};

<TKRoot config={config}>
    <TripPlanner />
</TKRoot>
```

In this case we access to the `onComputeTripsForQuery` function, which allows to enable the automatic computation of trips when query is complete, and also some other properties to be fed to the [](TKUIRoutingResultsView): [trips](#/Model/TKState?id=trips), [selectedTrip](#/Model/TKState?id=selectedTrip), [onTripSelected](#/Model/TKState?id=onSelectedTrip), and [waiting](#/Model/TKState?id=waiting) (click on any of the previous properties to see it's documentation).

### Connection helpers

To facilitate building a UI that interacts with this global state, some of the SDK components (specially high-level ones) provide
connection helpers, which are just wrappers that provide properties to the component (values and callbacks) so 
it becomes connected with the global state, that is, the connection helper for a component translate the relevant portion of the global
state into properties to be passed to that component.

Let's switch the previous example to use connection helpers for [](TKUIRoutingQueryInput), [](TKUIMapView), and [](TKUIRoutingResultsView).
See documentation for each component (click on previous links) to see which properties of the component are provided by its connection helper.

```jsx
import { useState, useEffect, useRef } from "react";
import { TKRoot, TKUIRoutingQueryInput, TKUIRoutingQueryInputHelpers, TKUIMapView, TKUIMapViewHelpers, TKUIRoutingResultsView, TKUIRoutingResultsViewHelpers, tKRequestCurrentLocation, RoutingQuery, TKUtil, useTKState, CardPresentation } from 'tripkit-react';
import "./styles.css";

function TripPlanner() {
    
    const { onComputeTripsForQuery, trips } = useTKState();
    const mapRef = useRef();

    useEffect(() => {
        // Fit map to user's current location, if available.
        tKRequestCurrentLocation(true, true)            
            .then(userPos => mapRef.current.setViewport(userPos.latLng, 13));
        // Enable automatic computation of trips when query is complete.
        onComputeTripsForQuery(true);
    }, []);

    return (
        <div className="trip-planner-main">
            <div className="trip-planner-floating-left">
                <TKUIRoutingQueryInputHelpers.TKStateProps>
                    {stateProps => <TKUIRoutingQueryInput {...stateProps}/>}
                </TKUIRoutingQueryInputHelpers.TKStateProps>            
                {trips &&
                    <TKUIRoutingResultsViewHelpers.TKStateProps>
                        {stateProps =>
                            <TKUIRoutingResultsView {...stateProps} 
                                cardPresentation={CardPresentation.NONE}
                                showTimeSelect={false}
                                showTransportsBtn={false}
                            />}
                    </TKUIRoutingResultsViewHelpers.TKStateProps>}            
            </div>
            <TKUIMapViewHelpers.TKStateProps>
                {stateProps => 
                    <TKUIMapView 
                        {...stateProps}
                        padding={{left: 300}}
                        ref={mapRef}                         
                    />}
            </TKUIMapViewHelpers.TKStateProps>            
        </div>
    );
}

const config = {
    apiKey: '424353266689764a5f15b5dc7e619aa1' // Use your TripGo api key here.
};

<TKRoot config={config}>    
    <TripPlanner />
</TKRoot>
```

Also notice that we get a richer connection between TKUIRoutingQueryInput and TKUIMapView: if you browse autocompletion results with the arrow keys, when highlighting a result the map will also display and fit bounds to that result. That's since the connection helpers of 
both components connect some additional properties of them through the global state, in this case, `preFrom` and `preTo` locations (highlighted *from* and *to* autocompletion suggestions).