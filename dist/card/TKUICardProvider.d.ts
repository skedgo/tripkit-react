import * as React from "react";
import { TKUICardClientProps } from "./TKUICard";
export interface TKUICardContextProps {
    renderCard: (props: TKUICardClientProps, id: any) => void;
    setRenderCardHandler: (handler: (props: TKUICardClientProps, id: any) => void) => void;
}
export declare const TKUICardContext: React.Context<TKUICardContextProps>;
interface IState {
    cardProps: TKUICardClientProps;
}
declare class TKUICardProvider extends React.Component<{}, IState> {
    private renderCardHandler;
    render(): React.ReactNode;
}
export default TKUICardProvider;
