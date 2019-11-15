import * as React from "react";
import {TKUIConfig} from "./TKUIConfig";

export const TKUIConfigContext = React.createContext<TKUIConfig>({} as TKUIConfig);

class TKUIConfigProvider extends React.Component<{config?: TKUIConfig},{}> {

    public render(): React.ReactNode {
        return (
            <TKUIConfigContext.Provider value={{...this.props.config}}>
                {this.props.children}
            </TKUIConfigContext.Provider>
        );
    }

}

export default TKUIConfigProvider;