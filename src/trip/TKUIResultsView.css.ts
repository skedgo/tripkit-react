import genStyles from "../css/GenStyle.css";
import {ITKUIResultsStyle} from "./TKUIResultsView";

export const tKUIResultsDefaultStyle: ITKUIResultsStyle = {

    main: {
        ...genStyles.flex,
        ...genStyles.column
    },

    row: {
        marginBottom: '15px',
        '&:hover': {
            backgroundColor: '#fbfbfb'
        }
    },

    rowSelected: {
        backgroundColor: '#f3f3f3!important'
    },

    iconLoading: {
        margin: '0 5px',
        width: '20px',
        height: '20px',
        color: '#6d6d6d',
        ...genStyles.alignSelfCenter,
        ...genStyles.animateSpin,
        ...genStyles.svgFillCurrColor
    }

};