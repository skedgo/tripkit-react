import React from "react";
import Drawer from 'react-drag-drawer';
import {ReactComponent as IconRemove} from '../images/ic-cross.svg'
import './TKUICard.css';
import genStyles from "../css/general.module.css";
import classNames from "classnames";
import injectSheet, {CSSProperties, Styles, WithSheet} from 'react-jss'
import * as CSS from 'csstype';


// interface IProps extends WithStyles<typeof tKUICardDefaultStyle>{
interface IProps extends WithStyles {
    title: string;
    renderSubHeader?: () => JSX.Element;
    onRequestClose?: () => void;
}


interface ITKUICardStyle {
    main: CSSProperties<IProps>;
    header: CSSProperties<IProps>;
}

// This interface is just to get autocomplete, which CSSProperties<Props> does not provide.
// Derive it as a mapped type from ITKUICardStyle. Also make all fields optional?
interface ITKUICardStyleCSS {
    main: CSS.Properties;
    header: CSS.Properties;
}

// export const tKUICardDefaultStyle: Record<keyof ITKUICardStyle, CSS.Properties<IProps>>  = {
export const tKUICardDefaultStyle: ITKUICardStyleCSS = {
    main: {
        color: 'blue!important',
        textAlign: 'center'
    },
    header: {
        backgroundColor: 'white'
    }
};

const test: CSSProperties<IProps> = {

}

const test1: CSS.Properties<IProps> = {
    flexGrow: 1
}

type WithStyles = WithSheet<keyof ITKUICardStyle, object, IProps>;

class TKUICardUnstyled extends React.Component<IProps, {}> {

    // Pass as parameter, or put in global config
    private asCard: boolean = true;

    public render(): React.ReactNode {
        // const style: TKUICardStyle = {
        //     backgroundColor: 'black',
        //     titleTextColor: 'red'
        // };
        // const cssStyle: CSSProperties<{}> = {
        //     color: "red"
        // };
        const body =
            <div className={classNames(this.props.classes.main, "TKUICard-main")}>
                <div className={classNames("ServiceDepartureTable-header", this.props.classes.header)}>
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

const tKUICardWithStyle = (style: ITKUICardStyleCSS) =>
    injectSheet(style as ITKUICardStyle)(TKUICardUnstyled);

const TKUICard = tKUICardWithStyle(tKUICardDefaultStyle);

export default TKUICard;
export {tKUICardWithStyle};