import * as React from "react";
import ITKUIConfig, {tKUIDefaultConfig} from "./TKUIConfig";

export const TKUIConfigContext = React.createContext<ITKUIConfig>({} as ITKUIConfig);

class TKUIConfigProvider extends React.Component<{config?: Partial<ITKUIConfig>},{}> {

    public render(): React.ReactNode {
        return (
            <TKUIConfigContext.Provider value={{...tKUIDefaultConfig, ...this.props.config}}>
                {this.props.children}
            </TKUIConfigContext.Provider>
        );
    }

}

export default TKUIConfigProvider;