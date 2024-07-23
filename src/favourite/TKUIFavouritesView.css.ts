import genStyles from "../css/GenStyle.css";
import { TKUITheme } from "..";

export const tKUIFavouritesViewDefaultStyle = (theme: TKUITheme) => ({
    main: {

    },
    subHeader: {
        ...genStyles.flex,
        marginTop: '10px'
    },
    editBtn: {
        padding: '0'
    }
});