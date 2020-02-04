import {TKUIStyles} from "../jss/StyleHelper";
import {TKUIProfileViewProps, TKUIProfileViewStyle} from "./TKUIProfileView";
import genStyles from "../css/GenStyle.css";
import {TKUITheme} from "../jss/TKUITheme";

export const tKUIProfileViewDefaultStyle: TKUIStyles<TKUIProfileViewStyle, TKUIProfileViewProps> =
    (theme: TKUITheme) => ({
        main: {
            padding: '30px',
            height: '100%',
            ...genStyles.flex,
            ...genStyles.column,
            '& label': {
                ...genStyles.flex,
                ...genStyles.alignCenter
            },
            '& label img': {
                width: '20px',
                height: '20px',
                marginLeft: '10px',
                ...genStyles.noShrink
            }
        },
        scrollPanel: {
            paddingBottom: '20px',
            ...genStyles.scrollableY
        },
        section: {
            marginBottom: '20px'
        },
        sectionTitle: {
            ...genStyles.fontM,
            marginBottom: '15px'
        },
        headerSeparation: {

        }
    });