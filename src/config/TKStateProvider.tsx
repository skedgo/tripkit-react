import * as React from "react";
import {TKUIConfig} from "./TKUIConfig";
import {IOptionsContext, default as OptionsProvider, OptionsContext} from "../options/OptionsProvider";
import ServiceResultsProvider from "../service/ServiceResultsProvider";
import RoutingResultsProvider, {IRoutingResultsContext, RoutingResultsContext} from "../trip-planner/RoutingResultsProvider";
import TKUIConfigProvider from "./TKUIConfigProvider";
import TKFavouritesProvider from "../favourite/TKFavouritesProvider";
import TripGoApi from "../api/TripGoApi";
import TKI18nProvider, {TKI18nContextProps, TKI18nContext} from "../i18n/TKI18nProvider";
import TKUICardProvider from "../card/TKUICardProvider";

interface IProps {
    config: TKUIConfig;
}

class TKStateProvider extends React.Component<IProps,{}> {

    constructor(props: IProps) {
        super(props);
        TripGoApi.apiKey = props.config.apiKey;
    }

    public render(): React.ReactNode {
        const config = this.props.config;
        return (
            <TKUIConfigProvider config={config}>
                <OptionsProvider>
                    <OptionsContext.Consumer>
                        {(optionsContext: IOptionsContext) =>
                            <TKI18nProvider dataPromise={config.i18nPromise}>
                                <TKI18nContext.Consumer>
                                    {(i18nProps: TKI18nContextProps) =>
                                        <RoutingResultsProvider
                                            initViewport={config.initViewport}
                                            options={optionsContext && optionsContext.userProfile}
                                            locale={i18nProps.locale}
                                        >
                                            <RoutingResultsContext.Consumer>
                                                {(routingResultsContext: IRoutingResultsContext) =>
                                                    <ServiceResultsProvider
                                                        onSegmentServiceChange={routingResultsContext.onSegmentServiceChange}
                                                    >
                                                        <TKFavouritesProvider>
                                                            <TKUICardProvider>
                                                                {this.props.children}
                                                            </TKUICardProvider>
                                                        </TKFavouritesProvider>
                                                    </ServiceResultsProvider>
                                                }
                                            </RoutingResultsContext.Consumer>
                                        </RoutingResultsProvider>
                                    }
                                </TKI18nContext.Consumer>
                            </TKI18nProvider>
                        }
                    </OptionsContext.Consumer>
                </OptionsProvider>
            </TKUIConfigProvider>
        )
    }

}

export default TKStateProvider;