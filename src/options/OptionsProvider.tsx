import * as React from "react";
import OptionsData from "../data/OptionsData";
import TKUserProfile from "../model/options/TKUserProfile";
import {EventSubscription} from "fbemitter";

export interface IOptionsContext {
    userProfile: TKUserProfile;
    onUserProfileChange: (value: TKUserProfile) => void;
    showUserProfile: boolean;
    setShowUserProfile: (show: boolean) => void;
}

export const OptionsContext = React.createContext<IOptionsContext>({
    userProfile: new TKUserProfile(),
    onUserProfileChange: (value: TKUserProfile) => {
        // Not empty
    },
    showUserProfile: false,
    setShowUserProfile: (show: boolean) => {
        // Not empty
    }
});

interface IProps {
    defaultValue?: TKUserProfile;
    reset?: boolean;
}

class OptionsProvider extends React.Component<IProps, {value: TKUserProfile, show: boolean}> {

    eventSubscription: EventSubscription;
    
    private static didReset: boolean = false;

    constructor(props: IProps) {
        super(props);
        
        if (props.reset && !OptionsProvider.didReset && OptionsData.instance.existsInLS()) {
            OptionsProvider.didReset = true;
            OptionsData.instance.save(props.defaultValue ?? new TKUserProfile());
        } else if (!OptionsData.instance.existsInLS() && props.defaultValue) {
            OptionsData.instance.save(props.defaultValue);
        }
        
        this.state = {
            value: OptionsData.instance.get(),
            show: false
        };
        // In case options are changed directly through OptionsData. In the future probably the provider should be
        // the only way to update options, so next line will no longer be needed.
        this.eventSubscription = OptionsData.instance.addChangeListener((update: TKUserProfile) => this.setState({value: update}));
        this.onChange = this.onChange.bind(this);
        this.setShow = this.setShow.bind(this);
    }

    private onChange(value: TKUserProfile): void {
        OptionsData.instance.save(value);
        this.setState({
            value: value
        });
    }

    private setShow(show: boolean): void {
        this.setState({
            show: show
        });
    }

    public render(): React.ReactNode {
        return (
            <OptionsContext.Provider
                value={{
                    userProfile: this.state.value,
                    onUserProfileChange: this.onChange,
                    showUserProfile: this.state.show,
                    setShowUserProfile: this.setShow
                }}>
                {this.props.children}
            </OptionsContext.Provider>
        );
    }

    public componentWillUnmount() {
        this.eventSubscription.remove();
    }
}

export default OptionsProvider;