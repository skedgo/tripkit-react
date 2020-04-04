import * as React from "react";
import {TKUICardClientProps} from "./TKUICard";
import {TKUICardContextProps, TKUICardContext} from "../card/TKUICardProvider";

interface IProps {
    children: (renderCard: (props: TKUICardClientProps, id: any) => void) => React.ReactNode;
}

interface IState {
    props: TKUICardClientProps
}

class TKUIRendersCard extends React.Component<IProps, IState> {

    public render(): React.ReactNode {
        return (
            <TKUICardContext.Consumer>
                {(cardContext: TKUICardContextProps) => this.props.children(cardContext.renderCard)}
            </TKUICardContext.Consumer>
        );
    }

}

export default TKUIRendersCard;