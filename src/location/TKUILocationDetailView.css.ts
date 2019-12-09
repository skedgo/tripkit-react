import {TKUIStyles} from "../jss/StyleHelper";
import {TKUILocationDetailViewProps, TKUILocationDetailViewStyle} from "./TKUILocationDetailView";

export const tKUILocationDetailViewDefaultStyle: TKUIStyles<TKUILocationDetailViewStyle, TKUILocationDetailViewProps> = {
    main: {

    },
    actionsPanel: {
        marginTop: '15px',
        display: 'grid',
        gridTemplateColumns: 'auto auto auto',
        gridRowGap: '20px'
    }
};