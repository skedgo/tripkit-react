const path = require('path');

module.exports = {
    title: 'TripKit React Components API',
    defaultExample: 'src/doc/ComponentDoc.md',
    sections: [
        {
            name: 'Main SDK component: TKRoot',
            content: 'docs/MainSDKComponent_TKRoot.md'
        },
        {
            name: 'Components API',
            content: 'docs/ComponentsAPI.md',
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
                'src/buttons/**/*.tsx',
                // 'src/card/**/*.tsx',
                'src/config/TKRoot.tsx',
                'src/config/TKStateConsumer.tsx',
                'src/config/TKUIConfig.tsx',
                // 'src/favourite/**/*.tsx',
                // 'src/feedback/**/*.tsx',
                // 'src/geocode/**/*.tsx',
                // 'src/location/**/*.tsx',
                // 'src/location_box/**/*.tsx',
                // 'src/map/**/*.tsx',
                // 'src/options/**/*.tsx',
                // 'src/query/**/*.tsx',
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
        }
    ],

    pagePerSection: true,

    // Override Styleguidist components
    styleguideComponents: {
        PropsRenderer: path.join(__dirname, 'src/doc/components/TKDocPropsRenderer.tsx'),
        TabButton: path.join(__dirname, 'src/doc/components/TKDocTabButton.tsx'),
    },

    propsParser: require('react-docgen-typescript').withCustomConfig(
        './tsconfig.json', {
            shouldRemoveUndefinedFromOptional: true
        }
    ).parse

};