import * as React from "react";
import injectSheet from "react-jss";
import { Classes } from "jss";
import {tKDocTabButtonStyle} from "./TKDocTabButton.css";
import classNames from "classnames";
import {ReactComponent as IconAngleDown} from "../../images/ic-angle-down.svg";
import {genClassNames} from "../../css/GenStyle.css";

function TKDocTabButton(props: {onClick?: () => void, active?: boolean, children: React.ReactNode, classes: Classes<keyof typeof tKDocTabButtonStyle>}) {
    const collapsable = props.onClick !== undefined;
    const classes = props.classes;
    return (
        <button
            className={classNames(classes.main, collapsable && classes.collapsable)}
            onClick={props.onClick}
        >
            {props.onClick &&
            <IconAngleDown className={classNames(classes.angleDown, props.active && genClassNames.rotate180)}/>}
            {props.children}
        </button>
    )
}

export default injectSheet(tKDocTabButtonStyle)(TKDocTabButton);