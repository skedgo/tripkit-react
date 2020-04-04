import * as React from "react";
import {TKUICardClientProps} from "./TKUICard";

export interface TKUICardContextProps {
    renderCard: (props: TKUICardClientProps, id: any) => void;
    setRenderCardHandler: (handler: (props: TKUICardClientProps, id: any) => void) => void;
}

export const TKUICardContext = React.createContext<TKUICardContextProps>({
    renderCard: (props: TKUICardClientProps, id: any) => {},
    setRenderCardHandler: (handler: (props: TKUICardClientProps, id: any) => void) => {}
});

interface IState {
    cardProps: TKUICardClientProps
}

class TKUICardProvider extends React.Component<{}, IState> {

    private renderCardHandler: (props: TKUICardClientProps, id: any) => void = (props: TKUICardClientProps, id: any) => {};

    public render(): React.ReactNode {
        return (
            <TKUICardContext.Provider
                value={{
                    renderCard: (props: TKUICardClientProps, id: any) => {
                        this.renderCardHandler(props, id);
                    },
                    setRenderCardHandler: (handler: (props: TKUICardClientProps, id: any) => void) => {
                        this.renderCardHandler = handler;
                    }
                }}>
                {this.props.children}
            </TKUICardContext.Provider>
        );
    }
}

export default TKUICardProvider;