import React from "react";
import Drawer from 'react-drag-drawer';
import injectSheet, {ClassNameMap} from "react-jss";
import classNames from "classnames";
import genStyles from "../css/GenStyle.css";
import {tKUIColors} from "../jss/TKUITheme";
import DeviceUtil from "../util/DeviceUtil";


const styles = {
    containerElement: {
        zIndex: '1000!important',
        left: '0!important',
        right: '0!important',
        overflowX: 'visible',
        top: '60px!important',
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
        textAlign: 'center',
        position: 'absolute',
        left: '0',
        right: '0'
    },
    contElemTouching: {
        marginTop: '-150px'
    },
    modalElementTouching: {
        marginTop: '150px'
    },
    modalMiddle: {
        top: '50%!important'
    },
    modalMinimized: {
        top: '90%!important'
    },
    main: {
        ...genStyles.flex,
        ...genStyles.column,
        height: '100%',
    },
    handle: {
        height: '15px',
        ...genStyles.flex,
        ...genStyles.center,
    },
    handleLine: {
        width: '50px',
        height: '4px',
        ...genStyles.borderRadius(2),
        backgroundColor: tKUIColors.black2,
        marginTop: '6px'
    },
    container: {
        ...genStyles.grow,
        ...genStyles.flex,

        height: '100%',
        overflowX: 'hidden'
    }
};

interface IProps {
    containerClass?: string;
    modalClass?: string;
    mainClass?: string;
    classes: ClassNameMap<any>;
}

interface IState {
    showTestCard?: boolean;
    touching: boolean;
}

class TKUISlideUp extends React.Component<IProps, IState> {

    private dragHandleRef: any;
    private testCardContRef: any;
    private scrolling: any;

    constructor(props: IProps) {
        super(props);
        this.state = {
            showTestCard: true,
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
        if (this.state.showTestCard === true && getTranslate3d(this.dragHandleRef)[1] > 300) {
            this.setState({showTestCard: false});
        } else if (this.state.showTestCard === true && getTranslate3d(this.dragHandleRef)[1] > 100) {
            this.setState({showTestCard: undefined})
        } else if (this.state.showTestCard === undefined && getTranslate3d(this.dragHandleRef)[1] > 100) {
            this.setState({showTestCard: false});
        }
    }

    private onDragHandleRef(ref: any) {
        this.dragHandleRef = ref;
        this.dragHandleRef.addEventListener("touchstart", this.onTouchStart);
        this.dragHandleRef.addEventListener("touchend", this.onTouchEnd);
    }

    public render(): React.ReactNode {
        const classes = this.props.classes;
        return (
            <Drawer
                open={true}
                onRequestClose={() => {
                    console.log("onRequestClose");
                    return this.setState({showTestCard: false});
                }}
                containerElementClass={classNames(classes.containerElement, this.props.containerClass,
                    (this.state.showTestCard === false ? classes.modalMinimized :
                        (this.state.showTestCard === undefined ? classes.modalMiddle : "")),
                    this.state.touching && this.state.showTestCard !== true ? classes.contElemTouching : undefined
                )}
                modalElementClass={classNames(classes.modalElement, this.props.modalClass,
                    this.state.touching && this.state.showTestCard !== true ? classes.modalElementTouching : undefined)}
                allowClose={false}
                inViewportChage={() => console.log("vp change")}
                parentElement={document.body}
                getContainerRef={(ref: any) => {
                    this.testCardContRef = ref;
                    this.testCardContRef &&
                    this.testCardContRef.addEventListener("scroll", () => {
                        window.clearTimeout(this.scrolling);
                        if (this.state.showTestCard === true) {
                            this.testCardContRef.scrollTop = 0;
                        }
                        if (!this.state.touching) {
                            if (this.state.showTestCard === false && this.testCardContRef.scrollTop > 0) {
                                this.setState({showTestCard: undefined});
                                this.testCardContRef.scrollTop = 0;
                            } else if (this.state.showTestCard === undefined && this.testCardContRef.scrollTop > 0) {
                                this.setState({showTestCard: true});
                                this.testCardContRef.scrollTop = 0;
                            }
                            return;
                        }
                        this.scrolling = setTimeout(() => {
                            console.log(this.testCardContRef.scrollTop);
                            if (!this.state.touching) {
                                if (this.state.showTestCard === false && this.testCardContRef.scrollTop > 250) {
                                    this.setState({showTestCard: true});
                                    this.testCardContRef.scrollTop = 0;
                                } else if (this.state.showTestCard === false && this.testCardContRef.scrollTop > 0) {
                                    this.setState({showTestCard: undefined});
                                    this.testCardContRef.scrollTop = 0;
                                } else if (this.state.showTestCard === undefined && this.testCardContRef.scrollTop > 0) {
                                    this.setState({showTestCard: true});
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
                <div
                    className={classNames(classes.main, this.props.mainClass)}
                >
                    {DeviceUtil.isTouch() &&
                    <div
                        className={classes.handle}
                        // onClick={() => this.setState({showTestCard: true})}
                    >
                        <div className={classes.handleLine}/>
                    </div>}
                    <div className={classes.container}>
                        {this.props.children}
                    </div>
                </div>
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