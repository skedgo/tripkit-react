import React from "react";
import Drawer from 'react-drag-drawer';
import injectSheet, {ClassNameMap} from "react-jss";
import classNames from "classnames";
import genStyles from "../css/GenStyle.css";
import {tKUIColors} from "../jss/TKUITheme";
import DeviceUtil from "../util/DeviceUtil";


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
        maxWidth: '700px',
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
    }
};

export enum TKUISlideUpPosition {
    UP, MIDDLE, DOWN
}

export interface TKUISlideUpOptions {
    initPosition?: TKUISlideUpPosition;
    modalUp?: {top: number, unit: string};
    modalMiddle?: {top: number, unit: string};
    modalDown?: {top: number, unit: string};
    onPositionChange?: (position: TKUISlideUpPosition) => void;
}

interface IProps extends TKUISlideUpOptions {
    containerClass?: string;
    modalClass?: string;
    classes: ClassNameMap<any>;
    open?: boolean;
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
        open: true
    };

    private dragHandleRef: any;
    private testCardContRef: any;
    private scrolling: any;

    constructor(props: IProps) {
        super(props);
        this.state = {
            position: props.initPosition!,
            touching: false
        };
        this.onDragHandleRef = this.onDragHandleRef.bind(this);
        this.onTouchStart = this.onTouchStart.bind(this);
        this.onTouchEnd = this.onTouchEnd.bind(this);
    }

    private onTouchStart(e: any) {
        this.setState({touching: true});
    }

    private onTouchEnd() {
        this.setState({touching: false});
        if (this.state.position === TKUISlideUpPosition.UP && getTranslate3d(this.dragHandleRef)[1] > 300) {
            this.onPositionChange(TKUISlideUpPosition.DOWN);
        } else if (this.state.position === TKUISlideUpPosition.UP && getTranslate3d(this.dragHandleRef)[1] > 100) {
            this.onPositionChange(TKUISlideUpPosition.MIDDLE);
        } else if (this.state.position === TKUISlideUpPosition.MIDDLE && getTranslate3d(this.dragHandleRef)[1] > 100) {
            this.onPositionChange(TKUISlideUpPosition.DOWN);
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
            default: return classes.modalDown;
        }
    }

    public render(): React.ReactNode {
        const classes = this.props.classes;
        return (
            <Drawer
                open={this.props.open}
                containerElementClass={classNames(classes.containerElement, this.props.containerClass,
                    this.positionToClass(this.state.position, classes),
                    this.state.touching && this.state.position !== TKUISlideUpPosition.UP ? classes.contElemTouching : undefined
                )}
                modalElementClass={classNames(classes.modalElement, this.props.modalClass,
                    this.state.touching && this.state.position !== TKUISlideUpPosition.UP ? classes.modalElementTouching : undefined)}
                allowClose={false}
                inViewportChage={() => console.log("vp change")}
                parentElement={document.body}
                getContainerRef={(ref: any) => {
                    this.testCardContRef = ref;
                    this.testCardContRef &&
                    this.testCardContRef.addEventListener("scroll", () => {
                        window.clearTimeout(this.scrolling);
                        if (this.state.position === TKUISlideUpPosition.UP) {
                            this.testCardContRef.scrollTop = 0;
                        }
                        if (!this.state.touching) {
                            if (this.state.position === TKUISlideUpPosition.DOWN && this.testCardContRef.scrollTop > 0) {
                                this.onPositionChange(TKUISlideUpPosition.MIDDLE);
                                this.testCardContRef.scrollTop = 0;
                            } else if (this.state.position === TKUISlideUpPosition.MIDDLE && this.testCardContRef.scrollTop > 0) {
                                this.onPositionChange(TKUISlideUpPosition.UP);
                                this.testCardContRef.scrollTop = 0;
                            }
                            return;
                        }
                        this.scrolling = setTimeout(() => {
                            if (!this.state.touching) {
                                if (this.state.position === TKUISlideUpPosition.DOWN && this.testCardContRef.scrollTop > 250) {
                                    this.onPositionChange(TKUISlideUpPosition.UP);
                                    this.testCardContRef.scrollTop = 0;
                                } else if (this.state.position === TKUISlideUpPosition.DOWN && this.testCardContRef.scrollTop > 0) {
                                    this.onPositionChange(TKUISlideUpPosition.MIDDLE);
                                    this.testCardContRef.scrollTop = 0;
                                } else if (this.state.position === TKUISlideUpPosition.MIDDLE && this.testCardContRef.scrollTop > 0) {
                                    this.onPositionChange(TKUISlideUpPosition.UP);
                                    this.testCardContRef.scrollTop = 0;
                                }
                            }
                        }, 70);

                    })
                }}
                getModalRef={(ref: any) => {
                    if (ref) {
                        this.onDragHandleRef(ref);
                    }
                }}
                // dontApplyListeners={true}
            >
                {this.props.children}
            </Drawer>
        );
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