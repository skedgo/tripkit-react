[](TKRoot) is a component to be used as root of (the sub-tree of the app using) the SDK components, and provides the
environment necessary for the SDK components to work: it handles the global state of the SDK ([](TKState)), the TripGo API traffic, and the injection of general and component-specific configs 
into the system.

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
    <div>
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

