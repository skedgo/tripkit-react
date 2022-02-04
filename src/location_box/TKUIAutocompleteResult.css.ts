import {black, colorWithOpacity, tKUIColors, TKUITheme, white} from "../jss/TKUITheme";
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
            ...theme.divider,
            margin: '0 5px',
            ...theme.textColorDefault,
            '&:last-child': {
                borderBottom: 'none'
            }
        },
        highlighted: {
            background: theme.isLight ? '#efeded' : white(3)
        },
        icon: {
            margin: '0 10px',
            height: '18px',
            ...theme.textColorGray,
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
            ...theme.textWeightBold
        },
        mainAddress: {
            ...theme.textColorDefault
        },
        matchingSubstr: {
            ...theme.textWeightBold
        },
        secondaryAddress: {
            marginLeft: '5px',
            ...theme.textColorGray,
            ...theme.textWeightRegular,
            ...genStyles.overflowEllipsis
        }
    });

