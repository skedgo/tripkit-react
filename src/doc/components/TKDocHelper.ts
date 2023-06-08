import OptionsData from "../../data/OptionsData";

export const commonConfig = {
    apiKey: '424353266689764a5f15b5dc7e619aa1',
    isDarkMode: false,
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
        state.onComputeTripsForQuery(true);
    }
};

export const queryMapConfig = {
    ...commonConfig
}

export function initDoc() {
    const userProfile = OptionsData.instance.get();
    userProfile.isDarkMode = false;
    OptionsData.instance.save(userProfile)
}

initDoc();