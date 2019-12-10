import {TKUIStyles} from "../jss/StyleHelper";
import {TKUIFavouriteRowProps, TKUIFavouriteRowStyle} from "./TKUIFavouriteRow";
import genStyles from "../css/GenStyle.css";
import {tKUIColors} from "../jss/TKUITheme";
import {resetStyles} from "../css/ResetStyle.css";

export const tKUIFavouriteRowDefaultStyle: TKUIStyles<TKUIFavouriteRowStyle, TKUIFavouriteRowProps> = {
    main: {
        ...genStyles.flex,
        ...genStyles.alignCenter,
        padding: '10px 15px',
        borderBottom: '1px solid ' + tKUIColors.black4,
        cursor: (props: TKUIFavouriteRowProps) => props.onClick && 'pointer',
        '&:hover': {
            backgroundColor: '#fbfbfb'
        }
    },
    iconPanel: {
        width: '32px',
        height: '32px',
        ...genStyles.flex,
        ...genStyles.center,
        ...genStyles.alignCenter,
        ...genStyles.svgFillCurrColor,
        color: tKUIColors.black1
    },
    text: {
        marginLeft: '10px',
        ...genStyles.grow
    },
    removeBtn: {
        ...resetStyles.button,
        '& svg': {
            height: '20px',
            width: '20px'
        }
    }
};