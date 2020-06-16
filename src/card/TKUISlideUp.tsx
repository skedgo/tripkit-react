import React from "react";
import injectSheet, {ClassNameMap} from "react-jss";
import Draggable, {DraggableData, DraggableEvent} from 'react-draggable';
import classNames from "classnames";
import {cardSpacing} from "../jss/TKUITheme";

/**
 * Important: use react-draggable@4.2.0, since react-draggable@4.3.1 has a change involving touch events that breaks
 * scroll inside slide-up on touch devices. See change log:
 * https://github.com/STRML/react-draggable/blob/HEAD/CHANGELOG.md#430-apr-10-2020
 */

const styles = {
    container: {
        position: 'absolute',
        top: 0,
        zIndex: (props: IProps) => props.zIndex !== undefined ? props.zIndex : '1002',
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
    cardOnTop?: (onTop: boolean) => void;
}

interface IState {
    position: TKUISlideUpPosition;
    touching: boolean;
    top: number;
    deltaTop: number;
}

export enum TKUISlideUpPosition {
    UP, MIDDLE, DOWN, HIDDEN
}

export interface TKUISlideUpOptions {
    initPosition?: TKUISlideUpPosition;
    modalUp?: {top: number, unit: string};
    modalMiddle?: {top: number, unit: string};
    modalDown?: {top: number, unit: string};
    // For controlled positioning. If set (not undefined), it takes precedence over this.state.position.
    position?: TKUISlideUpPosition;
    onPositionChange?: (position: TKUISlideUpPosition) => void;
    draggable?: boolean;
    zIndex?: number;
}

class TKUISlideUp extends React.Component<IProps, IState> {

    // To get its height, allows to calculate percent units (TODO), and to properly set card height for scroll.
    private containerElem?: any;

    public static defaultProps: Partial<IProps> = {
        initPosition: TKUISlideUpPosition.UP,
        modalUp: {top: cardSpacing(), unit: 'px'},
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
            case TKUISlideUpPosition.UP: return this.props.modalUp!.unit === "%" ?
                this.props.modalUp!.top * containerHeight / 100 : this.props.modalUp!.top;
            case TKUISlideUpPosition.MIDDLE: return this.props.modalMiddle!.unit === "%" ?
                this.props.modalMiddle!.top * containerHeight / 100 : this.props.modalMiddle!.top;
            case TKUISlideUpPosition.DOWN: return this.props.modalDown!.unit === "%" ?
                this.props.modalDown!.top * containerHeight / 100 : this.props.modalDown!.top;
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
        const top = this.state.top;
        const deltaTop = this.state.deltaTop;
        if (top < this.getTopFromPosition(TKUISlideUpPosition.MIDDLE)) {
            // If deltaTop = 0, it means the user surpassed the top limits of the device screen, so go (stay) UP.
            targetPos = deltaTop <= 0 ? TKUISlideUpPosition.UP : TKUISlideUpPosition.MIDDLE;
        } else if (top > this.getTopFromPosition(TKUISlideUpPosition.MIDDLE)) {
            // If deltaTop = 0, it means the user surpassed the bottom limits of the device screen.
            targetPos = deltaTop >= 0 ? TKUISlideUpPosition.DOWN : TKUISlideUpPosition.MIDDLE;
        } else if (deltaTop !== 0) { // If top is exactly at MIDDLE position and deltaTop is not 0, then go DOWN or UP depending on deltaTop
            targetPos = deltaTop > 0 ? TKUISlideUpPosition.DOWN : TKUISlideUpPosition.UP;
        } else { // If top is exactly at MIDDLE position and deltaTop is 0, then it means the user tapped the card, so stay at MIDDLE.
            targetPos = TKUISlideUpPosition.MIDDLE;
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
                         if (ref && ref.parentElement !== this.containerElem) {
                             this.containerElem = ref.parentElement;
                             this.onPositionChange(this.getPosition());
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

    componentDidUpdate(prevProps: IProps, prevState: IState) {
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
        if (this.props.cardOnTop &&
            (prevProps.position !== this.props.position || prevState.position !== this.state.position
                || prevState.top !== this.state.top)) {
            this.props.cardOnTop(this.state.top === this.getTopFromPosition(TKUISlideUpPosition.UP));
        }
        // Top from position changed due to a change on current position top prop change
        // (this.props.modalXXX.top). E.g. this.props.modalUp.top may have changed due to
        // a switch between landscape / portrait orientation.
        if (prevProps.position === this.props.position && prevState.position === this.state.position &&
            this.state.top !== this.getTopFromPosition(this.state.position)) {
            this.onPositionChange(this.getPosition());
        }
    }
}

export default injectSheet(styles)(TKUISlideUp);