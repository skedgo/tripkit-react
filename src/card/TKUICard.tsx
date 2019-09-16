import React from "react";
import Drawer from 'react-drag-drawer';
import {ReactComponent as IconRemove} from '../images/ic-cross.svg'
import './TKUICard.css';

interface IProps {
    title: string;
    renderSubHeader?: () => JSX.Element;
    onRequestClose?: () => void;
}

class TKUICard extends React.Component<IProps, {}> {

    // Pass as parameter, or put in global config
    private asCard: boolean = true;

    public render(): React.ReactNode {
        const body =
            <div className={"TKUICard-main"}>
                <div className="ServiceDepartureTable-header">
                    <div className="gl-flex gl-space-between gl-align-center">
                        <div className="ServiceDepartureTable-title gl-grow">
                            {this.props.title}
                        </div>
                        <button onClick={this.props.onRequestClose} className="ServiceDepartureTable-btnClear"
                                aria-hidden={true}>
                            <IconRemove aria-hidden={true}
                                        className="ServiceDepartureTable-iconClear gl-svg-fill-currColor"
                                        focusable="false"/>
                        </button>
                    </div>
                    {this.props.renderSubHeader && this.props.renderSubHeader()}
                </div>
                <div className={"gl-scrollable-y"}>
                    {this.props.children}
                </div>
            </div>;
        return (
            this.asCard ?
            <Drawer
                open={true}
                containerElementClass="TripPlanner-serviceModal"
                modalElementClass="TripPlanner-serviceModalContainer app-style"
                allowClose={false}
                dontApplyListeners={true}
            >
                {body}
            </Drawer> : body
        );
    }
}

export default TKUICard;