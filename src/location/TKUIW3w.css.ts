import {TKUIStyles} from "../jss/StyleHelper";
import {TKUIW3wProps, TKUIW3wStyle} from "./TKUIW3w";
import genStyles from "../css/GenStyle.css";
import {tKUIColors} from "../jss/TKUITheme";

export const tKUIW3wDefaultStyle: TKUIStyles<TKUIW3wStyle, TKUIW3wProps> = {
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
        color: tKUIColors.black1
    }
};