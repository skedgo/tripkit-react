import { TKUIServiceDepartureRowProps, TKUIServiceDepartureRowStyle } from "./TKUIServiceDepartureRow";
import { TKUITheme } from "../jss/TKUITheme";
import { TKUIStyles } from "../jss/StyleHelper";
export declare const rowStyle: {
    padding: string;
    '&:hover': {
        backgroundColor: string;
    };
    '&:active': {
        backgroundColor: string;
    };
};
export declare const rowSelectedStyle: (theme: TKUITheme) => {
    borderLeft: string;
    paddingLeft: string;
    backgroundColor: string;
};
export declare const tKUIServiceDepartureRowDefaultStyle: TKUIStyles<TKUIServiceDepartureRowStyle, TKUIServiceDepartureRowProps>;
