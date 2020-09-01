Location search component (TKUILocationBox, used by TKUIRoutingQueryInput and TKUILocationSearch) provides 
autocompletion of addresses and POIs based on a customizable set of data sources. 
The [geocoding config property] allows the specification of the set of geocoding sources to consider, as well as
a compare function to sort and prioritize results coming from different sources, and analogResults function 
to detect analog (duplicate) results between different data sources. 

Data sources included by default are: 

- SkedGo geocoder, for public transport stops and stations.
- Cities geocoder, with supported cities.
- Favourites, with locations saved as favourites by the user.
- Recent, with locations recently referenced by the user.
- User geolocation, autocompleating with 'Current Location'.

SEGUIR ACÁ:

- customization (adding, removing) of data sources.
- available geocoder implementations: Pelias, and Static.
- implement your own: extend IGeocoder (warn: not typescript).


Geocoding data sources used by location search component 
(TKUILocationBox, building block for TKUIRoutingQueryInput and TKUILocationSearch) 

provides 
autocompletion of addresses and POIs based on a customizable set of data sources.


- TKSkedGoGeocoder for public transport stops and stations. This is included by default.
- TKPeliasGeocoder for use with any Pelias-powered geocoder.
- TKStaticGeocoder to define a custom set of locations, known client-side, to be surfaced in autocompletion. Instances 
of this type of source are included for user favourites, user recent searches, and supported cities. 
