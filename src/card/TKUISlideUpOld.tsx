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

    // To get its height, allows to calculate percent units (TODO), and to properly set card height for scroll.
    private containerElem?: any;

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
        const position = this.props.position !== undefined ? this.props.position : props.initPosition!;
        this.state = {
            position: position,
            touching: false,
            top: this.getTopFromPosition(position),
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
        const containerHeight = this.containerElem ? this.containerElem.offsetHeight : 1000;
        switch (position) {
            case TKUISlideUpPosition.UP: return this.props.modalUp!.top;
            case TKUISlideUpPosition.MIDDLE: return this.props.modalMiddle!.top;
            case TKUISlideUpPosition.DOWN: return this.props.modalDown!.top;
            default: return containerHeight;
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
            if (this.getPosition() === TKUISlideUpPosition.UP) {
                targetPos = this.state.top > this.getTopFromPosition(TKUISlideUpPosition.MIDDLE) ?
                    TKUISlideUpPosition.DOWN : TKUISlideUpPosition.MIDDLE;
            } else {
                targetPos = this.getPosition() === TKUISlideUpPosition.MIDDLE ? TKUISlideUpPosition.DOWN : this.getPosition();
            }
        } else if (this.state.deltaTop < 0) {
            if (this.getPosition() === TKUISlideUpPosition.DOWN) {
                targetPos = this.state.top < this.getTopFromPosition(TKUISlideUpPosition.MIDDLE) ?
                    TKUISlideUpPosition.UP: TKUISlideUpPosition.MIDDLE;
            } else {
                targetPos = this.getPosition() === TKUISlideUpPosition.MIDDLE ? TKUISlideUpPosition.UP : this.getPosition();
            }
        } else {    // This happens whe user taps the card.
            targetPos = this.getPosition();
        }
        // To reflect card reached a definite position (user is not dragging it), so next a tap doesn't trigger a card
        // position change
        this.setState({
            deltaTop: 0
        });
        this.onPositionChange(targetPos);
    }

    private getPosition() {
        return this.props.position !== undefined ? this.props.position : this.state.position;
    }

    private onHandleClicked() {
        // If not draggable or position is controlled, do nothing.
        if (this.props.draggable === false || this.props.position) {
            return;
        }
        if (this.getPosition() === TKUISlideUpPosition.DOWN) {
            this.onPositionChange(TKUISlideUpPosition.MIDDLE);
        } else if (this.getPosition() === TKUISlideUpPosition.MIDDLE) {
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
                <div className={classNames(classes.container, this.props.containerClass)}
                     ref={(ref: any) => {
                         if (ref) {
                             this.containerElem = ref.parentElement
                         }
                     }}
                >
                    <div style={{
                        height: this.containerElem ?
                            (this.props.draggable !== false ?
                                this.containerElem.offsetHeight - this.getTopFromPosition(TKUISlideUpPosition.UP) + "px" :
                                this.containerElem.offsetHeight - this.state.top + "px") :
                            "100%"
                    }}>
                    {this.props.children}
                    </div>
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
        if (prevProps.position !== this.props.position) {
            this.onPositionChange(this.getPosition());
        }
    }
}

export default injectSheet(styles)(TKUISlideUpOld);