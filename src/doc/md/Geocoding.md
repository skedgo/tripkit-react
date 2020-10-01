Location search component (TKUILocationBox, used by TKUIRoutingQueryInput and TKUILocationSearch) provides 
autocompletion of addresses and POIs based on a customizable set of data sources.
The set of geocoding sources to consider can be specified through the ```geocoding``` property on [](TKUIConfig), 
as well as a custom compare function to sort and prioritize results coming from different sources, and a function 
to detect analog (duplicate) results between different data sources. 

Data sources included by default are: 

- SkedGo geocoder, for public transport stops and stations.
- Cities geocoder, with supported cities.
- Favourites, with locations saved as favourites by the user.
- Recent, with locations recently referenced by the user.
- User geolocation, autocompleating with 'Current Location'.


You can add other data sources by providing [geocoder connector objects](IGeocoder), implementing the connection between the SDK 
and the geocoder services (autocompletion, search, reverse search, and getting place details). In particular, the SDK 
already provides a connector object builder for [Pelias geocoder](https://www.mapzen.com/products/search/geocoding/).

Next code illustrates how to specify, through the ```geocoding``` config property, the desired set of geocoders to consider.
Notice you can provide a function receiving the default value for the geocoding property, so you can build a new 
configuration object based on that default. In this case we include just _geolocation_ and _skedgo_ geocoder connectors from 
the default set, plus a Pelias connector (created through TKPeliasGeocoder connector builder) for the Pelias-based geocoding 
service provided by [Geocode.earth](https://geocode.earth/).


```js static
import {TKPeliasGeocoder} from 'tripkit-react';

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