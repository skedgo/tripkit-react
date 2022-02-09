import * as React from "react";
import { TKUIConfig } from "./TKUIConfig";
import { IOptionsContext, default as OptionsProvider, OptionsContext } from "../options/OptionsProvider";
import ServiceResultsProvider from "../service/ServiceResultsProvider";
import RoutingResultsProvider, { IRoutingResultsContext, RoutingResultsContext } from "../trip-planner/RoutingResultsProvider";
import TKUIConfigProvider from "./TKUIConfigProvider";
import TKFavouritesProvider from "../favourite/TKFavouritesProvider";
import TripGoApi from "../api/TripGoApi";
import TKI18nProvider, { TKI18nContextProps, TKI18nContext } from "../i18n/TKI18nProvider";
import TKAccessibilityProvider from "./TKAccessibilityProvider";

interface IProps {
    config: TKUIConfig;
}

class TKStateProvider extends React.Component<IProps, {}> {

    constructor(props: IProps) {
        super(props);
        TripGoApi.apiKey = props.config.apiKey;
        if (props.config.server) {
            TripGoApi.server = props.config.server;
        }
        if (props.config.i18n) {
            TripGoApi.locale = Promise.resolve(props.config.i18n)
                .then(({ locale }) => locale);
        }
    }

    public render(): React.ReactNode {
        const config = this.props.config;
        return (
            <TKUIConfigProvider config={config}>
                <OptionsProvider>
                    <OptionsContext.Consumer>
                        {(optionsContext: IOptionsContext) =>
                            <TKAccessibilityProvider>
                                <TKI18nProvider dataPromise={config.i18n}>
                                    <TKI18nContext.Consumer>
                                        {(i18nProps: TKI18nContextProps) =>
                                            <RoutingResultsProvider
                                                initViewport={config.initViewport}
                                                fixToInitViewportRegion={config.fixToInitViewportRegion}
                                                options={optionsContext && optionsContext.userProfile}
                                                locale={i18nProps.locale}
                                            >
                                                <RoutingResultsContext.Consumer>
                                                    {(routingResultsContext: IRoutingResultsContext) =>
                                                        <ServiceResultsProvider
                                                            onSegmentServiceChange={routingResultsContext.onSegmentServiceChange}
                                                        >
                                                            <TKFavouritesProvider>
                                                                {this.props.children}
                                                            </TKFavouritesProvider>
                                                        </ServiceResultsProvider>
                                                    }
                                                </RoutingResultsContext.Consumer>
                                            </RoutingResultsProvider>
                                        }
                                    </TKI18nContext.Consumer>
                                </TKI18nProvider>
                            </TKAccessibilityProvider>
                        }
                    </OptionsContext.Consumer>
                </OptionsProvider>
            </TKUIConfigProvider>
        )
    }

    public componentDidUpdate() {
        if (TripGoApi.apiKey !== this.props.config.apiKey) {
            TripGoApi.apiKey = this.props.config.apiKey
        }
        if (TripGoApi.server !== this.props.config.server) {
            if (this.props.config.server) {
                TripGoApi.server = this.props.config.server
            } else {
                this.props.config.server = TripGoApi.SATAPP;
            }
        }
    }

}

export default TKStateProvider;