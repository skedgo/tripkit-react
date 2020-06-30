import React, {UIEventHandler} from "react";
import {TKUICardClientProps, TKUICardProps} from "./TKUICard";
import TKUIRendersCard from "../card/TKUIRendersCard";

interface IProps extends TKUICardClientProps {
    renderCard: (props: TKUICardClientProps, id: any) => void
}

class TKUICardRemote extends React.Component<IProps, {}> {

    constructor(props: IProps) {
        super(props);
        this.renderCard = this.renderCard.bind(this);
        this.renderCard();
    }

    /**
     * Call this function on construction and update, instead on render, since if on the latter a warn is triggered
     * by react that a render shouldn't have a collateral effect.
     */
    private renderCard(open?: boolean) {
        const {renderCard, ...cardProps} = this.props;
        renderCard({...cardProps, ...open !== undefined ? {open: open} : undefined}, this);
    }

    public render(): React.ReactNode {
        return null;
    }

    public componentDidUpdate() {
        this.renderCard();
    }

    public componentWillUnmount() {
        this.renderCard(false);
    }

}

const CardRemoteComponent = (props: TKUICardClientProps) =>
    <TKUIRendersCard>
        {(renderCard: (props: TKUICardClientProps, id: any) => void) =>
            <TKUICardRemote {...props} renderCard={renderCard}/>
        }
    </TKUIRendersCard>;

export default CardRemoteComponent