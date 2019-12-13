import {TKUIStyles} from "../jss/StyleHelper";
import {TKUIProfileViewProps, TKUIProfileViewStyle} from "./TKUIProfileView";
import genStyles from "../css/GenStyle.css";

export const tKUIProfileViewDefaultStyle: TKUIStyles<TKUIProfileViewStyle, TKUIProfileViewProps> = {
    main: {

    },
    section: {
        marginBottom: '20px'
    },
    sectionTitle: {
        ...genStyles.fontM,
        marginBottom: '15px'
    }
};