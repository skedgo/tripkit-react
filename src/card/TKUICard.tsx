import React, {UIEventHandler} from "react";
import Modal from 'react-modal';
import {ReactComponent as IconRemove} from '../images/ic-cross2.svg';
import classNames from "classnames";
import {CSSProperties, ClassNameMap, Styles, WithSheet, StyleCreator} from 'react-jss';
import * as CSS from 'csstype';
import {Subtract} from "utility-types";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {tKUICardDefaultStyle} from "./TKUICard.css";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {connect, PropsMapper} from "../config/TKConfigHelper";
import {TKUISlideUpOptions, TKUISlideUpPosition} from "./TKUISlideUp";
import DeviceUtil from "../util/DeviceUtil";
import TKUIScrollForCard from "./TKUIScrollForCard";
import TKUISlideUp from "./TKUISlideUp";
import {genClassNames} from "../css/GenStyle.css";
import {TKUIViewportUtil, TKUIViewportUtilProps} from "../util/TKUIResponsiveUtil";

// TODO: Maybe call it CardBehaviour, or CardType (more general in case we want to contemplate behaviour + style).
export enum CardPresentation {
    MODAL,
    SLIDE_UP,
    NONE
}

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    title?: string;
    subtitle?: string;
    renderSubHeader?: () => JSX.Element;
    onRequestClose?: () => void;
    presentation?: CardPresentation;
    presentationFromViewport?: (portrait: boolean) => CardPresentation;
    slideUpOptions?: TKUISlideUpOptions;
    modalOptions?: any;
    open?: boolean;
    children?: any;
    bodyStyle?: CSS.Properties;
    bodyClassName?: string;
    touchEventsOnChildren?: boolean; // false by default.
    handleRef?: (ref: any) => void;
    scrollRef?: (instance: HTMLDivElement | null) => void;
    onScroll?: UIEventHandler<HTMLDivElement>;
    headerDividerVisible?: boolean;
    scrollable?: boolean;
    overflowVisible?: boolean;
    parentElement?: any;
}

interface IConsumedProps extends TKUIViewportUtilProps {}

interface IStyle {
    modalContainer: CSS.Properties & CSSProperties<IProps>;
    main: CSS.Properties & CSSProperties<IProps>;
    mainForSlideUp: CSS.Properties & CSSProperties<IProps>;
    innerMain: CSSProps<IProps>;
    header: CSS.Properties & CSSProperties<IProps>;
    subHeader: CSS.Properties & CSSProperties<IProps>;
    body: CSS.Properties & CSSProperties<IProps>;
    headerTop: CSS.Properties & CSSProperties<IProps>;
    title: CSS.Properties & CSSProperties<IProps>;
    subtitle: CSS.Properties & CSSProperties<IProps>;
    btnClear: CSS.Properties & CSSProperties<IProps>;
    iconClear: CSS.Properties & CSSProperties<IProps>;
    handle: CSS.Properties & CSSProperties<IProps>;
    handleLine: CSS.Properties & CSSProperties<IProps>;
}

interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> {}

export type TKUICardProps = IProps;
export type TKUICardStyle = IStyle;

export type TKUICardClientProps = IClientProps;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUICard {...props}/>,
    styles: tKUICardDefaultStyle,
    classNamePrefix: "TKUICard"
};

function hasHandle(props: IProps): boolean {
    return (props.presentation === CardPresentation.SLIDE_UP || (!!props.slideUpOptions && !!props.slideUpOptions.showHandle))
        && DeviceUtil.isTouch() && !(props.slideUpOptions && props.slideUpOptions.draggable === false);
}

interface IState {
    handleRef?: any;
    slideUpPosition: TKUISlideUpPosition;
    cardOnTop: boolean;
}

class TKUICard extends React.Component<IProps, IState> {

    private static COUNT = 0;
    private zIndex = 1002;

    public static defaultProps: Partial<IProps> = {
        presentation: CardPresentation.NONE,
        open: true
    };

    constructor(props: IProps) {
        super(props);
        const slideUpPosition = !this.props.slideUpOptions ? TKUISlideUpPosition.UP :
            this.props.slideUpOptions.position ? this.props.slideUpOptions.position :
                this.props.slideUpOptions.initPosition ? this.props.slideUpOptions.initPosition : TKUISlideUpPosition.UP;
        this.state = {
            slideUpPosition: slideUpPosition,
            cardOnTop: slideUpPosition === TKUISlideUpPosition.UP
        }
    }

    public render(): React.ReactNode {
        const classes = this.props.classes;
        const presentation = this.props.presentation;
        const draggable = !this.props.slideUpOptions || this.props.slideUpOptions.draggable !== false;
        const body =
            <div className={classNames(classes.main, genClassNames.root,
                DeviceUtil.isTouch() && (presentation === CardPresentation.SLIDE_UP || this.props.slideUpOptions) && classes.mainForSlideUp)}>
                <div ref={(ref: any) => {
                    this.state.handleRef === undefined && this.setState({handleRef: ref});
                    this.state.handleRef === undefined && this.props.handleRef && this.props.handleRef(ref);
                }}>
                    {hasHandle(this.props) &&
                    <div
                        className={classes.handle}
                        // onClick={() => this.setState({showTestCard: true})}
                    >
                        <div className={classes.handleLine}/>
                    </div>}
                    {(this.props.title || this.props.subtitle || this.props.onRequestClose) &&
                    <div className={classes.header}>
                        <div className={classes.headerTop}>
                            <div className={classes.title}>
                                {this.props.title}
                            </div>
                            {this.props.onRequestClose &&
                            <button onClick={this.props.onRequestClose} className={classNames(classes.btnClear)}
                                    aria-hidden={true}>
                                <IconRemove aria-hidden={true}
                                            className={classes.iconClear}
                                            focusable="false"/>
                            </button>}
                        </div>
                        {this.props.subtitle &&
                        <div className={classes.subtitle}>
                            {this.props.subtitle}
                        </div>}
                    </div>}
                </div>
                <div className={classes.subHeader}>
                    {this.props.renderSubHeader && this.props.renderSubHeader()}
                </div>
                {this.props.scrollable !== false ?
                    <TKUIScrollForCard
                        className={classNames(classes.body, this.props.bodyClassName)}
                        style={this.props.bodyStyle}
                        // So dragging the card from its content, instead of scrolling it, will drag the card.
                        // Just freeze if draggable, since if not you will want to be able to scroll in MIDDLE position.
                        freezeScroll={draggable && !this.state.cardOnTop}
                        scrollRef={this.props.scrollRef}
                        onScroll={this.props.onScroll}
                    >
                        {this.props.children}
                    </TKUIScrollForCard> : this.props.children
                }
            </div>;
        return (
            presentation === CardPresentation.SLIDE_UP ?
                <TKUISlideUp
                    {...this.props.slideUpOptions}
                    handleRef={this.state.handleRef}
                    containerClass={classes.modalContainer}
                    open={this.props.open}
                    onPositionChange={(position: TKUISlideUpPosition) => this.setState({slideUpPosition: position})}
                    cardOnTop={(onTop: boolean) => this.setState({cardOnTop: onTop})}
                    parentElement={this.props.parentElement}
                    zIndex={this.zIndex}
                >
                    {body}
                </TKUISlideUp>
                :
                presentation === CardPresentation.MODAL ?
                    <Modal
                        isOpen={this.props.open!}
                        style={{
                            content: {
                                background: 'none',
                                border: 'none',
                                padding: '5px',
                                // maxWidth: '600px',
                                transform: 'translate(-55%, 0)',
                                left: '55%',
                                minWidth: '500px'
                            }
                        }}
                        shouldCloseOnEsc={true}
                        onRequestClose={this.props.onRequestClose}
                        appElement={this.props.parentElement}
                        {...this.props.modalOptions}
                    >
                        {body}
                    </Modal> : this.props.open && body
        );
    }

    public componentDidUpdate(prevProps: Readonly<IProps>): void {
        // TODO: make modalUp.top dynamic.
        // if (this.props.top !== prevProps.top) {
        //     this.props.refreshStyles();
        // }
    }

    public componentDidMount() {
        // Just count floating cards (all but NONE). Notice I also count MODAL(s) since they may change to SLIDE_UP(s)
        // on landscape / portrait switch.
        this.props.presentation !== CardPresentation.NONE && TKUICard.COUNT++;
        this.zIndex = 1001 + TKUICard.COUNT;
    }

    public componentWillUnmount() {
        this.props.presentation !== CardPresentation.NONE && TKUICard.COUNT--;
    }
}

const Mapper: PropsMapper<IClientProps, Subtract<IProps, TKUIWithClasses<IStyle, IProps>>> =
    ({inputProps, children}) =>
        <TKUIViewportUtil>
            {(viewportProps: TKUIViewportUtilProps) => {
                return children!({...inputProps, ...viewportProps,
                    presentation: inputProps.presentationFromViewport ? inputProps.presentationFromViewport(viewportProps.portrait) :
                        inputProps.presentation});
            }}
        </TKUIViewportUtil>;

export default connect(
    (config: TKUIConfig) => config.TKUICard, config, Mapper);

export {hasHandle}