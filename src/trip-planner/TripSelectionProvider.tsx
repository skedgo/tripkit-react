import * as React from "react";
import Trip from "../model/trip/Trip";

export interface ITripSelectionContext {
    selected?: Trip,
    onChange: (select?: Trip) => void
}

export const TripSelectionContext = React.createContext<ITripSelectionContext>(
    {
        onChange: () => {
            // Not empty
        }});

class TripSelectionProvider extends React.Component<{}, { selected?: Trip }> {

    constructor(props: {}) {
        super(props);
        this.state = {};
        this.onChange = this.onChange.bind(this);
    }

    private onChange(select?: Trip): void {
        this.setState({
            selected: select
        });
    }

    public render(): React.ReactNode {
        return (
            <TripSelectionContext.Provider
                value={{
                    selected: this.state.selected,
                    onChange: this.onChange
                }}>
                {this.props.children}
            </TripSelectionContext.Provider>
        );
    }
}

export default TripSelectionProvider;