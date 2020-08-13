import {TKUIStyles} from "../jss/StyleHelper";
import {TKUIW3wProps, TKUIW3wStyle} from "./TKUIW3w";
import genStyles from "../css/GenStyle.css";
import {TKUITheme} from "../jss/TKUITheme";

export const tKUIW3wDefaultStyle: TKUIStyles<TKUIW3wStyle, TKUIW3wProps> =
    (theme: TKUITheme) => ({
        main: {
            ...genStyles.flex
        },
        icon: {
            width: '40px',
            height: '40px'
        },
        details: {
            ...genStyles.flex,
            ...genStyles.column,
            ...genStyles.spaceBetween,
            marginLeft: '10px'
        },
        value: {
            ...genStyles.fontM
        },
        url: {
            ...genStyles.fontS,
            ...theme.textColorGray
        }
    });

export const TKUIW3wStyleForDoc = (props: TKUIW3wStyle) => null;
TKUIW3wStyleForDoc.displayName = 'TKUIW3w';