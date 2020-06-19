import {createGenerateClassName} from 'react-jss'
import * as CSS from 'csstype';
import DeviceUtil from "../util/DeviceUtil";
import Color from "../model/trip/Color";
import genStyles from "../css/GenStyle.css";

export const tKUIColors = {
    black: '#212A33',
    black1: '#20293199',
    black2: '#212a334d',
    black3: '#212a332e',
    black4: '#212a331f',
    black5: '#20293114',
    white: '#ffffff',
    white1: '#fff9',
    white2: '#ffffff4d',
    white3: '#ffffff2e',
    white4: '#ffffff1f',
    white5: '#ffffff14'
};

export function colorWithOpacity(colorS: string, opacity: number): string {
    return Color.createFromString(colorS).toRGBA(opacity);
}

export const queryWidth = 384;
export function cardSpacing(landscape: boolean = true) {
    return landscape ? 16 : 5;
}

export function black(n: 0 | 1 | 2 | 3 | 4 | 5 = 0, dual: boolean = false): string {
    return dual ? white(n) : tKUIColors[Object.keys(tKUIColors)[n]];
}

export function white(n: 0 | 1 | 2 | 3 | 4 | 5 = 0, dual: boolean = false): string {
    return dual ? black(n) : tKUIColors[Object.keys(tKUIColors)[n + 6]];
}

export function important(style: CSS.Properties): CSS.Properties {
    const styleImportant = {...style};
    for (const key of Object.keys(style)) {
        if (styleImportant[key].includes('!important')) {
            continue;
        }
        styleImportant[key] = styleImportant[key] + '!important';
    }
    return styleImportant;
}


export interface TKUITheme {
    colorPrimary: CSS.Color;
    colorSuccess: CSS.Color;
    colorInfo: CSS.Color;
    colorWarning: CSS.Color;
    colorError: CSS.Color;

    fontFamily: CSS.FontFamilyProperty;

    isDark: boolean;
    isLight: boolean;    // Shouldn't be customizable, it's derived: always the opposite of isDark.

    textColorDefault: CSS.Properties;
    textColorGray: CSS.Properties;
    textColorDisabled: CSS.Properties;

    textSizeBody: CSS.Properties;
    textSizeCaption: CSS.Properties;

    textWeightRegular: CSS.Properties;
    textWeightMedium: CSS.Properties;
    textWeightSemibold: CSS.Properties;
    textWeightBold: CSS.Properties;

    cardBackground: CSS.Properties;
    divider: CSS.Properties;
    modalFog: CSS.Properties;

}

export const tKUIDeaultTheme: (isDark: boolean) => TKUITheme =
    (isDark: boolean) => {
        const isLight = !isDark;
        return {
            // Brand colors
            colorPrimary: '#23b15e',
            colorSuccess: '#23b15e',
            colorInfo: '#454c50', // TODO: check with DuyCT, in design it's colorInfo: '#2b7eed'
            colorWarning: '#fcba1e',
            colorError: '#e34040',

            fontFamily: 'sans-serif',

            isDark: isDark,
            isLight: isLight,

            textColorDefault: {
                color: isLight ? tKUIColors.black : tKUIColors.white
            },
            textColorGray: {
                color: isLight ? tKUIColors.black1: tKUIColors.white1
            },
            textColorDisabled: {
                color: isLight ? tKUIColors.black2 : tKUIColors.white2
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
                backgroundColor: !isDark ? tKUIColors.white : tKUIColors.black,
                boxShadow: !isDark ?
                    '0 0 4px 0 rgba(0,0,0,.2), 0 6px 12px 0 rgba(0,0,0,.08)' :
                    '0 0 4px 0 rgba(255,255,255,.2), 0 6px 12px 0 rgba(255,255,255,.08)',
                ...genStyles.borderRadius(12)
            },
            divider: {
                borderBottom: '1px solid ' + black(4, isDark)
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

export const generateClassNameSeed = createGenerateClassName();

if (DeviceUtil.isIE) { // Since IE doesn't support hex with alpha.
    tKUIColors.black1 = Color.createFromString('#212A33').toRGBA(.6);
    tKUIColors.black2 = Color.createFromString('#212A33').toRGBA(.3);
    tKUIColors.black3 = Color.createFromString('#212A33').toRGBA(.18);
    tKUIColors.black4 = Color.createFromString('#212A33').toRGBA(.12);
    tKUIColors.black5 = Color.createFromString('#212A33').toRGBA(.08);
}
