import React, { ReactNode, useContext } from "react";
import { TKUIConfig } from "./TKUIConfig";
import OptionsProvider, { IOptionsContext, OptionsContext } from "../options/OptionsProvider";
import ServiceResultsProvider, { ServiceResultsContext } from "../service/ServiceResultsProvider";
import RoutingResultsProvider, { IRoutingResultsContext, RoutingResultsContext } from "../trip-planner/RoutingResultsProvider";
import TKUIConfigProvider, { TKUIConfigContext } from "./TKUIConfigProvider";
import TKFavouritesProvider from "../favourite/TKFavouritesProvider";
import TripGoApi from "../api/TripGoApi";
import TKI18nProvider, { TKI18nContextProps, TKI18nContext } from "../i18n/TKI18nProvider";
import TKAccessibilityProvider, { TKAccessibilityContext } from "./TKAccessibilityProvider";
import TKState from "./TKState";

interface IProps {
    config: TKUIConfig;
    children?: ReactNode;
}

class TKStateProvider extends React.Component<IProps, {}> {

    constructor(props: IProps) {
        super(props);
        TripGoApi.apiKey = props.config.apiKey;
        if (props.config.apiServer) {
            TripGoApi.server = props.config.apiServer;
        }
        if (props.config.apiHeaders) {
            TripGoApi.apiHeadersOverride = props.config.apiHeaders;
        }
        if (props.config.i18n) {
            TripGoApi.locale = Promise.resolve(props.config.i18n)
                .then(({ locale }) => locale);
        }
    }

    public render(): React.ReactNode {
        const config = this.props.config;
        return (
            <OptionsProvider defaultValue={config.defaultUserProfile} reset={config.resetUserProfile}>
                <TKUIConfigProvider config={config}>
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
                                                preferredTripCompareFc={config.tripCompareFc}
                                                computeModeSetsBuilder={config.computeModeSetsBuilder}
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
                </TKUIConfigProvider>
            </OptionsProvider>
        )
    }

    public componentDidUpdate() {
        if (TripGoApi.apiKey !== this.props.config.apiKey) {
            TripGoApi.apiKey = this.props.config.apiKey
        }
        if (TripGoApi.server !== this.props.config.apiServer) {
            if (this.props.config.apiServer) {
                TripGoApi.server = this.props.config.apiServer
            } else {
                this.props.config.apiServer = TripGoApi.SATAPP;
            }
        }
    }

}

export function useTKState(): TKState {
    const config = useContext(TKUIConfigContext);
    const optionsContext = useContext(OptionsContext);
    const accessibilityContext = useContext(TKAccessibilityContext);
    const routingResultsContext = useContext(RoutingResultsContext);
    const serviceResultsContext = useContext(ServiceResultsContext);
    return { config, ...optionsContext, ...accessibilityContext, ...routingResultsContext, ...serviceResultsContext };
}

export default TKStateProvider;