The [](TKRoot) component wraps all the other SDK components. It allows to specify global and component-specific configs, and also provides a shared state and actions layer, which SDK components can optionally connect to in order to share data and interact with the TripGo API.

### Config property

TKRoot receives a [config object](TKUIConfig) as property, which allows to specify the *TripGo API key* (required) and 
optionally other general customization options, as [theme](#/Customization/Theme), [i18n resources](#/Customization/I18n) (translations of SDK strings), [geocoding sources](#/Customization/Geocoding), 
*google analytics configs* (including API keys), etc. It also allows to specify [component-specific configs](#/Component-level%20Customization) 
for any component of the SDK,  which will be applied to the component when rendered anywhere below `TKRoot` in the tree.

### Examples

A [tripgo.com](https://tripgo.com) like (full) trip planner, where a TripGo api key is passed to TKRoot through config:

```jsx
import { TKRoot, TKUITripPlanner } from 'tripkit-react';
        
const config = {
    apiKey: '424353266689764a5f15b5dc7e619aa1'  // Use your TripGo api key here.
};

<TKRoot config={config}>
    <div style={{height: '500px', position: 'relative'}}>
        <TKUITripPlanner/>
    </div>
</TKRoot>
```

A location search component, pick a location to see it's details below.

```jsx
import { useState } from "react";
import { TKRoot, TKUILocationSearch } from 'tripkit-react';
        
const config = {
    apiKey: '424353266689764a5f15b5dc7e619aa1'  // Use your TripGo api key here.
};

const [location, setLocation] = useState();

<TKRoot config={config}>
    <div style={{width: '400px'}}>
        <TKUILocationSearch 
            value={location} 
            onChange={setLocation} 
            onDirectionsClick={() => { alert("Directions button clicked") }}
        />
        {location && 
            <div style={{ margin: '16px' }}>
                <div>Location details:</div>
                <ul>
                    <li>{`Address: ${location.address}`}</li>
                    <li>{`Coords: (${location.lat}, ${location.lng})`}</li>
                </ul>
            </div>
        }
    </div>
</TKRoot>
```

The next example shows how to use query and map components to define and display a routing query.

The routing query input component ([](TKUIRoutingQueryInput)) can be used to build or update a [routing query object]() in a controlled way, through `query` and `onChange` properties. Also, the [](TKUIMapView) [](TKUIMapView) can be used to display *from* and *to* locations of a routing query, as well as updating them by dropping / drag & dropping pins.

Notice that by picking *from* or *to* locations from the query input component it will also be reflected on the map, and conversely, by
dropping a pin on the map it will set the corresponding location as *from* or *to* on the query input.

```jsx
import { useState, useEffect, useRef } from "react";
import { TKRoot, TKUIRoutingQueryInput, TKUIMapView, tKRequestCurrentLocation, RoutingQuery, TKUtil } from 'tripkit-react';
import "./styles.css";

function TripPlanner() {
    const [query, setQuery] = useState(new RoutingQuery());
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
    );
}

const config = {
    apiKey: '424353266689764a5f15b5dc7e619aa1' // Use your TripGo api key here.
};

<TKRoot config={config}>
    <TripPlanner />    
</TKRoot>
```

