import {createGenerateClassName} from 'react-jss'
import * as CSS from 'csstype';
import DeviceUtil from "../util/DeviceUtil";
import Color from "../model/trip/Color";

export interface TKUITheme {
    colorPrimary: CSS.Color,
    colorSuccess: CSS.Color,
    colorInfo: CSS.Color,
    colorWarning: CSS.Color,
    colorError: CSS.Color,
    fontFamily: CSS.FontFamilyProperty
    colorPrimaryOpacity: (opacity: number) => CSS.Color,
    colorWarningOpacity: (opacity: number) => CSS.Color,
}

export const tKUIDeaultTheme: TKUITheme = {
    colorPrimary: '#23b15e',
    colorSuccess: '#23b15e',
    colorInfo: '#454c50', // TODO: check with DuyCT, in design it's colorInfo: '#2b7eed'
    colorWarning: '#fcba1e',
    colorError: '#e34040',
    fontFamily: 'ProximaNova, sans-serif',
    // TODO: get rid of this, replace by Color.createFromString() (see TKUIAlertRow.css.ts).
    colorPrimaryOpacity: (opacity: number) => 'rgba(35, 177, 94, ' + opacity + ')',
    colorWarningOpacity: (opacity: number) => 'rgba(252, 186, 30, ' + opacity + ')'
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

if (DeviceUtil.isIE) { // Since IE doesn't support hex with alpha.
    tKUIColors.black1 = Color.createFromString('#212A33').toRGBA(.6);
    tKUIColors.black2 = Color.createFromString('#212A33').toRGBA(.3);
    tKUIColors.black3 = Color.createFromString('#212A33').toRGBA(.18);
    tKUIColors.black4 = Color.createFromString('#212A33').toRGBA(.12);
    tKUIColors.black5 = Color.createFromString('#212A33').toRGBA(.08);
}
