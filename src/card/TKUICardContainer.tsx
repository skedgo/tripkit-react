import * as React from "react";
import {TKUICardContextProps, TKUICardContext} from "../card/TKUICardProvider";
import TKUICard, {TKUICardClientProps} from "./TKUICard";

interface IProps {
    setRenderCardHandler: (handler: (props: TKUICardClientProps, id: any) => void) => void;
}

interface IState {
    cardProps: TKUICardClientProps;
}

// TODO: currently it just handles one card at a time. If want two or more cards rendered at a time (e.g. one on top of
// the other, even that other may be hidden but still rendered) then use the id to define a map of id to card props,
// stored in the state, and render all the cards from there. Also a list of id/s since probably need to maintain the
// order in which cards requested being displayed, so they are stacked properly on screen (the latest one being on top).
// Also considers the open property, and when set to false it removes from the map and list, which means it will stop
// showing the card. Using open = false as not rendered is ok since TKUICard currently handles it that way.

class TKUICardContainer extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);
        this.state = {
            cardProps: {
                open: false
            }
        };
        this.onRenderCard = this.onRenderCard.bind(this);
        props.setRenderCardHandler(this.onRenderCard)
    }

    public onRenderCard(props: TKUICardClientProps, id: any) {
        this.setState({cardProps: props});
    }

    public render(): React.ReactNode {
        return (
            <TKUICard {...this.state.cardProps}/>
        )
    }
}

const WithCardHandler = () =>
    <TKUICardContext.Consumer>
        {(cardContext: TKUICardContextProps) =>
            <TKUICardContainer
                setRenderCardHandler={cardContext.setRenderCardHandler}
            />
        }
    </TKUICardContext.Consumer>;

export default WithCardHandler;

