import {TKUIStyles} from "../jss/StyleHelper";
import {TKUIFavouritesViewProps, TKUIFavouritesViewStyle} from "./TKUIFavouritesView";
import genStyles from "../css/GenStyle.css";

export const tKUIFavouritesViewDefaultStyle: TKUIStyles<TKUIFavouritesViewStyle, TKUIFavouritesViewProps> = {
    main: {

    },
    subHeader: {
        ...genStyles.flex,
        marginTop: '10px'
    },
    editBtn: {
        padding: '0'
    }
};