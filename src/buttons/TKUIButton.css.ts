import {TKUIStyles} from "../jss/StyleHelper";
import {tKUIColors, TKUITheme} from "../jss/TKStyleProvider";
import {ITKUIButtonProps, ITKUIButtonStyle} from "./TKUIButton";
import genStyles from "../css/GenStyle.css";
import {resetStyles} from "../css/ResetStyle.css";

export const tKUIButtonDefaultStyle: TKUIStyles<ITKUIButtonStyle, ITKUIButtonProps> =
    (theme: TKUITheme) => ({

        main: {
            ...resetStyles.button,
            ...genStyles.flex,
            ...genStyles.alignCenter,
            ...genStyles.center,
            ...genStyles.fontM,
            padding: '8px 20px',
            borderRadius: '20px',
            '& svg': {
                width: '100%',
                height: '100%'
            }
        },

        primary: {
            backgroundColor: theme.colorPrimary,
            color: 'white',
            '&:hover': {
                backgroundColor: '#7bd99d'
            },
            '&:active': {
                backgroundColor: '#079541'
            },
        },

        secondary: {
            background: 'none',
            color: 'black',
            border: '2px solid ' + tKUIColors.black4,
            '&:hover': {
                borderColor: tKUIColors.black2,
            },
            '&:active': {
                borderColor: tKUIColors.black4,
                backgroundColor: tKUIColors.black5
            },
            '& svg': {
                color: tKUIColors.black1
            }
        },

        iconContainer: {
            width: '20px',
            height: '20px',
            marginRight: '15px',
            '& svg': {
                ...genStyles.svgFillCurrColor
            }
        }

    });