import React from "react";
import Drawer from 'react-drag-drawer';
import Modal from 'react-modal';
import {ReactComponent as IconRemove} from '../images/ic-cross.svg';
import genStyles from "../css/general.module.css";
import classNames from "classnames";
import {CSSProperties, ClassNameMap, Styles, WithSheet, StyleCreator} from 'react-jss';
import * as CSS from 'csstype';
import {Subtract} from "utility-types";
import {TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {tKUICardDefaultStyle} from "./TKUICard.css";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {connect, mapperFromFunction} from "../config/TKConfigHelper";
import TKUISlideUp from "./TKUISlideUp";

export enum CardPresentation {
    MODAL,
    SLIDE_UP,
    NONE
}

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    title?: string;
    subtitle?: string;
    renderSubHeader?: () => JSX.Element;
    onRequestClose?: () => void;
    presentation?: CardPresentation;
    open?: boolean;
    top?: number;
    children?: any;
}

interface IStyle {
    modal: CSS.Properties & CSSProperties<IProps>;
    modalContainer: CSS.Properties & CSSProperties<IProps>;
    main: CSS.Properties & CSSProperties<IProps>;
    header: CSS.Properties & CSSProperties<IProps>;
    body: CSS.Properties & CSSProperties<IProps>;
    headerLeft: CSS.Properties & CSSProperties<IProps>;
    title: CSS.Properties & CSSProperties<IProps>;
    subtitle: CSS.Properties & CSSProperties<IProps>;
    btnClear: CSS.Properties & CSSProperties<IProps>;
    iconClear: CSS.Properties & CSSProperties<IProps>;
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

class TKUICard extends React.Component<IProps, {}> {

    public static defaultProps: Partial<IProps> = {
        presentation: CardPresentation.NONE,
        open: true
    };

    constructor(props: IProps) {
        super(props);
    }

    public render(): React.ReactNode {
        const classes = this.props.classes;
        const presentation = this.props.presentation;
        const body =
            <div className={classNames(classes.main, "app-style")}>
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
                    {this.props.renderSubHeader && this.props.renderSubHeader()}
                </div>
                <div className={classes.body}>
                    {this.props.children}
                </div>
            </div>;
        return (
            presentation === CardPresentation.SLIDE_UP ?
                <TKUISlideUp>
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
                    >
                        {body}
                    </Modal> : body
        );
    }

    public componentDidUpdate(prevProps: Readonly<IProps>): void {
        if (this.props.top !== prevProps.top) {
            this.props.refreshStyles();
        }
    }

}

export default connect(
    (config: TKUIConfig) => config.TKUICard, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));