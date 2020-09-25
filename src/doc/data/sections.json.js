module.exports = {
    sections:
        [
            {
                name: 'Main SDK component: TKRoot',
                content: 'src/doc/md/MainSDKComponent_TKRoot.md'
            },
            {
                name: 'Customization',
                content: 'src/doc/md/Customization.md',
                sectionDepth: 1,
                usageMode: 'expand',
                sections: [
                    {
                        name: 'Theme',
                        content: 'src/doc/md/Theme.md',
                        exampleMode: 'expand',
                    },
                    {
                        name: 'I18n',
                        content: 'src/doc/md/I18n.md',
                        exampleMode: 'expand',
                    },
                    {
                        name: 'Geocoding',
                        content: 'src/doc/md/Geocoding.md',
                        exampleMode: 'expand'
                    },
                ]
            },
            {
                name: 'Components API',
                content: 'src/doc/md/ComponentsAPI.md',
                sectionDepth: 2,
                usageMode: 'expand',
                components: [
                    // 'src/model/LatLng.ts',
                    // 'src/model/Location.ts',
                    // 'src/model/BBox.ts',
                    // 'src/model/trip/ModeInfo.ts',
                    // 'src/config/TKUIConfig.tsx',
                    // 'src/options/TKUISlider.tsx',
                    'src/location/TKUIW3w.tsx',
                    // 'src/**/*.tsx',  // doesn't work

                    // 'src/action/**/*.tsx',
                    // 'src/alerts/**/*.tsx',
                    // 'src/buttons/**/*.tsx',
                    'src/buttons/TKUIButton.tsx',
                    'src/buttons/TKUISelect.tsx',
                    // 'src/card/**/*.tsx',
                    'src/config/TKRoot.tsx',
                    // 'src/favourite/**/*.tsx',
                    // 'src/feedback/**/*.tsx',
                    // 'src/geocode/**/*.tsx',
                    // 'src/location/**/*.tsx',
                    // 'src/location_box/**/*.tsx',
                    'src/map/TKUIMapView.tsx',
                    // 'src/options/**/*.tsx',
                    // 'src/query/**/*.tsx',
                    'src/query/TKUIRoutingQueryInput.tsx',
                    'src/query/TKUILocationSearch.tsx',
                    // 'src/service/**/*.tsx',
                    // 'src/share/**/*.tsx',
                    // 'src/sidebar/**/*.tsx',
                    // 'src/time/**/*.tsx',
                    // 'src/trip/**/*.tsx',
                    'src/trip/TKUIResultsView.tsx',
                    'src/trip/TKUITripRow.tsx',
                    'src/trip/TKUITripOverviewView.tsx',
                    // 'src/trip-planner/**/*.tsx'
                    'src/trip-planner/TKUITripPlanner.tsx'
                ],
                ignore: [
                    'src/service/ServiceResultsProvider.tsx',
                    'src/card/TKUICardContainer.tsx',
                    'src/card/TKUICardProvider.tsx',
                    'src/card/TKUIScrollForCard.tsx',
                    'src/card/TKUISlideUp.tsx',  // Doesn't show props
                    'src/**/*Provider.tsx', // Ignore all providers, with TKRoot it's enough for now.
                    'src/time/DateTimeHTML5Input.tsx',
                ]
            },
            {
                name: 'Model',
                sectionDepth: 2,
                usageMode: 'expand',
                components: [
                    'src/config/TKState.ts',
                    'src/model/LatLng.ts',
                    'src/model/Location.ts',
                    'src/model/BBox.ts',
                    'src/config/TKUIConfig.tsx',
                    'src/jss/TKUITheme.ts',
                    'src/geocode/TKGeocodingOptions.tsx',
                    'src/geocode/IGeocoder.ts',
                ]
            }
        ]
};