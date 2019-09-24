import React from "react";
import Drawer from 'react-drag-drawer';
import {ReactComponent as IconRemove} from '../images/ic-cross.svg'
import './TKUICard.css';
import genStyles from "../css/general.module.css";
import classNames from "classnames";
import {CSSProperties, ClassNameMap, Styles, WithSheet, StyleCreator} from 'react-jss';
import * as CSS from 'csstype';
import {Subtract} from "utility-types";
import {TKUIStyles, withStyleProp} from "../jss/StyleHelper";
import {TKUITheme} from "../example/client-sample";

export interface ITKUICardProps {
    title: string;
    renderSubHeader?: () => JSX.Element;
    onRequestClose?: () => void;
    styles?: any;
}

// interface IProps extends ITKUICardProps, WithSheet<keyof ITKUICardStyle, object, IProps> {}
interface IProps extends ITKUICardProps {
    classes: ClassNameMap<keyof ITKUICardStyle>
}

export interface ITKUICardStyle {
    main: CSS.Properties & CSSProperties<IProps>;
    header: CSS.Properties & CSSProperties<IProps>;
}

export const tKUICardDefaultStyle: TKUIStyles<ITKUICardStyle, ITKUICardProps> =
    (theme: TKUITheme) => ({
        main: {
            color: 'blue!important',
            textAlign: 'center'
        },
        header: {
            backgroundColor: 'white',
            borderRadius: '10px',
            '&:hover': {
                backgroundColor: 'orange'
            }
        }
    });

class TKUICardConfig {
    public styles: TKUIStyles<ITKUICardStyle, ITKUICardProps> = tKUICardDefaultStyle;

    public static instance = new TKUICardConfig();
}

class TKUICard extends React.Component<IProps, {}> {

    // Pass as parameter, or put in global config
    private asCard: boolean = true;

    constructor(props: IProps) {
        super(props);
    }

    public render(): React.ReactNode {
        // const style: TKUICardStyle = {
        //     backgroundColor: 'black',
        //     titleTextColor: 'red'
        // };
        // const cssStyle: CSSProperties<{}> = {
        //     color: "red"
        // };
        const classes = this.props.classes;
        const body =
            <div className={classNames(classes.main, "TKUICard-main")}>
                <div className={classNames("ServiceDepartureTable-header", classes.header)}>
                    <div className={classNames(genStyles.flex, genStyles.spaceBetween, genStyles.alignCenter)}>
                        <div className="ServiceDepartureTable-title gl-grow">
                            {this.props.title}
                        </div>
                        <button onClick={this.props.onRequestClose} className="ServiceDepartureTable-btnClear"
                                aria-hidden={true}>
                            <IconRemove aria-hidden={true}
                                        className="ServiceDepartureTable-iconClear gl-svg-fill-currColor"
                                        focusable="false"/>
                        </button>
                    </div>
                    {this.props.renderSubHeader && this.props.renderSubHeader()}
                </div>
                <div className={"gl-scrollable-y"}>
                    {this.props.children}
                </div>
            </div>;
        return (
            this.asCard ?
            <Drawer
                open={true}
                containerElementClass="TripPlanner-serviceModal"
                modalElementClass="TripPlanner-serviceModalContainer app-style"
                allowClose={false}
                dontApplyListeners={true}
            >
                {body}
            </Drawer> : body
        );
    }
}

// class TKUICard extends React.Component<ITKUICardProps, {}> {
//     private TKUICardStyled: any;
//
//     constructor(props: ITKUICardProps) {
//         super(props);
//         this.TKUICardStyled = this.props.styles ?
//             injectSheet(this.props.styles)(TKUICardUnstyled) :
//             injectSheet(tKUICardDefaultStyle)(TKUICardUnstyled);
//     }
//
//     public render(): React.ReactNode {
//         return <this.TKUICardStyled {...this.props}/>
//     }
//
// }

// const tKUICardWithStyle = (style: ITKUICardStyle) => injectSheet(style)(TKUICardUnstyled);

const TKUICardWithStyleProp = withStyleProp(TKUICard, tKUICardDefaultStyle);

export default (props: ITKUICardProps & {children: any}) => {
    const stylesToPass = props.styles || TKUICardConfig.instance.styles;
    return <TKUICardWithStyleProp {...props} styles={stylesToPass}/>
};
export {TKUICardConfig}