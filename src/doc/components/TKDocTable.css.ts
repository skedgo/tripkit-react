import { Styles } from "react-jss";
import {TKDocStyleProps} from "./TKDocStyle";

export const tKDocTableStyle: Styles<string, TKDocStyleProps> = {
    table: {
        width: '100%',
        fontFamily: 'sans-serif',
        borderCollapse: 'collapse'
    },
    tableHead: {
        borderBottom: '1px solid rgb(232, 232, 232)'
    },
    headerCell: {
        textAlign: 'left',
        fontSize: '13px',
        padding: '8px 16px 8px 0'
    },
    cell: {
        fontSize: '13px',
        padding: '8px 16px 8px 0'
    },
    divider: {
        borderBottom: '1px solid rgb(232, 232, 232)'
    }
};