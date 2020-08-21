import { Styles } from "react-jss";
import {TKDocComponentProps} from "./TKDocComponent";
import genStyles from "../../css/GenStyle.css";

export const tKDocComponentStyle: Styles<string, TKDocComponentProps> = {
    section: {
        marginBottom: '24px'
    },
    sectionTitle: {
        ...genStyles.fontL,
        padding: '10px 0'
    },
    cssTip: {
        margin: '24px 0'
    }
};