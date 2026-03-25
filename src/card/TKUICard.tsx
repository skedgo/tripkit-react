import React, { useEffect, useMemo, useRef, useState } from "react";
import Modal from 'react-modal';
import classNames from "classnames";
import { Subtract } from "utility-types";
import { TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { tKUICardDefaultStyle } from "./TKUICard.css";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import { connect, PropsMapper } from "../config/TKConfigHelper";
import { TKUISlideUpOptions, TKUISlideUpPosition } from "./TKUISlideUp";
import DeviceUtil from "../util/DeviceUtil";
import TKUISlideUp from "./TKUISlideUp";
import { genClassNames } from "../css/GenStyle.css";
import { TKUIViewportUtil, TKUIViewportUtilProps } from "../util/TKUIResponsiveUtil";
import { markForFocusLater, returnFocus } from "./FocusManagerHelper";
import TKUICardHeader, { TKUICardHeaderClientProps } from "./TKUICardHeader";
import FocusTrap from "focus-trap-react";
import { IAccessibilityContext, TKAccessibilityContext } from "../config/TKAccessibilityProvider";
import { cardSpacing } from "../jss/TKUITheme";
import { BottomSheet } from "react-spring-bottom-sheet";
import { defaultSnapProps, snapPoints, SpringEvent } from "react-spring-bottom-sheet/dist/types";
import { usePrevious } from "../util/ReactUtil";
import 'react-spring-bottom-sheet/dist/style.css';

// TODO: Maybe call it CardBehaviour, or CardType (more general in case we want to contemplate behaviour + style).
export enum CardPresentation {
    MODAL,
    SLIDE_UP,
    BOTTOM_SHEET,
    NONE,
    CONTENT // Just displays children. Possibly rename NONE to INLINE and CONTENT to NONE.
}

type IStyle = ReturnType<typeof tKUICardDefaultStyle>
export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {

    /**
     * The title for the card, to be displayed on card header.
     */
    title?: React.ReactNode;

    /**
     * The subtitle for the card, to be displayed on card header.
     */
    subtitle?: React.ReactNode;

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

    bottomSheetOptions?: {
        onSpringStart?: (event: SpringEvent) => void;
        onSpringCancel?: (event: SpringEvent) => void;
        onSpringEnd?: (event: SpringEvent) => void;
        open?: boolean;
        className?: string;
        footer?: React.ReactNode;
        header?: React.ReactNode;
        initialFocusRef?: false | React.RefObject<HTMLElement>;
        onDismiss?: () => void;
        blocking?: boolean;
        maxHeight?: number;
        scrollLocking?: boolean;
        snapPoints?: snapPoints;
        defaultSnap?: number | ((props: defaultSnapProps) => number);
        reserveScrollBarGap?: boolean;
        skipInitialTransition?: boolean;
        expandOnContentDrag?: boolean;
        snap?: ((props: Pick<defaultSnapProps, 'snapPoints'>) => number);
        hide?: boolean;
        disableDrag?: boolean;
    }

    /**
     * @ignore
     */
    handleRef?: (ref: any) => void;

    /**
     * @ignore
     */
    scrollRef?: (instance: HTMLDivElement | null) => void;

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
    // Currently it doesn't make sense for MODAL presentation, since react-modal already traps focus.
    // Besides that, it causes the undesired effect that cards that render on top of current one won't be clickable
    // (e.g. close button, or elements inside), unless they are also passed focusTrap = true (that is, FocusTrap 
    // elem is also used). The same happened with UIUtil.confirmMsg (buttons unclickable), that's why I provided a
    // custom UI for it surrounded by a FocusTrap, so buttons are clickable. However, cannot close confirmMsg on click 
    // outside (click on the overlay) due to the added FocusTrap. See how to improve all of this. Probably get rid of the
    // react-focus-trap, or get a better use of it.

    className?: string;
}

interface IConsumedProps extends TKUIViewportUtilProps, IAccessibilityContext { }

interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> { }

export type TKUICardProps = IProps;
export type TKUICardStyle = IStyle;

export type TKUICardClientProps = IClientProps;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUICard {...props} />,
    styles: tKUICardDefaultStyle,
    classNamePrefix: "TKUICard"
};

function hasHandle(props: IProps): boolean {
    return (props.presentation === CardPresentation.SLIDE_UP || !!props.slideUpOptions?.showHandle)
        && DeviceUtil.isTouch() && !(props.slideUpOptions && props.slideUpOptions.draggable === false);
}

export const cardHandleClass = "TKUICard-handleSelector";

let SLIDE_UP_COUNT = 0;
let MODAL_COUNT = 0;
let cardStack: any[] = [];
let modalContainerId: string = "";
export function setModalContainerId(id: string) {
    modalContainerId = id;
}
let mainContainerId: string = "";
export function setMainContainerId(id: string) {
    mainContainerId = id;
}

const TKUICard: React.FC<IProps> = (props: IProps) => {
    const { title, subtitle, open = true, onRequestClose, closeAriaLabel, className, children, presentation = CardPresentation.NONE, slideUpOptions, classes, ariaLabel } = props;

    const [slideUpPosition, setSlideUpPosition] = React.useState<TKUISlideUpPosition>(slideUpOptions?.position ?? slideUpOptions?.initPosition ?? TKUISlideUpPosition.UP);

    const [zIndex, firstModal] = useMemo(() => {
        if (presentation === CardPresentation.MODAL) {
            MODAL_COUNT++;
        } else if (presentation === CardPresentation.SLIDE_UP) {
            SLIDE_UP_COUNT++;
        }
        // Z-index is assigned on card construction, contemplating slide-ups and modals (since presentation can switch
        // between them during card lifetime). Also assumes that cards are displayed stacked in the order they where
        // created.
        // Issue when open a card and then close one below, e.g. menu > profile > Development > Open routing specs.
        // Maybe use the stack instead to dynamically calculate the index.    
        const zIndexValue = 1001 + MODAL_COUNT + SLIDE_UP_COUNT;
        // First modal at the moment of creation, so will show fog. Assume a dialogs close in reverse order they were
        // opened, so the first opened (showing fog) is the last closed.
        const firstModalValue = MODAL_COUNT === 1;
        return [zIndexValue, firstModalValue];
    }, []);

    const bodyRef = useRef<HTMLDivElement>(null);
    const parentElement = useMemo(() => document.getElementById(props.parentElementId || modalContainerId), []);
    const appMainElement = useMemo(() => document.getElementById(mainContainerId), []);

    const [handleRef, setHandleRef] = React.useState<any>(undefined);
    const [cardOnTop, setCardOnTop] = React.useState<any>(undefined);

    // Entry used for global card stack management
    const stackEntryRef = useRef<{ isModal: () => boolean; close: () => void } | null>(null);

    // Keep latest presentation available to closures created at mount time
    const presentationRef = useRef<CardPresentation>(presentation);
    useEffect(() => {
        presentationRef.current = presentation;
    }, [presentation]);

    /**
     * Registers that the card actually gave focus to some (content) element, and so
     * it has to return the focus. It's false when shoudlFocusAfterRender = false.
     */
    const gaveFocus = useRef(false);

    useEffect(() => {
        if (!props.doNotStack) {
            const entry = {
                isModal: () => presentationRef.current === CardPresentation.MODAL,
                close
            };
            stackEntryRef.current = entry;
            cardStack.push(entry);
        }

        // Handle focus when not modal
        if (props.presentation !== CardPresentation.MODAL) {
            const shouldFocusAfterRender = props.shouldFocusAfterRender ?? (props.isUserTabbing || DeviceUtil.isTouch()); // For VO on iOS.
            if (shouldFocusAfterRender) {
                markForFocusLater();
                focusContent();
                gaveFocus.current = true;
            }
        }

        return () => {
            // Decrement counters on unmount
            if (presentation === CardPresentation.MODAL) {
                MODAL_COUNT--;
            } else if (presentation === CardPresentation.SLIDE_UP) {
                SLIDE_UP_COUNT--;
            }
            // Remove from stack
            const idx = cardStack.indexOf(stackEntryRef.current);
            if (idx !== -1) {
                cardStack.splice(idx, 1);
            }
        };
    }, []);

    const prevPresentation = usePrevious(presentation);
    useEffect(() => {
        if (prevPresentation === undefined) { // Avoid updating counters on first render            
            return;
        }
        if (presentation === CardPresentation.MODAL) {
            MODAL_COUNT++;
        } else if (presentation === CardPresentation.SLIDE_UP) {
            SLIDE_UP_COUNT++;
        }
        if (prevPresentation === CardPresentation.MODAL) {
            MODAL_COUNT--;
        } else if (prevPresentation === CardPresentation.SLIDE_UP) {
            SLIDE_UP_COUNT--;
        }
    }, [presentation]);

    const sheetRef = useRef<any>(null);
    const snapPointsRef = useRef<number[]>(undefined);
    const [expandOnContentDrag, setExpandOnContentDrag] = useState(false);
    const snap = props.bottomSheetOptions?.snap?.(snapPointsRef.current ? { snapPoints: snapPointsRef.current } : { snapPoints: [] });

    useEffect(() => {
        if (!sheetRef.current) {
            return;
        }
        if (snap !== undefined) {
            sheetRef.current.snapTo(snap);
        } else {
            sheetRef.current.snapTo(props.bottomSheetOptions?.defaultSnap ?? (({ snapPoints }) => snapPoints[1]));
        }
    }, [snap]);

    /**
     * Got from here: https://github.com/reactjs/react-modal/blob/master/src/helpers/focusManager.js
     */
    function contentHasFocus() {
        return document.activeElement === bodyRef.current ||
            bodyRef.current?.contains(document.activeElement);
    }
    // Don't steal focus from inner elements
    function focusContent() {
        const mainFocusElem = props.mainFocusElemId && document.getElementById(props.mainFocusElemId);
        if (mainFocusElem && !contentHasFocus()) {
            mainFocusElem.focus();
        } else {
            bodyRef.current &&
                !contentHasFocus() &&
                bodyRef.current.focus({ preventScroll: true });
        }
    };

    function close() {
        onRequestClose?.();
        if (gaveFocus.current) {
            returnFocus();
        }
    }


    if (presentation === CardPresentation.CONTENT) {
        return children;
    }
    let cardAriaLabel = ariaLabel;
    if (!cardAriaLabel) {
        if (title && typeof title === "string") {
            cardAriaLabel = title;
        }
        if (subtitle && typeof subtitle === "string") {
            cardAriaLabel = cardAriaLabel ? cardAriaLabel + ". " : "";
            cardAriaLabel += subtitle;
        }
    }
    if (cardAriaLabel && presentation !== CardPresentation.MODAL) {
        cardAriaLabel += " Card";
    }
    const showHeader = title || subtitle || onRequestClose || props.renderHeader;
    const renderHeaderFc = props.renderHeader ?? (props => <TKUICardHeader{...props} />);
    const showHandle = hasHandle(props);
    const bodyContent =
        <div className={classNames(classes.main, genClassNames.root, className,
            DeviceUtil.isTouch() && (presentation === CardPresentation.SLIDE_UP || slideUpOptions) && classes.mainForSlideUp)}
            aria-label={presentation === CardPresentation.NONE ? cardAriaLabel : undefined}
            ref={bodyRef}
            tabIndex={presentation !== CardPresentation.MODAL ? 0 : undefined}
            role={presentation === CardPresentation.NONE ? props.role || "group" : undefined}
            // To avoid a click on modal or slide up content to bubble-up and trigger a handler on an ancestor element in the render tree.
            // E.g. TKUISegmentOverview registers a click handler to go to MxM view in its main panel, and renders TKUIAlertsSummary, which in turn renders
            // TKUIAlertsView in a TKUICard, so this avoids a click on that card content to trigger the handler in TKUISegmentOverview.
            onClick={presentation === CardPresentation.MODAL || presentation === CardPresentation.SLIDE_UP ?
                e => e.stopPropagation() : undefined}
        >
            {(showHandle || showHeader || props.renderSubHeader) &&
                <div className={cardHandleClass}>
                    {(showHandle || showHeader) &&
                        <div ref={(ref: any) => {
                            handleRef === undefined && setHandleRef(ref);
                            handleRef === undefined && props.handleRef && props.handleRef(ref);
                        }}
                        >
                            {showHandle &&
                                <div className={classes.handle}>
                                    <div className={classes.handleLine} />
                                </div>}
                            {showHeader &&
                                renderHeaderFc({ title, subtitle, onRequestClose: onRequestClose ? close : undefined, closeAriaLabel, noPaddingTop: showHandle })}
                        </div>}
                    {props.renderSubHeader &&
                        <div className={classes.subHeader}>
                            {props.renderSubHeader()}
                        </div>}
                    {(showHandle || showHeader || props.renderSubHeader) &&
                        <div className={classes.divider} />}
                </div>}
            {props.scrollable !== false ?
                <div
                    className={classNames(classes.body, "no-drag")}
                    style={{
                        overflowY: 'auto',
                        overflowX: 'hidden'
                    }}
                    ref={props.scrollRef}
                >
                    {children}
                </div> :
                children
            }
        </div>;
    const focusTrap = props.focusTrap !== undefined ? props.focusTrap : presentation === CardPresentation.MODAL;
    const body = focusTrap ?
        <FocusTrap>
            {bodyContent}
        </FocusTrap> : bodyContent
    if (presentation === CardPresentation.SLIDE_UP) {
        return (
            <TKUISlideUp
                {...{ modalUp: { top: cardSpacing(props.landscape), unit: 'px' }, ...props.slideUpOptions }}
                handleSelector={"." + cardHandleClass}
                handleRef={handleRef}
                containerClass={classNames(classes.modalContainer, genClassNames.root, slideUpOptions?.containerClass)}
                open={open}
                onPositionChange={(position: TKUISlideUpPosition) => setSlideUpPosition(position)}
                cardOnTop={(onTop: boolean) => setCardOnTop(onTop)}
                parentElement={parentElement}
                zIndex={slideUpOptions?.zIndex !== undefined ? slideUpOptions.zIndex : zIndex}
                ariaLabel={cardAriaLabel}
                role={props.role || "group"}
            >
                {body}
            </TKUISlideUp>
        )
    } else if (presentation === CardPresentation.MODAL) {
        return (
            <Modal
                isOpen={open!}
                style={{
                    content: props.injectedStyles.modalContent,
                    ...(!firstModal && !props.modalOptions?.ensureOverlay ?
                        { overlay: { background: 'none' } } :
                        { overlay: props.injectedStyles.modalOverlay }
                    )
                }}
                className={classes.modal}
                shouldCloseOnEsc={true}
                onRequestClose={close}
                appElement={appMainElement}
                parentSelector={() => parentElement ? parentElement : document.getElementsByTagName("BODY")[0]}
                contentLabel={cardAriaLabel}
                {...props.modalOptions}
            >
                {body}
            </Modal>
        );
    } else if (presentation === CardPresentation.BOTTOM_SHEET) {
        return (
            <BottomSheet
                open={!!open}
                className={classNames(classes.bottomSheetRoot, genClassNames.root, props.bottomSheetOptions?.hide && classes.hidden, props.bottomSheetOptions?.disableDrag && classes.noDrag)}
                style={{
                    '--bottom-sheet-z-index': zIndex
                } as React.CSSProperties}
                skipInitialTransition
                ref={sheetRef}
                // initialFocusRef={focusRef}
                defaultSnap={({ snapPoints }) => snapPoints[1]}
                snapPoints={({ maxHeight }) => {
                    const snapPoints = [
                        maxHeight - 16,
                        maxHeight * 0.6,
                        maxHeight / 4
                    ];
                    snapPointsRef.current = snapPoints;
                    return snapPoints;
                }}
                onSpringEnd={(e: SpringEvent) => {
                    if (e.type === 'SNAP' && sheetRef.current && snapPointsRef.current) {
                        console.log("expandOnContentDrag", Math.abs(sheetRef.current.height - snapPointsRef.current[snapPointsRef.current.length - 1]) < 2);
                        setExpandOnContentDrag(Math.abs(sheetRef.current.height - snapPointsRef.current[snapPointsRef.current.length - 1]) < 2);
                    }
                }}
                // expandOnContentDrag={expandOnContentDrag}
                blocking={false}
                header={
                    (showHeader || props.renderSubHeader) &&
                    <div
                        className={cardHandleClass}
                        {...props.bottomSheetOptions?.disableDrag ? {
                            onPointerDownCapture: (e) => e.stopPropagation(),
                            onTouchStartCapture: (e) => e.stopPropagation()
                        } : {}}
                    >
                        {showHeader &&
                            <div ref={(ref: any) => {
                                handleRef === undefined && setHandleRef(ref);
                                handleRef === undefined && props.handleRef && props.handleRef(ref);
                            }}
                            >
                                {showHeader &&
                                    renderHeaderFc({ title, subtitle, onRequestClose: onRequestClose ? close : undefined, closeAriaLabel, noPaddingTop: showHandle })}
                            </div>}
                        {props.renderSubHeader &&
                            <div className={classes.subHeader}>
                                {props.renderSubHeader()}
                            </div>}
                        {(showHeader || props.renderSubHeader) &&
                            <div className={classes.divider} />}
                    </div>
                }
                {...props.bottomSheetOptions}
            >
                {children}
            </BottomSheet >
        );
    } else {
        return open && body;
    }
}

window.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape' && cardStack.length > 0) {
        const topCard = cardStack[cardStack.length - 1];
        if (!topCard.isModal()) {
            topCard.close();
        }
    }
});

const Mapper: PropsMapper<IClientProps, Subtract<IProps, TKUIWithClasses<IStyle, IProps>>> =
    ({ inputProps, children }) =>
        <TKAccessibilityContext.Consumer>
            {accessibilityContext =>
                <TKUIViewportUtil>
                    {(viewportProps: TKUIViewportUtilProps) => {
                        return children!({ ...viewportProps, ...accessibilityContext, ...inputProps });
                    }}
                </TKUIViewportUtil>
            }
        </TKAccessibilityContext.Consumer>;

export default connect((config: TKUIConfig) => config.TKUICard, config, Mapper);
export { TKUICard as TKUICardRaw };

export { hasHandle }