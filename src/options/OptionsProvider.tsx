import * as React from "react";
import OptionsData from "../data/OptionsData";
import TKUserProfile from "../model/options/TKUserProfile";

export interface IOptionsContext {
    value: TKUserProfile,
    onChange: (value: TKUserProfile) => void
}

export const OptionsContext = React.createContext<IOptionsContext>({
    value: new TKUserProfile(),
    onChange: (value: TKUserProfile) => {
        // Not empty
    }
});

class OptionsProvider extends React.Component<{}, {value: TKUserProfile}> {

    constructor(props: {}) {
        super(props);
        this.state = {
            value: OptionsData.instance.get()
        };
        // In case options are changed directly through OptionsData. In the future probably the provider should be
        // the only way to update options, so next line will no longer be needed.
        OptionsData.instance.addChangeListener((update: TKUserProfile) => this.setState({value: update}));
        this.onChange = this.onChange.bind(this);
    }

    private onChange(value: TKUserProfile): void {
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