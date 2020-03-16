import React from "react";
import injectSheet, {ClassNameMap} from "react-jss";
import Drawer from 'react-drag-drawer';
import classNames from "classnames";


const styles = {
    containerElement: {
        zIndex: '1002!important',
        left: '0!important',
        right: '0!important',
        overflowX: 'visible',
        background: 'none!important'
    },
    modalElement: {
        top: '0',
        width: '100%',
        height: '100%',
        minHeight: '550px',
        borderTopLeftRadius: '4px',
        borderTopRightRadius: '4px',
        position: 'absolute',
        left: '0',
        right: '0'
    },
    contElemTouching: {
        // marginTop: '-550px'
        // marginTop: '-350px'
        marginTop: '-250px'
        // marginTop: '-150px'
    },
    modalElementTouching: {
        // marginTop: '550px'
        // marginTop: '350px'
        marginTop: '250px'
        // marginTop: '150px'
    },
    modalUp: {
        top: (props: IProps) => props.modalUp!.top + props.modalUp!.unit + '!important'
    },
    modalMiddle: {
        top: (props: IProps) => props.modalMiddle!.top + props.modalMiddle!.unit + '!important'
    },
    modalDown: {
        top: (props: IProps) => props.modalDown!.top + props.modalDown!.unit + '!important'
    },
    modalHidden: {
        top: (props: IProps) => "100%!important"
    }
};

export enum TKUISlideUpPosition {
    UP, MIDDLE, DOWN, HIDDEN
}

export interface TKUISlideUpOptions {
    initPosition?: TKUISlideUpPosition;
    modalUp?: {top: number, unit: string};
    modalMiddle?: {top: number, unit: string};
    modalDown?: {top: number | string, unit: string};
    // For controlled positioning. If set (not undefined), it takes precedence over this.state.position.
    position?: TKUISlideUpPosition;
    onPositionChange?: (position: TKUISlideUpPosition) => void;
    draggable?: boolean;
}

interface IProps extends TKUISlideUpOptions {
    containerClass?: string;
    modalClass?: string;
    classes: ClassNameMap<any>;
    open?: boolean;
    onDrag?: () => void;
    onDragEnd?: () => void;
    handleRef?: any;
}

interface IState {
    position: TKUISlideUpPosition;
    touching: boolean;
}

class TKUISlideUp extends React.Component<IProps, IState> {

    public static defaultProps: Partial<IProps> = {
        initPosition: TKUISlideUpPosition.UP,
        modalUp: {top: 5, unit: 'px'},
        modalMiddle: {top: 50, unit: '%'},
        modalDown: {top: 90, unit: '%'},
        open: true,
        draggable: true
    };

    private dragHandleRef: any;
    private testCardContRef: any;
    private scrolling: any;
    private dragging: boolean = false;
    private justTouched: boolean = false;
    private justTouchedTimeout: any;

    // TODO: Cleanup code: remove this field and hardcode behaviour to dragUpEnabled = false;
    private dragUpEnabled = false;

    constructor(props: IProps) {
        super(props);
        this.state = {
            position: props.position !== undefined ? props.position : props.initPosition!,
            touching: false
        };
        this.onDragHandleRef = this.onDragHandleRef.bind(this);
        this.onTouchStart = this.onTouchStart.bind(this);
        this.onTouchEnd = this.onTouchEnd.bind(this);
        this.getPosition = this.getPosition.bind(this);
        this.onPositionChange = this.onPositionChange.bind(this);
        this.onHandleClicked = this.onHandleClicked.bind(this);
    }

    private onTouchStart(e: any) {
        this.setState({touching: true});
        this.setJustTouched(true);
    }

    private getPosition(): TKUISlideUpPosition {
        return this.props.position !== undefined ? this.props.position : this.state.position;
    }

    private onTouchEnd() {
        this.setState({touching: false});
        if (this.getPosition() === TKUISlideUpPosition.UP && getTranslate3d(this.dragHandleRef)[1] > 300) {
            this.onPositionChange(TKUISlideUpPosition.DOWN);
        } else if (this.getPosition() === TKUISlideUpPosition.UP && getTranslate3d(this.dragHandleRef)[1] > 100) {
            this.onPositionChange(TKUISlideUpPosition.MIDDLE);
        } else if (this.getPosition() === TKUISlideUpPosition.MIDDLE && getTranslate3d(this.dragHandleRef)[1] > 100) {
            this.onPositionChange(TKUISlideUpPosition.DOWN);
        }
        this.setDragging(false);
        this.setJustTouched(false);
    }

    private setJustTouched(start: boolean) {
        if (this.justTouchedTimeout) {
            clearTimeout(this.justTouchedTimeout);
        }
        this.justTouched = true;
        if (!start) { // touchend
            this.justTouchedTimeout = setTimeout(() => this.justTouched = false, 1000);
        }
    }

    private onPositionChange(position: TKUISlideUpPosition) {
        this.setState({position: position});
        this.props.onPositionChange && this.props.onPositionChange(position);
    }

    private onDragHandleRef(ref: any) {
        this.dragHandleRef = ref;
        this.dragHandleRef.addEventListener("touchstart", this.onTouchStart);
        this.dragHandleRef.addEventListener("touchend", this.onTouchEnd);
    }
    
    private positionToClass(position: TKUISlideUpPosition, classes: ClassNameMap<any>): string {
        switch (position) {
            case TKUISlideUpPosition.UP: return classes.modalUp;
            case TKUISlideUpPosition.MIDDLE: return classes.modalMiddle;
            case TKUISlideUpPosition.DOWN: return classes.modalDown;
            default: return classes.modalHidden;
        }
    }

    private setDragging(dragging: boolean) {
        if (this.dragging != dragging) {
            this.dragging = dragging;
            if (dragging) {
                this.props.onDrag && this.props.onDrag();
            } else {
                this.props.onDragEnd && this.props.onDragEnd();
            }
        }
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
        return (
            <Drawer
                open={this.props.open}
                containerElementClass={classNames(classes.containerElement, this.props.containerClass,
                    this.positionToClass(this.getPosition(), classes),
                    this.state.touching && this.getPosition() !== TKUISlideUpPosition.UP ? classes.contElemTouching : undefined
                )}
                modalElementClass={classNames(classes.modalElement, this.props.modalClass,
                    this.state.touching && this.getPosition() !== TKUISlideUpPosition.UP ? classes.modalElementTouching : undefined)}
                allowClose={false}
                inViewportChage={() => console.log("vp change")}
                parentElement={document.body}
                getContainerRef={(ref: any) => {
                    this.testCardContRef = ref;
                    this.testCardContRef &&
                    this.testCardContRef.addEventListener("scroll", () => {
                        // If scroll was not triggered by user touch, then it was triggered by content (children) grow,
                        // (e.g. when departure rows appear) so shouldn't update position in this case, and also should
                        // avoid scrolling.
                        if (!this.justTouched) {
                            this.testCardContRef.scrollTop = 0;
                            return;
                        }

                        if (!this.dragUpEnabled) {
                            // this.testCardContRef.scrollTop = 0;
                            if (this.getPosition() === TKUISlideUpPosition.DOWN && this.testCardContRef.scrollTop > 0) {
                                // this.onPositionChange(TKUISlideUpPosition.MIDDLE);
                                this.onPositionChange(TKUISlideUpPosition.UP);
                                this.testCardContRef.scrollTop = 0;
                                this.setDragging(false);
                            }
                            else if (this.getPosition() === TKUISlideUpPosition.MIDDLE && this.testCardContRef.scrollTop > 0) {
                                this.onPositionChange(TKUISlideUpPosition.UP);
                                this.testCardContRef.scrollTop = 0;
                                this.setDragging(false);
                            }
                            return;
                        }

                        window.clearTimeout(this.scrolling);
                        // console.log("scroll: " + this.testCardContRef.scrollTop);
                        if (this.getPosition() === TKUISlideUpPosition.UP) {
                            this.testCardContRef.scrollTop = 0;
                        }
                        if (!this.state.touching) {
                            if (this.getPosition() === TKUISlideUpPosition.DOWN && this.testCardContRef.scrollTop > 0) {
                                this.onPositionChange(TKUISlideUpPosition.UP);
                                this.testCardContRef.scrollTop = 0;
                                this.setDragging(false);
                            }
                            if (this.getPosition() === TKUISlideUpPosition.DOWN && this.testCardContRef.scrollTop > 0) {
                                this.onPositionChange(TKUISlideUpPosition.MIDDLE);
                                this.testCardContRef.scrollTop = 0;
                                this.setDragging(false);
                            } else if (this.getPosition() === TKUISlideUpPosition.MIDDLE && this.testCardContRef.scrollTop > 0) {
                                this.onPositionChange(TKUISlideUpPosition.UP);
                                this.testCardContRef.scrollTop = 0;
                                this.setDragging(false);
                            }
                            return;
                        }
                        this.scrolling = setTimeout(() => {
                            if (!this.state.touching) {
                                // if (this.getPosition() === TKUISlideUpPosition.DOWN) {
                                //     this.onPositionChange(TKUISlideUpPosition.UP);
                                //     this.testCardContRef.scrollTop = 0;
                                //     this.setDragging(false);
                                // }
                                if (this.getPosition() === TKUISlideUpPosition.DOWN && this.testCardContRef.scrollTop > 250) {
                                    this.onPositionChange(TKUISlideUpPosition.UP);
                                    this.testCardContRef.scrollTop = 0;
                                    this.setDragging(false);
                                } else if (this.getPosition() === TKUISlideUpPosition.DOWN && this.testCardContRef.scrollTop > 0) {
                                    this.onPositionChange(TKUISlideUpPosition.MIDDLE);
                                    this.testCardContRef.scrollTop = 0;
                                    this.setDragging(false);
                                } else if (this.getPosition() === TKUISlideUpPosition.MIDDLE && this.testCardContRef.scrollTop > 0) {
                                    this.onPositionChange(TKUISlideUpPosition.UP);
                                    this.testCardContRef.scrollTop = 0;
                                    this.setDragging(false);
                                }
                            }
                        }, 70);

                        if (this.testCardContRef.scrollTop > 50) {
                            this.setDragging(true);
                        }
                    })
                }}
                getModalRef={(ref: any) => {
                    if (ref) {
                        this.onDragHandleRef(ref);
                    }
                }}
                onDrag={() => {
                    // console.log(getTranslate3d(this.dragHandleRef));
                    getTranslate3d(this.dragHandleRef)[1] > 50 && this.setDragging(true);
                }}
                dontApplyListeners={this.props.draggable === false}
            >
                {this.props.children}
            </Drawer>
        );
    }

    componentDidUpdate(prevProps: IProps) {
        if (prevProps.handleRef !== this.props.handleRef) {
            this.props.handleRef.addEventListener("click", this.onHandleClicked);
        }
    }
}

function getTranslate3d(el: any) {
    let values = el.style.transform.split(/\w+\(|\);?/);
    if (!values[1] || !values[1].length) {
        return [];
    }
    return values[1].split(/,\s?/g).map((coordS: string) => parseInt(coordS.slice(0, coordS.indexOf("px"))));
}

export default injectSheet(styles)(TKUISlideUp);