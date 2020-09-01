import {Styles} from "react-jss";
import {TKDocComponentProps} from "./TKDocComponent";
import genStyles from "../../css/GenStyle.css";
import {resetStyles} from "../../css/ResetStyle.css";

export const tKDocTabButtonStyle: Styles<string, TKDocComponentProps> = {
    main: {
        ...resetStyles.button,
        ...genStyles.fontL,
        padding: '10px 0',
        fontFamily: 'sans-serif',
        '&:focus': {
            outline: 'none'
        }
    },
    collapsable: {
        // '&:hover': {
        //     borderBottom: '2px solid orange'
        // }
    },
    angleDown: {
        width: '14px',
        height: '14px',
        marginRight: '5px',
        '& path': {
            fill: 'gray'
        }
    }
};