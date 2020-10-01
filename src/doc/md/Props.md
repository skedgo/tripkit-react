Through this config feature you are able to pass a value to any property of the component. This value overrides 
(takes precedence over) the property value passed to the component wherever it's used in the system. 
You can also specify a function receiving the original props passed to the component, so your override can be defined
in terms of the props you are overriding.
For instance, in the following example we override the title of [query input component](TKUIRoutingQueryInput). We also 
add a collateral effect to the click of the clear (cross) button, in this case show an alert, but we could do something 
useful like track an event on google analytics. When overriding ```onClearClicked``` handler it's fundamental to forward 
the call to the original handler (```origProps.onClearClicked```) to preserve the original behaviour of clearing query 
input and closing card.

```jsx
import {TKRoot, TKUITripPlanner} from 'tripkit-react';
import {overridePropsConfig as contextConfig} from '../components/TKDocHelper';

const config = {
    apiKey: 'TRIPGO_API_KEY', 
    TKUIRoutingQueryInput: {
        props: (origProps) => ({
            title: "Find trips",
            onClearClicked: () => {
                alert("Collateral effect here");
                origProps.onClearClicked && origProps.onClearClicked(); 
            }
        })
    },
    ...contextConfig
};

<TKRoot config={config}>
    <div style={{height: '500px'}}>
        <TKUITripPlanner/>
    </div>
</TKRoot>
```

[//]: # "Other possiblity is to have a renderTransportBtn that allows rendering the transports button other way, e.g.
as an image."