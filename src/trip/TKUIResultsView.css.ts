import genStyles from "../css/GenStyle.css";
import {ITKUIResultsStyle} from "./TKUIResultsView";
import Constants from "../util/Constants";
import {tKUIColors} from "../jss/TKUITheme";
import {TKUIStyles} from "../jss/StyleHelper";
import {IProps} from "./TKUIResultsView";

export const tKUIResultsDefaultStyle: TKUIStyles<ITKUIResultsStyle, IProps> = {

    main: {
        ...genStyles.flex,
        ...genStyles.column,
        background: '#f5f6f7'
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
    },

    sortBar: {
        ...genStyles.flex,
        ...genStyles.spaceBetween,
        padding: '10px',
        ...genStyles.fontS,
        color: tKUIColors.black1
    },

    sortSelectContainer: {
        minWidth: '200px',
        ...genStyles.grow
    },

    sortSelectControl: {
        border: 'none',
        backgroundImage: 'url('+ Constants.absUrl("/images/ic-sort.svg") + ')!important',
        backgroundRepeat: 'no-repeat!important',
        backgroundPosition: '10px 50%!important',
        backgroundSize: '18px',
        paddingLeft: '35px',
        cursor: 'pointer',
        backgroundColor: '#00000000'
    },

    sortSelectSingleValue: {
        color: tKUIColors.black1
    }

};