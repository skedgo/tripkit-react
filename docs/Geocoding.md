Location search component (TKUILocationBox, used by TKUIRoutingQueryInput and TKUILocationSearch) provides 
autocompletion of addresses and POIs based on a customizable set of data sources. 
The [geocoding config property] allows the specification of the set of geocoding sources to consider, as well as
a custom compare function to sort and prioritize results coming from different sources, and a function 
to detect analog (duplicate) results between different data sources. 

Data sources included by default are: 

- SkedGo geocoder, for public transport stops and stations.
- Cities geocoder, with supported cities.
- Favourites, with locations saved as favourites by the user.
- Recent, with locations recently referenced by the user.
- User geolocation, autocompleating with 'Current Location'.


You can add other data sources by providing [geocoder connector objects](), specifying 
the interface between the SDK and the geocoder services (autocompletion, search, reverse search, and getting place 
details). In particular, the SDK already provides a connector object builder for 
[Pelias geocoder](https://www.mapzen.com/products/search/geocoding/).

Next code illustrates how to specify the desired set of geocoders to consider, through ```geocoding``` config property.
Notice you can provide a function receiving the default value for geocoding property, so you can return a new 
configuration object based on that default. In this case we include just geolocation and skedgo geocoders from the 
default set, plus a connector for Pelias geocoder service provided by Geocode.earth.


```js static
import {TKPeliasGeocoder} from "../src/index";

const myPelias = new TKPeliasGeocoder("https://api.geocode.earth/v1", "MY_GEOCODE_EARTH_KEY");

const config = {
    apiKey: 'MY_TRIPGO_API_KEY',
    geocoding: (defaultOptions) => {
        const {geolocation, skedgo} = defaultOptions.geocoders;
        return {
            geocoders: {
                geolocation,
                skedgo,
                myPelias
            }
        }
    }
};
```