module.exports = {
    sections: [
        {
            name: 'Components API',
            content: 'doc/ComponentsAPI.md',
            components: [
                // 'src/model/LatLng.ts',
                // 'src/model/Location.ts',
                // 'src/model/BBox.ts',
                // 'src/model/trip/ModeInfo.ts',
                // 'src/config/TKUIConfig.tsx',

                // 'src/doc/ITest.ts',
                'src/doc/ITest2.ts',

                // 'src/options/TKUISlider.tsx',
                // 'src/location/TKUIW3w.tsx',
                // 'src/**/*.tsx',  // doesn't work

                // 'src/action/**/*.tsx',
                // 'src/alerts/**/*.tsx',
                // 'src/buttons/**/*.tsx',
                // 'src/card/**/*.tsx',
                // 'src/config/TKRoot.tsx',
                // 'src/config/TKStateConsumer.tsx',
                // 'src/config/TKUIConfig.tsx',
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
                // 'src/trip-planner/**/*.tsx'
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
            name: 'Styles API',
            components: [
                'src/location/TKUIW3w.css.ts',
            ]
        }
    ],

    // components: 'src/model/*.ts',
    // components: ['src/model/LatLng.ts','src/trip/TKUITripRow.tsx'],
    // components: ['src/model/LatLng.ts','src/trip/TKUITripRow.tsx'],
    // components: 'src/trip/TKUITripRow.tsx',
    propsParser: require('react-docgen-typescript').withCustomConfig(
        './tsconfig.json', {
            shouldRemoveUndefinedFromOptional: true
        }
    ).parse

    ,
    logger: {
        // One of: info, debug, warn
        // Suppress messages
        info: () => {},
        // Override display function
        warn: message => console.warn(`NOOOOOO: ${message}`)
    },

    handlers: componentPath => {
        console.log("Llegó acá!!!!!!");
        console.log(componentPath);
        return require('react-docgen').defaultHandlers.concat(
            (documentation, path) => {
                console.log("Documentation: ");
                console.log(documentation);
            },
            require('react-docgen-displayname-handler').createDisplayNameHandler(
                componentPath
            )
        );
    }
};