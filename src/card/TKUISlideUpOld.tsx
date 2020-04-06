import React from "react";
import injectSheet, {ClassNameMap} from "react-jss";
import Draggable, {DraggableData, DraggableEvent} from 'react-draggable';
import classNames from "classnames";
import {TKUISlideUpOptions, TKUISlideUpPosition} from "./TKUISlideUp";


const styles = {
    container: {
        position: 'absolute',
        top: 0,
        zIndex: '1002',
        height: '100%'
    }
};

interface IProps extends TKUISlideUpOptions {
    containerClass?: string;
    classes: ClassNameMap<any>;
    open?: boolean;
    onDrag?: () => void;
    onDragEnd?: () => void;
    handleRef?: any;
    draggable?: boolean;
}

interface IState {
    position: TKUISlideUpPosition;
    touching: boolean;
    top: number;
    deltaTop: number;
}

class TKUISlideUpOld extends React.Component<IProps, IState> {

    public static defaultProps: Partial<IProps> = {
        initPosition: TKUISlideUpPosition.UP,
        modalUp: {top: 5, unit: 'px'},
        modalMiddle: {top: 325, unit: 'px'},
        modalDown: {top: 650, unit: 'px'},
        open: true,
        draggable: true
    };

    constructor(props: IProps) {
        super(props);
        this.state = {
            position: this.props.position ? this.props.position : props.initPosition!,
            touching: false,
            top: this.getTopFromPosition(props.initPosition!),
            deltaTop: 0

        };
        this.onStart = this.onStart.bind(this);
        this.onDrag = this.onDrag.bind(this);
        this.onStop = this.onStop.bind(this);
        this.onPositionChange = this.onPositionChange.bind(this);
        this.onHandleClicked = this.onHandleClicked.bind(this);
    }

    private onPositionChange(position: TKUISlideUpPosition) {
        this.setState({
            position: position,
            top: this.getTopFromPosition(position)
        });
        this.props.onPositionChange && this.props.onPositionChange(position);
    }

    private getTopFromPosition(position: TKUISlideUpPosition): number {
        switch (position) {
            case TKUISlideUpPosition.UP: return this.props.modalUp!.top;
            case TKUISlideUpPosition.MIDDLE: return this.props.modalMiddle!.top;
            case TKUISlideUpPosition.DOWN: return this.props.modalDown!.top;
            default: return 0;
            // default: return "100%";
        }
    }

    private onStart(e: DraggableEvent, data: DraggableData): void | false {
        // If position is controlled, then disable drag.
        if (this.props.position) {
            return false;
        }
    }

    private onDrag(e: DraggableEvent, data: DraggableData): void | false {
        // If position is controlled, then disable drag.
        if (this.props.position) {
            return false;
        }
        this.setState({
            top: data.y,
            deltaTop: data.deltaY
        });
    }

    private onStop(e: DraggableEvent, data: DraggableData): void | false {
        // If position is controlled, then disable drag.
        if (this.props.position) {
            return false;
        }
        let targetPos: TKUISlideUpPosition;
        if (this.state.deltaTop > 0) {
            if (this.state.position === TKUISlideUpPosition.UP) {
                targetPos = this.state.top > this.getTopFromPosition(TKUISlideUpPosition.MIDDLE) ?
                    TKUISlideUpPosition.DOWN : TKUISlideUpPosition.MIDDLE;
            } else {
                targetPos = this.state.position === TKUISlideUpPosition.MIDDLE ? TKUISlideUpPosition.DOWN : this.state.position;
            }
        } else if (this.state.deltaTop < 0) {
            if (this.state.position === TKUISlideUpPosition.DOWN) {
                targetPos = this.state.top < this.getTopFromPosition(TKUISlideUpPosition.MIDDLE) ?
                    TKUISlideUpPosition.UP: TKUISlideUpPosition.MIDDLE;
            } else {
                targetPos = this.state.position === TKUISlideUpPosition.MIDDLE ? TKUISlideUpPosition.UP : this.state.position;
            }
        } else {    // This happens whe user taps the card.
            targetPos = this.state.position;
        }
        // To reflect card reached a definite position (user is not dragging it), so next a tap doesn't trigger a card
        // position change
        this.setState({
            deltaTop: 0
        });
        this.onPositionChange(targetPos);
    }

    private onHandleClicked() {
        if (this.state.position === TKUISlideUpPosition.DOWN) {
            this.onPositionChange(TKUISlideUpPosition.MIDDLE);
        } else if (this.state.position === TKUISlideUpPosition.MIDDLE) {
            this.onPositionChange(TKUISlideUpPosition.UP);
        }
    }

    public render(): React.ReactNode {
        const classes = this.props.classes;
        if (!this.props.open) {
            return null;
        }
        return (
            <Draggable
                axis="y"
                bounds={{
                    top: this.getTopFromPosition(TKUISlideUpPosition.UP),
                    bottom: this.getTopFromPosition(TKUISlideUpPosition.DOWN),
                    left: 0,
                    right: 0
                }}
                position={{x: 0, y: this.state.top}}
                onStart={this.onStart}
                onDrag={this.onDrag}
                onStop={this.onStop}
                disabled={this.props.draggable === false}
            >
                <div className={classNames(classes.container, this.props.containerClass)}>
                    {this.props.children}
                </div>
            </Draggable>
        );
    }

    componentDidUpdate(prevProps: IProps) {
        if (prevProps.handleRef !== this.props.handleRef) {
            this.props.handleRef && this.props.handleRef.addEventListener("click", this.onHandleClicked);
            // This ensures just the current handle has the handler, so it avoids associating
            // the handler more than once to a handle, e.g. when returning to the same page on TKUICardCarousel .
            if (prevProps.handleRef) {
                prevProps.handleRef.removeEventListener("click", this.onHandleClicked);
            }
        }
    }
}

export default injectSheet(styles)(TKUISlideUpOld);