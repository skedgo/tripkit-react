import * as React from "react";
import { IThemeCreatorProps, TKUIConfig } from "./TKUIConfig";
import { generateClassNameSeed, tKUIDeaultTheme, TKUITheme } from "../jss/TKUITheme";
import { JssProvider, ThemeProvider, useTheme } from "react-jss";
import GATracker from "../analytics/GATracker";
import Util from "../util/Util";
import { IOptionsContext, default as OptionsProvider, OptionsContext } from "../options/OptionsProvider";

export const TKUIConfigContext = React.createContext<TKUIConfig>({} as TKUIConfig);

export const TKUIThemeConsumer: React.FunctionComponent<{ children: (theme: TKUITheme) => React.ReactElement<any, any> | null }> =
    (props: { children: ((theme: TKUITheme) => React.ReactElement<any, any> | null) }) => {
        const theme = useTheme() as TKUITheme;
        return props.children(theme);
    };

interface IProps {
    config: TKUIConfig
}

interface IState {
    isOSDark: boolean,
    isOSHighContrast: boolean
}

class TKUIConfigProvider extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);
        this.state = {
            isOSDark: window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches,
            isOSHighContrast: window.matchMedia && window.matchMedia('(prefers-contrast: more)').matches
        }
    }

    public render(): React.ReactNode {
        const customThemeCreator = this.props.config && this.props.config.theme;
        return (
            <OptionsContext.Consumer>
                {(optionsContext: IOptionsContext) => {
                    // Make isDarkDefault to override the user setting (should not be called 'Default').
                    const isDark = this.props.config.isDarkDefault ?? optionsContext.userProfile.isDarkMode ?? this.state.isOSDark;
                    const isHighContrast = this.state.isOSHighContrast;
                    const customTheme = Util.isFunction(customThemeCreator) ?
                        (customThemeCreator as ((props: IThemeCreatorProps) => TKUITheme))({ isDark, isHighContrast }) : customThemeCreator;
                    return (
                        <TKUIConfigContext.Provider value={{ ...this.props.config }}>
                            <JssProvider generateId={generateClassNameSeed}>
                                <ThemeProvider theme={{ ...tKUIDeaultTheme({ isDark, isHighContrast }), ...customTheme }}>
                                    <>
                                        {this.props.children}
                                    </>
                                </ThemeProvider>
                            </JssProvider>
                        </TKUIConfigContext.Provider>
                    );
                }}
            </OptionsContext.Consumer>
        );
    }

    public componentDidMount() {
        const config = this.props.config;
        if (config.analytics && config.analytics.google) {
            const gaConfig = config.analytics.google;
            GATracker.initialize(gaConfig);
        }
        const mediaQueryColorScheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
        if (mediaQueryColorScheme) {
            const onAppearanceChange = e =>
                this.setState({
                    isOSDark: e.matches
                });
            if (mediaQueryColorScheme.addEventListener) {
                mediaQueryColorScheme.addEventListener('change', onAppearanceChange)
            } else if (mediaQueryColorScheme.addListener) {
                // Need this for Safari and old browsers
                // (see https://developer.mozilla.org/en-US/docs/Web/API/MediaQueryList/addListener)
                mediaQueryColorScheme.addListener(onAppearanceChange)
            }
        }
        const mediaQueryContrast = window.matchMedia && window.matchMedia('(prefers-contrast: more)');
        if (mediaQueryContrast) {
            const onContrastChange = e =>
                this.setState({
                    isOSHighContrast: e.matches
                });
            if (mediaQueryContrast.addEventListener) {
                mediaQueryContrast.addEventListener('change', onContrastChange)
            } else if (mediaQueryContrast.addListener) {
                // Need this for Safari and old browsers
                // (see https://developer.mozilla.org/en-US/docs/Web/API/MediaQueryList/addListener)
                mediaQueryContrast.addListener(onContrastChange)
            }
        }
    }

}

export default TKUIConfigProvider;