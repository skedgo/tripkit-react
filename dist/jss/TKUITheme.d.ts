import * as CSS from 'csstype';
export interface TKUITheme {
    colorPrimary: CSS.Color;
    colorSuccess: CSS.Color;
    colorInfo: CSS.Color;
    colorWarning: CSS.Color;
    colorError: CSS.Color;
    fontFamily: CSS.FontFamilyProperty;
    colorPrimaryOpacity: (opacity: number) => CSS.Color;
    colorWarningOpacity: (opacity: number) => CSS.Color;
}
export declare const tKUIDeaultTheme: TKUITheme;
export declare const tKUIColors: {
    black: string;
    black1: string;
    black2: string;
    black3: string;
    black4: string;
    black5: string;
    white: string;
    white1: string;
};
export declare const generateClassNameFactory: (prefix: string) => (rule: any, sheet: any) => string;
export declare const generateClassNameSeed: import("jss").GenerateClassName<any>;
