import React, {UIEventHandler} from "react";
import Modal from 'react-modal';
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
import {markForFocusLater, returnFocus} from "./FocusManagerHelper";
import WaiAriaUtil from "../util/WaiAriaUtil";
import TKUICardHeader, {TKUICardHeaderClientProps, TKUICardHeaderProps} from "./TKUICardHeader";
import FocusTrap from "focus-trap-react";

// TODO: Maybe call it CardBehaviour, or CardType (more general in case we want to contemplate behaviour + style).
export enum CardPresentation {
    MODAL,
    SLIDE_UP,
    NONE
}

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {

    /**
     * The title for the card, to be displayed on card header.
     */
    title?: string;

    /**
     * The subtitle for the card, to be displayed on card header.
     */
    subtitle?: string;

    renderHeader?: (props: TKUICardHeaderClientProps) => JSX.Element;

    /**
     * Function to render content on header below subtitle and above head-body divider.
     * @ctype () => JSX.Element
     */
    renderSubHeader?: () => JSX.Element;
    // TODO improvement(?):
    // - create component <TKUIDivider/>, and allow to hide divider from Card, so you can render sub-header + divider as
    // content.

    /**
     * Stating if the card should be shown or not.
     * @default true
     */
    open?: boolean;

    /**
     * Function that will be run when the card is requested to be closed (either by clicking close button, pressing ESC,
     * or clicking on overlay for CardPresentation.MODAL).
     * @ctype
     */
    onRequestClose?: () => void;

    /**
     * Values: CardPresentation.MODAL, CardPresentation.SLIDE_UP, CardPresentation.NONE.
     * @ctype
     * @default CardPresentation.NONE
     */
    presentation?: CardPresentation;

    /**
     * Options specific for slide up card (with presentation CardPresentation.SLIDE_UP).
     * @ctype
     */
    slideUpOptions?: TKUISlideUpOptions;

    /**
     * Options specific for modal card (with presentation CardPresentation.MODAL).
     * @ignore
     */
    modalOptions?: any;

    /**
     * @ignore
     */
    handleRef?: (ref: any) => void;

    /**
     * @ignore
     */
    scrollRef?: (instance: HTMLDivElement | null) => void;

    /**
     * @ignore
     */
    onScroll?: UIEventHandler<HTMLDivElement>;

    /**
     * Describing if the card body should be scrollable.
     * @default true
     */
    scrollable?: boolean;

    /**
     * The id of the HTML element to which the card will be attached to in case of
     * CardPresentation.MODAL or CardPresentation.SLIDE_UP presentations. If not specified document body element will be
     * used as parent.
     */
    parentElementId?: string;

    /**
     * Forwarded to root HTML element of card.
     */
    ariaLabel?: string;

    /**
     * @ignore
     */
    closeAriaLabel?: string;

    role?: string;

    /**
     * States if card should get focus right after shown.
     * @default ```true``` if detected that user is navigating through keyboard, '''false''' otherwise.
     */
    shouldFocusAfterRender?: boolean;

    /**
     * The id of the HTML element that will get focus when the card is shown. If not specified the main HTML element of
     * the card will get focus. It's ignored if ```shouldFocusAfterRender``` is ```false```.
     */
    mainFocusElemId?: string;

    /**
     * Avoid stacking cards (to handle esc close & focus), useful for special situations
     * like several cards being rendered at once (e.g. trip details carousel) that causes
     * issues related to returning focus.
     */
    doNotStack?: boolean;

    children?: React.ReactNode;

    /**
     * By default is true for presentation === CardPresentation.MODAL, or false otherwise.
     */
    focusTrap?: boolean;
}

interface IConsumedProps extends TKUIViewportUtilProps {}

interface IStyle {
    modalContainer: CSS.Properties & CSSProperties<IProps>;
    modalOverlay: CSS.Properties & CSSProperties<IProps>;
    main: CSS.Properties & CSSProperties<IProps>;
    mainForSlideUp: CSS.Properties & CSSProperties<IProps>;
    innerMain: CSSProps<IProps>;
    subHeader: CSS.Properties & CSSProperties<IProps>;
    body: CSS.Properties & CSSProperties<IProps>;
    divider: CSS.Properties & CSSProperties<IProps>;
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

    public static SLIDE_UP_COUNT = 0;
    private static MODAL_COUNT = 0;
    private zIndex = 1002;
    private firstModal = false;
    public static cardStack: any[] = [];

    private bodyRef?: any;
    private parentElement?: any;
    private appMainElement?: any;

    public static modalContainerId: string = "";
    public static mainContainerId: string = "";

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
        };

        if (this.props.presentation === CardPresentation.MODAL) {
            TKUICard.MODAL_COUNT++;
        } else if (this.props.presentation === CardPresentation.SLIDE_UP) {
            TKUICard.SLIDE_UP_COUNT++;
        }
        // First modal at the moment of creation, so will show fog. Assume a dialogs close in reverse order they were
        // opened, so the first opened (showing fog) is the last closed.
        this.firstModal = TKUICard.MODAL_COUNT === 1;
        // Z-index is assigned on card construction, contemplating slide-us and modals (since presentation can switch
        // between them during card lifetime). Also assumes that cards are displayed stacked in the order they where
        // created.
        this.zIndex = 1001 + TKUICard.MODAL_COUNT + TKUICard.SLIDE_UP_COUNT;
        if (!props.doNotStack) {
            TKUICard.cardStack.push(this);
        }
        const parentElementId = props.parentElementId || TKUICard.modalContainerId;
        this.parentElement = document.getElementById(parentElementId);
        this.appMainElement = document.getElementById(TKUICard.mainContainerId);
        this.close = this.close.bind(this);
    }

    public render(): React.ReactNode {
        const {title, subtitle, onRequestClose, closeAriaLabel} = this.props;
        const classes = this.props.classes;
        const presentation = this.props.presentation;
        const draggable = !this.props.slideUpOptions || this.props.slideUpOptions.draggable !== false;
        let cardAriaLabel = this.props.ariaLabel;
        if (!cardAriaLabel) {
            if (this.props.title) {
                cardAriaLabel = this.props.title;
            }
            if (this.props.subtitle) {
                cardAriaLabel = cardAriaLabel ? cardAriaLabel + ". " : "";
                cardAriaLabel += this.props.subtitle;
            }
        }
        if (cardAriaLabel && presentation !== CardPresentation.MODAL) {
            cardAriaLabel += " Card";
        }
        const showHeader = this.props.title || this.props.subtitle || this.props.onRequestClose;
        const renderHeader = this.props.renderHeader || (props => <TKUICardHeader{...props}/>);
        const showHandle = hasHandle(this.props);
        const bodyContent =
            <div className={classNames(classes.main, genClassNames.root,
                DeviceUtil.isTouch() && (presentation === CardPresentation.SLIDE_UP || this.props.slideUpOptions) && classes.mainForSlideUp)}
                 aria-label={presentation === CardPresentation.NONE ? cardAriaLabel : undefined}
                 ref={(ref: any) => this.bodyRef = ref}
                 tabIndex={presentation !== CardPresentation.MODAL ? 0 : undefined}
                 role={presentation === CardPresentation.NONE ? this.props.role || "group" : undefined}
            >
                {(showHandle || showHeader) &&
                <div ref={(ref: any) => {
                    this.state.handleRef === undefined && this.setState({handleRef: ref});
                    this.state.handleRef === undefined && this.props.handleRef && this.props.handleRef(ref);
                }}>
                    {showHandle &&
                    <div className={classes.handle}>
                        <div className={classes.handleLine}/>
                    </div>}
                    {showHeader &&
                    renderHeader({title, subtitle, onRequestClose: onRequestClose ? this.close : undefined, closeAriaLabel, noPaddingTop: showHandle})}
                </div>}
                {this.props.renderSubHeader &&
                <div className={classes.subHeader}>
                    {this.props.renderSubHeader()}
                </div>}
                {(showHandle || showHeader || this.props.renderSubHeader) &&
                <div className={classes.divider} />}
                {this.props.scrollable !== false ?
                    <TKUIScrollForCard
                        className={classes.body}
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
        const focusTrap = this.props.focusTrap !== undefined ? this.props.focusTrap : this.props.presentation === CardPresentation.MODAL;
        const body = focusTrap ?
            <FocusTrap>
                {bodyContent}
            </FocusTrap> : bodyContent
        return (
            presentation === CardPresentation.SLIDE_UP ?
                <TKUISlideUp
                    {...this.props.slideUpOptions}
                    handleRef={this.state.handleRef}
                    containerClass={classNames(classes.modalContainer, genClassNames.root)}
                    open={this.props.open}
                    onPositionChange={(position: TKUISlideUpPosition) => this.setState({slideUpPosition: position})}
                    cardOnTop={(onTop: boolean) => this.setState({cardOnTop: onTop})}
                    parentElement={this.parentElement}
                    zIndex={this.props.slideUpOptions?.zIndex !== undefined ? this.props.slideUpOptions.zIndex : this.zIndex}
                    ariaLabel={cardAriaLabel}
                    role={this.props.role || "group"}
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
                                transform: 'translate(-50%, 0)',
                                left: '50%',
                                width: '500px'
                            },
                            ...(!this.firstModal ?
                                    { overlay: {background: 'none'} } :
                                    { overlay: this.props.injectedStyles.modalOverlay }
                            )
                        }}
                        shouldCloseOnEsc={true}
                        onRequestClose={this.close}
                        appElement={this.appMainElement}
                        parentSelector={() => this.parentElement ? this.parentElement : document.getElementsByTagName("BODY")[0]}
                        contentLabel={cardAriaLabel}
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
        if (this.props.presentation !== prevProps.presentation) {
            if (this.props.presentation === CardPresentation.MODAL) {
                TKUICard.MODAL_COUNT++;
            } else if (this.props.presentation === CardPresentation.SLIDE_UP) {
                TKUICard.SLIDE_UP_COUNT++;
            }
            if (prevProps.presentation === CardPresentation.MODAL) {
                TKUICard.MODAL_COUNT--;
            } else if (prevProps.presentation === CardPresentation.SLIDE_UP) {
                TKUICard.SLIDE_UP_COUNT--;
            }
        }
    }

    /**
     * Got from here: https://github.com/reactjs/react-modal/blob/master/src/helpers/focusManager.js
     */
    contentHasFocus = () =>
        document.activeElement === this.bodyRef ||
        this.bodyRef.contains(document.activeElement);

    // Don't steal focus from inner elements
    focusContent = () => {
        const mainFocusElem = this.props.mainFocusElemId && document.getElementById(this.props.mainFocusElemId);
        if (mainFocusElem && !this.contentHasFocus()) {
            mainFocusElem.focus();
        } else {
            this.bodyRef &&
            !this.contentHasFocus() &&
            this.bodyRef.focus({preventScroll: true});
        }
    };

    /**
     * Registers that the card actually gave focus to some (content) element, and so
     * it has to return the focus. It's false when shoudlFocusAfterRender = false.
     */
    private gaveFocus;

    private close() {
        this.props.onRequestClose && this.props.onRequestClose();
        if (this.gaveFocus) {
            returnFocus();
        }
    }

    componentDidMount() {
        if (this.props.presentation !== CardPresentation.MODAL) {
            const shouldFocusAfterRender = this.props.shouldFocusAfterRender !== undefined ?
                this.props.shouldFocusAfterRender :
                (WaiAriaUtil.isUserTabbing()
                    || DeviceUtil.isTouch()); // For VO on iOS.
            if (!shouldFocusAfterRender) {
                return;
            }
            // setupScopedFocus(this.bodyRef);
            markForFocusLater();
            this.focusContent();
            this.gaveFocus = true;
        }
    }

    public componentWillUnmount() {
        if (this.props.presentation === CardPresentation.MODAL) {
            TKUICard.MODAL_COUNT--;
        } else if (this.props.presentation === CardPresentation.SLIDE_UP) {
            TKUICard.SLIDE_UP_COUNT--;
        }
        const thisIndex = TKUICard.cardStack.indexOf(this);
        if (thisIndex !== -1) {
            TKUICard.cardStack.splice(thisIndex, 1);
        }
    }
}

window.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.keyCode === 27 && TKUICard.cardStack.length > 0) {
        const topCard = TKUICard.cardStack[TKUICard.cardStack.length - 1];
        topCard.props.presentation !== CardPresentation.MODAL && topCard.close();
    }
});

const Mapper: PropsMapper<IClientProps, Subtract<IProps, TKUIWithClasses<IStyle, IProps>>> =
    ({inputProps, children}) =>
        <TKUIViewportUtil>
            {(viewportProps: TKUIViewportUtilProps) => {
                return children!({...viewportProps, ...inputProps});
            }}
        </TKUIViewportUtil>;

export default connect((config: TKUIConfig) => config.TKUICard, config, Mapper);
export {TKUICard as TKUICardRaw};

export {hasHandle}