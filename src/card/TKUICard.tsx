import React from "react";
import Drawer from 'react-drag-drawer';
import {ReactComponent as IconRemove} from '../images/ic-cross.svg'
import './TKUICard.css';
import genStyles from "../css/general.module.css";
import classNames from "classnames";
import injectSheet, {CSSProperties, Styles, WithSheet} from 'react-jss'
import * as CSS from 'csstype';
import {$Keys} from "utility-types";


// interface IProps extends WithStyles<typeof tKUICardDefaultStyle>{
interface IProps extends WithStyles {
// interface IProps {
    title: string;
    renderSubHeader?: () => JSX.Element;
    onRequestClose?: () => void;
    // classes: { [key in $Keys<typeof tKUICardDefaultStyle>]: CSS.Properties };
}

// interface TKUICardStyle {
//     backgroundColor: CSS.BackgroundColorProperty;
//     titleTextColor: CSS.Color;
//     primary: CSS.Color;
// }



// export const tKUICardDefaultStyle: Record<string, CSSProperties<{}>> = {
// export const tKUICardDefaultStyle: Record<string, CSS.Properties> = {
// export const tKUICardDefaultStyle: Record<string, CSS.Properties> = {

// interface ITKUICardStyle {
//     main: CSS.Properties,
//     subPanel: CSS.Properties
// }

export const tKUICardDefaultStyle = {
    main: {
        color: 'blue!important',
        textAlign: 'center'
    },
    subPanel: {
        backgroundColor: 'white'
    }
};
// } as Record<string, CSS.Properties>;

// type WithStyles = { classes: { [key in $Keys<typeof tKUICardDefaultStyle>]: CSSProperties<{}> } };

// type WithStyles = { classes: Styles<$Keys<typeof tKUICardDefaultStyle>, IProps> };
// type WithStyles = WithSheet<$Keys<typeof tKUICardDefaultStyle>, any, IProps>;
// type WithStyles = WithSheet<$Keys<typeof tKUICardDefaultStyle>, any, IProps>;
type WithStyles = WithSheet<keyof typeof tKUICardDefaultStyle, any, IProps>;

// export type Lit = string | number | boolean | undefined | null | void | {};
// export const tuple = <T extends Lit[]>(...args: T) => args;
// const list = tuple('main', 'subPanel');
// const list = ['main', 'subPanel'];
// const list = tuple(...Object.keys(tKUICardDefaultStyle));


// type WithStyles = WithSheet<typeof list[number], any, IProps>;



// or with a little helper type:
// type ClassesProp<S> = { [keys: $Keys<S>]: string };
//
// type Props = { classes: ClassesProp<typeof styles> };


class TKUICardUnstiled extends React.Component<IProps, {}> {

    // Pass as parameter, or put in global config
    private asCard: boolean = true;

    public render(): React.ReactNode {
        // const style: TKUICardStyle = {
        //     backgroundColor: 'black',
        //     titleTextColor: 'red'
        // };
        const cssStyle: CSSProperties<{}> = {
            color: "red"
        };
        const body =
            <div className={classNames(this.props.classes.main, this.props.classes.subPanel, "TKUICard-main")}>
                <div className="ServiceDepartureTable-header">
                    <div className={classNames(genStyles.flex, genStyles.spaceBetween, genStyles.alignCenter)}>
                        <div className="ServiceDepartureTable-title gl-grow" style={cssStyle}>
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

// const tKUICardWithStyle = (style: { [key in $Keys<typeof tKUICardDefaultStyle>]: CSSProperties<{}>}) =>
const tKUICardWithStyle = (style: { [key in $Keys<typeof tKUICardDefaultStyle>]: CSSProperties<{}>}) =>
    injectSheet(style)(TKUICardUnstiled);

// const TKUICard = tKUICardWithStyle(tKUICardDefaultStyle as Record<string, CSSProperties<{}>>);
const TKUICard = tKUICardWithStyle(tKUICardDefaultStyle);

export default TKUICard;
export {tKUICardWithStyle};