import {createGenerateClassName} from 'react-jss'
import * as CSS from 'csstype';

export interface TKUITheme {
    colorPrimary: CSS.Color,
    colorSuccess: CSS.Color,
    colorInfo: CSS.Color,
    colorWarning: CSS.Color,
    colorError: CSS.Color,
    fontFamily: CSS.FontFamilyProperty
    colorPrimaryOpacity: (opacity: number) => CSS.Color,
}

export const tKUIDeaultTheme: TKUITheme = {
    colorPrimary: '#23b15e',
    colorSuccess: '#23b15e',
    colorInfo: '#2b7eed',
    colorWarning: '#fcba1e',
    colorError: '#e34040',
    fontFamily: 'ProximaNova, sans-serif',
    colorPrimaryOpacity: (opacity: number) => 'rgba(35, 177, 94, ' + opacity + ')'
};

export const tKUIColors = {
    black: '#212A33',
    black1: '#20293199',
    black2: '#212a334d',
    black3: '#212a332e',
    black4: '#212a331f',
    black5: '#20293114',
    white: '#fff',
    white1: '#fff9'
};

export const generateClassNameFactory = (prefix: string) =>
    (rule: any, sheet: any) => {
        return prefix + "-" + rule.key;
    };

export const generateClassNameSeed = createGenerateClassName();