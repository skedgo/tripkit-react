import * as React from "react";
import {TKUIConfig} from "./TKUIConfig";
import {generateClassNameSeed, tKUIDeaultTheme, TKUITheme} from "../jss/TKUITheme";
import {JssProvider, ThemeProvider, withTheme} from "react-jss";
import GATracker from "../analytics/GATracker";
import Util from "../util/Util";
import {IOptionsContext, default as OptionsProvider, OptionsContext} from "../options/OptionsProvider";

export const TKUIConfigContext = React.createContext<TKUIConfig>({} as TKUIConfig);

export const TKUIThemeConsumer: React.SFC<{children: (theme: TKUITheme) => React.ReactNode}> =
    withTheme((props: {theme: TKUITheme, children: ((theme: TKUITheme) => React.ReactNode)}) =>
    props.children(props.theme));

interface IProps {
    config: TKUIConfig
}

interface IState {
    isOSDark: boolean
}

class TKUIConfigProvider extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);
        this.state = {
            isOSDark: window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        }
    }

    public render(): React.ReactNode {
        const customThemeCreator = this.props.config && this.props.config.theme;
        return (
            <OptionsProvider>
                <OptionsContext.Consumer>
                    {(optionsContext: IOptionsContext) => {
                        // Light mode by default
                        const isDark = optionsContext.userProfile.isDarkMode === true
                            || (optionsContext.userProfile.isDarkMode === undefined && this.props.config.isDarkDefault === true)
                            || (optionsContext.userProfile.isDarkMode === undefined &&
                                this.props.config.isDarkDefault === undefined && this.state.isOSDark);
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
        const mediaQueryList = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
        if (mediaQueryList) {
            const onAppearenceChange = e =>
                this.setState({
                    isOSDark: e.matches
                });
            if (mediaQueryList.addEventListener) {
                mediaQueryList.addEventListener('change', onAppearenceChange)
            } else if (mediaQueryList.addListener) {
                // Need this for Safari and old browsers
                // (see https://developer.mozilla.org/en-US/docs/Web/API/MediaQueryList/addListener)
                mediaQueryList.addListener(onAppearenceChange)
            }
        }
    }

}

export default TKUIConfigProvider;