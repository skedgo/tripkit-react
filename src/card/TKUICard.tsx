import React from "react";
import Modal from 'react-modal';
import {ReactComponent as IconRemove} from '../images/ic-cross.svg';
import genStyles from "../css/general.module.css";
import classNames from "classnames";
import {CSSProperties, ClassNameMap, Styles, WithSheet, StyleCreator} from 'react-jss';
import * as CSS from 'csstype';
import {Subtract} from "utility-types";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {tKUICardDefaultStyle} from "./TKUICard.css";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {connect, mapperFromFunction} from "../config/TKConfigHelper";
import {TKUISlideUpOptions, TKUISlideUpPosition} from "./TKUISlideUp";
import DeviceUtil from "../util/DeviceUtil";
import TKUIScrollForCard from "./TKUIScrollForCard";
import TKUISlideUpOld from "./TKUISlideUpOld";

export enum CardPresentation {
    MODAL,
    SLIDE_UP,
    SLIDE_UP_STYLE,
    NONE
}

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    title?: string;
    subtitle?: string;
    renderSubHeader?: () => JSX.Element;
    onRequestClose?: () => void;
    presentation?: CardPresentation;
    slideUpOptions?: TKUISlideUpOptions;
    open?: boolean;
    children?: any;
    bodyStyle?: CSS.Properties;
    touchEventsOnChildren?: boolean; // false by default.
    handleRef?: (ref: any) => void;
}

interface IStyle {
    modalContainer: CSS.Properties & CSSProperties<IProps>;
    main: CSS.Properties & CSSProperties<IProps>;
    innerMain: CSSProps<IProps>;
    header: CSS.Properties & CSSProperties<IProps>;
    subHeader: CSS.Properties & CSSProperties<IProps>;
    body: CSS.Properties & CSSProperties<IProps>;
    headerLeft: CSS.Properties & CSSProperties<IProps>;
    title: CSS.Properties & CSSProperties<IProps>;
    subtitle: CSS.Properties & CSSProperties<IProps>;
    btnClear: CSS.Properties & CSSProperties<IProps>;
    iconClear: CSS.Properties & CSSProperties<IProps>;
    handle: CSS.Properties & CSSProperties<IProps>;
    handleLine: CSS.Properties & CSSProperties<IProps>;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {}

export type TKUICardProps = IProps;
export type TKUICardStyle = IStyle;

export type TKUICardClientProps = IClientProps;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUICard {...props}/>,
    styles: tKUICardDefaultStyle,
    classNamePrefix: "TKUICard"
};

export function hasHandle(props: IProps): boolean {
    return (props.presentation === CardPresentation.SLIDE_UP || props.presentation === CardPresentation.SLIDE_UP_STYLE)
        && DeviceUtil.isTouch() && !(props.slideUpOptions && props.slideUpOptions.draggable === false);
}

interface IState {
    handleRef?: any;
    slideUpPosition: TKUISlideUpPosition;
}

class TKUICard extends React.Component<IProps, IState> {

    public static defaultProps: Partial<IProps> = {
        presentation: CardPresentation.NONE,
        open: true
    };

    constructor(props: IProps) {
        super(props);
        this.state = {
            slideUpPosition: !this.props.slideUpOptions ? TKUISlideUpPosition.UP :
                this.props.slideUpOptions.position ? this.props.slideUpOptions.position :
                    this.props.slideUpOptions.initPosition ? this.props.slideUpOptions.initPosition : TKUISlideUpPosition.UP
        }
    }

    public render(): React.ReactNode {
        const classes = this.props.classes;
        const presentation = this.props.presentation;
        const draggable = !this.props.slideUpOptions || this.props.slideUpOptions.draggable !== false;
        const body =
            <div className={classNames(classes.main, "app-style")}>
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
                    <div className={classes.header}>
                        <div className={classNames(genStyles.flex, genStyles.spaceBetween, genStyles.alignCenter)}>
                            <div className={classes.headerLeft}>
                                <div className={classes.title}>
                                    {this.props.title}
                                </div>
                                {this.props.subtitle &&
                                <div className={classes.subtitle}>
                                    {this.props.subtitle}
                                </div>}
                            </div>
                            {this.props.onRequestClose &&
                            <button onClick={this.props.onRequestClose} className={classNames(classes.btnClear)}
                                    aria-hidden={true}>
                                <IconRemove aria-hidden={true}
                                            className={classes.iconClear}
                                            focusable="false"/>
                            </button>}
                        </div>
                    </div>
                </div>
                <div className={classes.subHeader}>
                    {this.props.renderSubHeader && this.props.renderSubHeader()}
                </div>
                <TKUIScrollForCard
                    className={classes.body}
                    style={this.props.bodyStyle}
                    // So dragging the card from its content, instead of scrolling it, will drag the card.
                    // Just freeze if draggable, since if not you will want to be able to scroll in MIDDLE position.
                    freezeScroll={draggable && this.state.slideUpPosition !== TKUISlideUpPosition.UP}
                >
                    {this.props.children}
                </TKUIScrollForCard>
            </div>;
        return (
            presentation === CardPresentation.SLIDE_UP ?
                <TKUISlideUpOld
                    {...this.props.slideUpOptions}
                    handleRef={this.state.handleRef}
                    containerClass={classes.modalContainer}
                    open={this.props.open}
                    onPositionChange={(position: TKUISlideUpPosition) => this.setState({slideUpPosition: position})}
                >
                    {body}
                </TKUISlideUpOld>
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

}

export default connect(
    (config: TKUIConfig) => config.TKUICard, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));