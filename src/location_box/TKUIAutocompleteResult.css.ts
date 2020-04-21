import {tKUIColors, TKUITheme} from "../jss/TKUITheme";
import {TKUIStyles} from "../jss/StyleHelper";
import {TKUIAutocompleteResultProps, TKUIAutocompleteResultStyle} from "./TKUIAutocompleteResult";
import genStyles from "../css/GenStyle.css";

export const tKUIAutocompleteResultDefaultStyle: TKUIStyles<TKUIAutocompleteResultStyle, TKUIAutocompleteResultProps> =
    (theme: TKUITheme) => ({
        main: {
            ...genStyles.flex,
            ...genStyles.alignCenter,
            ...genStyles.spaceBetween,
            padding: '12px 5px',
            fontSize: '13px',
            cursor: 'pointer',
            borderBottom: '1px solid #cbcbcb',
            margin: '0 5px',
            color:  '#4d4c4d',
            '&:last-child': {
                borderBottom: 'none'
            }
        },
        icon: {
            margin: '0 10px',
            height: '18px',
            width: '18px',
            color: tKUIColors.black1,
            ...genStyles.svgPathFillCurrColor,
            '&>*': {
                height: '18px',
                width: '18px'
            }
        },
        address: {
            ...genStyles.flex,
            ...genStyles.alignCenter,
            ...genStyles.justifyStart,
            ...genStyles.grow,
            whiteSpace: 'nowrap',
            overflowX: 'hidden',
            textOverflow: 'ellipsis',
            fontWeight: 'bold'
        },
        mainAddress: {
            color: 'black'
        },
        matchingSubstr: {
            fontWeight: 'bold'
        },
        secondaryAddress: {
            marginLeft: '5px',
            color: 'grey',
            fontWeight: 'initial',
            ...genStyles.overflowEllipsis
        }
    });

