import * as React from "react";
import {TKUIConfig} from "./TKUIConfig";
import {generateClassNameSeed, tKUIDeaultTheme} from "../jss/TKUITheme";
import {JssProvider, ThemeProvider} from "react-jss";

export const TKUIConfigContext = React.createContext<TKUIConfig>({} as TKUIConfig);

class TKUIConfigProvider extends React.Component<{config: TKUIConfig},{}> {

    public render(): React.ReactNode {
        const customTheme = this.props.config && this.props.config.theme;
        return (
            <TKUIConfigContext.Provider value={{...this.props.config}}>
                <JssProvider generateClassName={generateClassNameSeed}>
                    <ThemeProvider theme={{...tKUIDeaultTheme, ...customTheme}}>
                        <>
                            {this.props.children}
                        </>
                    </ThemeProvider>
                </JssProvider>
            </TKUIConfigContext.Provider>
        );
    }

}

export default TKUIConfigProvider;