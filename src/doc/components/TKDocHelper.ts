import { tKRequestCurrentLocation } from '../../index';

export const commonConfig = {
    apiKey: '424353266689764a5f15b5dc7e619aa1',
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

export const queryMapConfig = {
    ...commonConfig
}