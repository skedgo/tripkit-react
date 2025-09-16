import { createGenerateId } from 'react-jss'
import { Property, Properties } from 'csstype';
import DeviceUtil from "../util/DeviceUtil";
import Color from "../model/trip/Color";
import genStyles from "../css/GenStyle.css";
import { IThemeCreatorProps } from '../config/TKUIConfig';

export const TKUIThemeForDoc = (props: Partial<TKUITheme>) => null;
TKUIThemeForDoc.displayName = 'TKUITheme';

export const tKUIColors = {
    black: '#212A33',       // rgb(33,42,51)
    black1: '#212a33a6',    // rgba(33,42,51,.65)
    black2: '#212a334d',
    black3: '#212a332e',
    black4: '#212a331f',
    black5: '#212a3314',
    white: '#ffffff',
    white1: '#ffffffa6',
    white2: '#ffffff4d',
    white3: '#ffffff2e',
    white4: '#ffffff1f',
    white5: '#ffffff14'
};

export function colorWithOpacity(colorS: string, opacity: number): string {
    return Color.createFromString(colorS).toRGBA(opacity);
}

export const queryWidth = 384;
function cardSpacing(landscape: boolean = true) {
    return landscape ? 16 : 5;
}

export function black(n: 0 | 1 | 2 | 3 | 4 | 5 = 0, dual: boolean = false): string {
    return dual ? white(n) : tKUIColors[Object.keys(tKUIColors)[n]];
}

export function white(n: 0 | 1 | 2 | 3 | 4 | 5 = 0, dual: boolean = false): string {
    return dual ? black(n) : tKUIColors[Object.keys(tKUIColors)[n + 6]];
}

function important(style: Properties): Properties {
    const styleImportant = { ...style };
    for (const key of Object.keys(style)) {
        if (styleImportant[key].includes('!important')) {
            continue;
        }
        styleImportant[key] = styleImportant[key] + '!important';
    }
    return styleImportant;
}


export interface TKUITheme {
    colorPrimary: Property.Color;
    colorSuccess: Property.Color;
    colorInfo: Property.Color;
    colorWarning: Property.Color;
    colorError: Property.Color;

    fontFamily: Property.FontFamily;

    isDark: boolean;
    isLight: boolean;    // Shouldn't be customizable, it's derived: always the opposite of isDark.

    isHighContrast: boolean;

    // textColorDefault: CSSProps<{}>;
    textColorDefault: any;
    textColorGray: any;
    textColorDisabled: any;

    textSizeBody: any;
    textSizeCaption: any;

    textWeightRegular: any;
    textWeightMedium: any;
    textWeightSemibold: any;
    textWeightBold: any;

    cardBackground: any;
    secondaryBackground: any;
    divider: any;
    modalFog: any;

}

const tKUIDeaultTheme: (props: IThemeCreatorProps) => TKUITheme =
    ({ isDark, isHighContrast }) => {
        const isLight = !isDark;
        return {
            // Brand colors
            colorPrimary: isLight ? '#008543' : '#26d06d',
            colorSuccess: isHighContrast ? '#24883D' : '#23b15e',
            colorInfo: '#2e3336', // TODO: check with DuyCT, in design it's colorInfo: '#2b7eed'
            colorWarning: isHighContrast ? '#AE6500' : '#fcba1e',
            colorError: '#e34040',

            fontFamily: 'sans-serif',

            /**
             * @ignore
             */
            isDark: isDark,
            /**
             * @ignore
             */
            isLight: isLight,
            /**
             * @ignore
             */
            isHighContrast,

            textColorDefault: {
                color: isHighContrast ? (isLight ? 'black' : 'white') : (isLight ? tKUIColors.black : tKUIColors.white),
            },
            textColorGray: {
                color: isHighContrast ? (isLight ? tKUIColors.black : tKUIColors.white) : (isLight ? tKUIColors.black1 : tKUIColors.white1)
            },
            textColorDisabled: {
                color: isHighContrast ? (isLight ? tKUIColors.black1 : tKUIColors.white1) : (isLight ? tKUIColors.black2 : tKUIColors.white2)
            },

            textSizeBody: genStyles.fontM,
            textSizeCaption: genStyles.fontS,

            textWeightRegular: {
                fontWeight: 'normal'    // 400
            },
            textWeightMedium: {
                fontWeight: 500
            },
            textWeightSemibold: {
                fontWeight: 600
            },
            textWeightBold: {
                fontWeight: 700
            },

            cardBackground: {
                backgroundColor: white(0, isDark),
                boxShadow: !isDark ?
                    `0 0 4px 0 rgba(0,0,0,${isHighContrast ? 1 : .2}), 0 6px 12px 0 rgba(0,0,0,.08)!important` :
                    `0 0 4px 0 rgba(255,255,255,${isHighContrast ? 1 : .2}), 0 6px 12px 0 rgba(255,255,255,.08)!important`,
                ...genStyles.borderRadius(12),
            },
            secondaryBackground: {
                backgroundColor: isLight ? '#F6F6F6' : '#384450',
            },
            divider: {
                borderBottom: '1px solid ' + black(isHighContrast ? 1 : 4, isDark)
            },
            modalFog: {
                background: (!isDark ? 'rgba(255, 255, 255, 0.75)' : colorWithOpacity(tKUIColors.black, .75)),
            }

        };
    };

export const generateClassNameFactory = (prefix: string) =>
    (rule: any, sheet: any) => {
        return prefix + "-" + rule.key;
    };

// Specify type any to avoid the following error. TODO find root cause.
// TS2742: The inferred type of 'generateClassNameSeed' cannot be named without a reference to 'react-jss/node_modules/jss'. This is likely not portable. A type annotation is necessary.
export const generateClassNameSeed: any = createGenerateId();

if (DeviceUtil.isIE) { // Since IE doesn't support hex with alpha.
    tKUIColors.black1 = colorWithOpacity('#212A33', .65);
    tKUIColors.black2 = colorWithOpacity('#212A33', .3);
    tKUIColors.black3 = colorWithOpacity('#212A33', .18);
    tKUIColors.black4 = colorWithOpacity('#212A33', .12);
    tKUIColors.black5 = colorWithOpacity('#212A33', .08);
    tKUIColors.white1 = colorWithOpacity('#ffffff', .6);
    tKUIColors.white2 = colorWithOpacity('#ffffff', .3);
    tKUIColors.white3 = colorWithOpacity('#ffffff', .18);
    tKUIColors.white4 = colorWithOpacity('#ffffff', .12);
    tKUIColors.white5 = colorWithOpacity('#ffffff', .08);
}

export { cardSpacing, important, tKUIDeaultTheme };