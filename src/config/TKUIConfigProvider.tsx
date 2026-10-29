import React, { ReactNode, useContext, useEffect, useMemo } from "react";
import { IThemeCreatorProps, TKUIConfig } from "./TKUIConfig";
import { generateClassNameSeed, tKUIDeaultTheme, TKUITheme } from "../jss/TKUITheme";
import { JssProvider, ThemeProvider, useTheme } from "react-jss";
import GATracker from "../analytics/GATracker";
import Util from "../util/Util";
import { OptionsContext } from "../options/OptionsProvider";

export const TKUIConfigContext = React.createContext<TKUIConfig>({} as TKUIConfig);

export const TKUIThemeConsumer: React.FunctionComponent<{ children: (theme: TKUITheme) => React.ReactElement<any, any> | null }> =
    (props: { children: ((theme: TKUITheme) => React.ReactElement<any, any> | null) }) => {
        const theme = useTheme() as TKUITheme;
        return props.children(theme);
    };

interface IProps {
    config: TKUIConfig;
    children?: ReactNode;
}

interface IState {
    isOSDark: boolean,
    isOSHighContrast: boolean
}

const TKUIConfigProvider: React.FC<IProps> = (props: IProps) => {
    const { config, children } = props;
    const [isOSDark, setIsOSDark] = React.useState(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const [isOSHighContrast, setIsOSHighContrast] = React.useState(window.matchMedia && window.matchMedia('(prefers-contrast: more)').matches);

    useEffect(() => {
        if (config.analytics && config.analytics.google) {
            const gaConfig = config.analytics.google;
            GATracker.initialize(gaConfig);
        }
        const mediaQueryColorScheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
        if (mediaQueryColorScheme) {
            const onAppearanceChange = e =>
                setIsOSDark(e.matches);
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
                setIsOSHighContrast(e.matches);
            if (mediaQueryContrast.addEventListener) {
                mediaQueryContrast.addEventListener('change', onContrastChange)
            } else if (mediaQueryContrast.addListener) {
                // Need this for Safari and old browsers
                // (see https://developer.mozilla.org/en-US/docs/Web/API/MediaQueryList/addListener)
                mediaQueryContrast.addListener(onContrastChange)
            }
        }
    }, []);

    const customThemeCreator = config && config.theme;
    const optionsContext = useContext(OptionsContext);
    // Make isDarkMode to override the user setting.
    const isDark = config.isDarkMode ?? optionsContext.userProfile.isDarkMode ?? isOSDark;
    const isHighContrast = isOSHighContrast;
    // Avoid unnecesarily recreating the theme object on each render since it implies jss styles regeneration,
    // which cause issues, as css animations being re-triggered.
    const theme = useMemo(() => {
        const customTheme = Util.isFunction(customThemeCreator) ?
            (customThemeCreator as ((props: IThemeCreatorProps) => TKUITheme))({ isDark, isHighContrast }) : customThemeCreator;
        return { ...tKUIDeaultTheme({ isDark, isHighContrast }), ...customTheme };
    }, [customThemeCreator, isDark, isHighContrast]);
    return (
        <TKUIConfigContext.Provider value={{ ...config }}>
            <JssProvider generateId={generateClassNameSeed}>
                <ThemeProvider theme={theme}>
                    <>
                        {children}
                    </>
                </ThemeProvider>
            </JssProvider>
        </TKUIConfigContext.Provider>
    );
}

export default TKUIConfigProvider;