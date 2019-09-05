import * as React from "react";
import Options from "../model/Options";
import OptionsData from "../data/OptionsData";

export interface IOptionsContext {
    value: Options,
    onChange: (value: Options) => void
}

export const OptionsContext = React.createContext<IOptionsContext>({
    value: new Options(),
    onChange: (value: Options) => {
        // Not empty
    }
});

class OptionsProvider extends React.Component<{}, {value: Options}> {

    constructor(props: {}) {
        super(props);
        this.state = {
            value: OptionsData.instance.get()
        };
        // In case options are changed directly through OptionsData. In the future probably the provider should be
        // the only way to update options, so next line will no longer be needed.
        OptionsData.instance.addChangeListener((update: Options) => this.setState({value: update}));
        this.onChange = this.onChange.bind(this);
    }

    private onChange(value: Options): void {
        OptionsData.instance.save(value);
        this.setState({
            value: value
        });
    }

    public render(): React.ReactNode {
        return (
            <OptionsContext.Provider
                value={{
                    value: this.state.value,
                    onChange: this.onChange
                }}>
                {this.props.children}
            </OptionsContext.Provider>
        );
    }
}

export default OptionsProvider;