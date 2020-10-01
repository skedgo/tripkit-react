const commonConfig = {
    apiKey: '790892d5eae024712cfd8616496d7317',
    isDarkDefault: false,
};

export const multiTripsMockConfig = {
    ...commonConfig,
    onInitState: state => {
        // Set mock data
        const routingResultsJson = require("../data/routingResultsMuti.json");
        state.onTripJsonUrl(JSON.stringify(routingResultsJson));
    }
};

export const overridePropsConfig = {
    ...commonConfig,
    onInitState: state => {
        state.onDirectionsView(true);
    }
};