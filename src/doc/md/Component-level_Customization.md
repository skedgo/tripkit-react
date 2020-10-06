Besides global customizations (as theme or i18n) the SDK also allows customizations at component level, that is, 
you are able to customize features of a specific component. Component customization can be achieved by specifying  
on the SDK global config object (TKUIConfig) a property with the name of the component (e.g. 'TKUITripRow') and a 
component configuration object ([](TKComponentConfig)) as value.

Given you specify component customization through global SDK config then you are able customize any component at the root 
level, no matter how deep in the application hierarchy it's used. For instance, suppose you decide to use in your app 
[](TKUITripPlanner) component to render a full trip planner (or could be [](TKUIRoutingResultsView) component to display 
just trip results), and want to customize the trip row component, [](TKUITripRow), which is 
directly or indirectly used at some point by TKUITripPlanner. Then you just need to provide a customization object under 
'TKUITripRow' key on SDK config:

```js static
const config = {
    TKUITripRow: {
        // Customization
    }
}

<TKUIRoot config={config}>
    <TKUITripPlanner/>
</TKUIRoot>
```


In the following sections we document the different component features that can be customized through [](TKComponentConfig).