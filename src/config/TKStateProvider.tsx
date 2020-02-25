import * as React from "react";
import {TKUIConfig} from "./TKUIConfig";
import {IOptionsContext, default as OptionsProvider, OptionsContext} from "../options/OptionsProvider";
import ServiceResultsProvider from "../service/ServiceResultsProvider";
import RoutingResultsProvider from "../trip-planner/RoutingResultsProvider";
import TKUIConfigProvider from "./TKUIConfigProvider";
import RoutingQuery from "../model/RoutingQuery";
import TKFavouritesProvider from "../favourite/TKFavouritesProvider";
import TripGoApi from "../api/TripGoApi";
import TKI18nProvider from "../i18n/TKI18nProvider";

interface IProps {
    config: TKUIConfig;
    initQuery?: RoutingQuery;
}

class TKStateProvider extends React.Component<IProps,{}> {

    constructor(props: IProps) {
        super(props);
        TripGoApi.apiKey = props.config.apiKey;
    }

    public render(): React.ReactNode {
        return (
            <TKUIConfigProvider config={this.props.config}>
                <OptionsProvider>
                    <OptionsContext.Consumer>
                        {(optionsContext: IOptionsContext) => (
                            <RoutingResultsProvider
                                initQuery={this.props.initQuery}
                                initViewport={this.props.config.initViewport}
                                options={optionsContext && optionsContext.value}
                            >
                                <ServiceResultsProvider>
                                    <TKFavouritesProvider>
                                        <TKI18nProvider dataPromise={this.props.config.i18nPromise}>
                                            {this.props.children}
                                        </TKI18nProvider>
                                    </TKFavouritesProvider>
                                </ServiceResultsProvider>
                            </RoutingResultsProvider>
                        )}
                    </OptionsContext.Consumer>
                </OptionsProvider>
            </TKUIConfigProvider>
        )
    }

}

export default TKStateProvider;