module.exports = {
    sections:
        [
            {
                name: 'Main SDK component: TKRoot',
                content: 'src/doc/md/MainSDKComponent_TKRoot.md',
                exampleMode: 'expand'
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
                name: 'Component-level Customization',
                content: 'src/doc/md/Component-level_Customization.md',
                sectionDepth: 1,
                usageMode: 'expand',
                sections: [
                    {
                        name: 'Styles',
                        content: 'src/doc/md/Styles.md',
                        exampleMode: 'expand'
                    },
                    {
                        name: 'Render',
                        content: 'src/doc/md/Render.md',
                        exampleMode: 'expand'
                    },
                    {
                        name: 'Props Overrides',
                        content: 'src/doc/md/Props.md',
                        exampleMode: 'expand'
                    }
                ]
            },
            {
                name: 'Example Use Cases',
                content: 'src/doc/md/Example_Use_Cases.md'
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
                    'src/location/TKUILocationDetailView.tsx',
                    'src/location/TKUIW3w.tsx',
                    // 'src/**/*.tsx',  // doesn't work

                    // 'src/action/**/*.tsx',
                    // 'src/alerts/**/*.tsx',
                    // 'src/buttons/**/*.tsx',
                    'src/buttons/TKUIButton.tsx',
                    'src/buttons/TKUISelect.tsx',
                    'src/card/TKUICard.tsx',
                    'src/config/TKRoot.tsx',
                    // 'src/favourite/**/*.tsx',
                    // 'src/feedback/**/*.tsx',
                    // 'src/geocode/**/*.tsx',
                    // 'src/location/**/*.tsx',
                    // 'src/location_box/**/*.tsx',
                    'src/map/TKUIMapView.tsx',
                    // 'src/options/**/*.tsx',
                    'src/query/TKUIRoutingQueryInput.tsx',
                    'src/query/TKUILocationSearch.tsx',
                    // 'src/share/**/*.tsx',
                    // 'src/sidebar/**/*.tsx',
                    // 'src/time/**/*.tsx',
                    // 'src/trip/**/*.tsx',
                    'src/trip/TKUIRoutingResultsView.tsx',
                    'src/trip/TKUITripRow.tsx',
                    'src/trip/TKUITripOverviewView.tsx',
                    // 'src/trip-planner/**/*.tsx'
                    'src/trip-planner/TKUITripPlanner.tsx',
                    'src/service/TKUITimetableView.tsx',
                    'src/alert/TKUIAlertsView.tsx',
                    'src/favourite/TKUIFavouritesView.tsx',
                    'src/options/TKUIPrivacyOptionsView.tsx',
                    'src/options/TKUIProfileView.tsx',
                    'src/service/TKUIServiceView.tsx',
                    'src/options/TKUITransportOptionsView.tsx',
                    'src/options/TKUITransportSwitchesView.tsx',
                    'src/options/TKUIUserPriorities.tsx'

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
                content: 'src/doc/md/Model.md',
                sectionDepth: 2,
                usageMode: 'expand',
                components: [
                    'src/config/TKState.ts',
                    'src/model/RoutingQuery.ts',
                    'src/model/LatLng.ts',
                    'src/model/Location.ts',
                    'src/model/BBox.ts',
                    'src/model/trip/Trip.ts',
                    'src/model/trip/Segment.ts',
                    'src/config/TKUIConfig.tsx',
                    'src/config/TKComponentConfig.ts',
                    'src/jss/TKUITheme.ts',
                    'src/geocode/TKGeocodingOptions.tsx',
                    'src/geocode/IGeocoder.ts',
                    'src/card/TKUISlideUpOptions.ts',
                ]
            }
        ]
};