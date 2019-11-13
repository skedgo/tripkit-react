import React from "react";
import Drawer from 'react-drag-drawer';
import {ReactComponent as IconRemove} from '../images/ic-cross.svg';
import genStyles from "../css/general.module.css";
import classNames from "classnames";
import {CSSProperties, ClassNameMap, Styles, WithSheet, StyleCreator} from 'react-jss';
import * as CSS from 'csstype';
import {Subtract} from "utility-types";
import {TKUIStyles, withStyleProp} from "../jss/StyleHelper";
import {tKUICardDefaultStyle} from "./TKUICard.css";

export interface ITKUICardProps {
    title: string;
    subtitle?: string;
    renderSubHeader?: () => JSX.Element;
    onRequestClose?: () => void;
    asCard?: boolean;
    styles?: any;
}

// interface IProps extends ITKUICardProps, WithSheet<keyof ITKUICardStyle, object, IProps> {}
interface IProps extends ITKUICardProps {
    classes: ClassNameMap<keyof ITKUICardStyle>
}

export interface ITKUICardStyle {
    modal: CSS.Properties & CSSProperties<IProps>;
    modalContainer: CSS.Properties & CSSProperties<IProps>;
    main: CSS.Properties & CSSProperties<IProps>;
    mainAsCard: CSS.Properties & CSSProperties<IProps>;
    header: CSS.Properties & CSSProperties<IProps>;
    body: CSS.Properties & CSSProperties<IProps>;
    headerLeft: CSS.Properties & CSSProperties<IProps>;
    title: CSS.Properties & CSSProperties<IProps>;
    subtitle: CSS.Properties & CSSProperties<IProps>;
    btnClear: CSS.Properties & CSSProperties<IProps>;
    iconClear: CSS.Properties & CSSProperties<IProps>;
}

class TKUICardConfig {
    public styles: TKUIStyles<ITKUICardStyle, ITKUICardProps> = tKUICardDefaultStyle;

    public static instance = new TKUICardConfig();
}

class TKUICard extends React.Component<IProps, {}> {

    public static defaultProps: Partial<IProps> = {
        asCard: true
    };

    constructor(props: IProps) {
        super(props);
    }

    public render(): React.ReactNode {
        const classes = this.props.classes;
        const body =
            <div className={classNames(classes.main, this.props.asCard && classes.mainAsCard, "app-style")}>
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
        const asCard = this.props.asCard;
        return (
            asCard ?
            <Drawer
                open={true}
                modalElementClass={classes.modal}
                containerElementClass={classes.modalContainer}
                allowClose={false}
                dontApplyListeners={true}
            >
                {body}
            </Drawer> : body
        );
    }
}

const TKUICardWithStyleProp = withStyleProp(TKUICard);

export default (props: ITKUICardProps & {children: any}) => {
    const stylesToPass = props.styles || TKUICardConfig.instance.styles;
    return <TKUICardWithStyleProp {...props} styles={stylesToPass} classNamePrefix={"TKUICard"}/>
};
export {TKUICardConfig}