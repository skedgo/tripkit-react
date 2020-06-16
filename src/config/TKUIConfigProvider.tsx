import * as React from "react";
import {TKUIConfig} from "./TKUIConfig";
import {generateClassNameSeed, tKUIDeaultTheme, TKUITheme} from "../jss/TKUITheme";
import {JssProvider, ThemeProvider} from "react-jss";
import GATracker from "../analytics/GATracker";
import Util from "../util/Util";
import {IOptionsContext, default as OptionsProvider, OptionsContext} from "../options/OptionsProvider";

export const TKUIConfigContext = React.createContext<TKUIConfig>({} as TKUIConfig);

class TKUIConfigProvider extends React.Component<{config: TKUIConfig},{}> {

    public render(): React.ReactNode {
        const customThemeCreator = this.props.config && this.props.config.theme;
        return (
            <OptionsProvider>
                <OptionsContext.Consumer>
                    {(optionsContext: IOptionsContext) => {
                        // Light mode by default
                        const isDark = optionsContext.value.isDarkMode === true ||
                            (optionsContext.value.isDarkMode === undefined && this.props.config.isDarkDefault === true);
                        const customTheme = Util.isFunction(customThemeCreator) ?
                            (customThemeCreator as ((isDark: boolean) => TKUITheme))(isDark) : customThemeCreator;
                        return <TKUIConfigContext.Provider value={{...this.props.config}}>
                            <JssProvider generateClassName={generateClassNameSeed}>
                                <ThemeProvider theme={{...tKUIDeaultTheme(isDark), ...customTheme}}>
                                    <>
                                        {this.props.children}
                                    </>
                                </ThemeProvider>
                            </JssProvider>
                        </TKUIConfigContext.Provider>;
                    }}
                </OptionsContext.Consumer>
            </OptionsProvider>
        );
    }

    public componentDidMount() {
        const config = this.props.config;
        if (config.analytics && config.analytics.google) {
            const gaConfig = config.analytics.google;
            GATracker.initialize(Array.isArray(gaConfig.tracker) ? gaConfig.tracker : [gaConfig.tracker],
                gaConfig.initOptions);
        }
    }

}

export default TKUIConfigProvider;