import * as React from "react";
import {ThemeProvider, JssProvider, createGenerateClassName, StyleCreator} from 'react-jss'
import * as CSS from 'csstype';

export interface TKUITheme {
    colorPrimary: CSS.Color,
    colorSuccess: CSS.Color,
    colorError: CSS.Color,
    fontFamily: CSS.FontFamilyProperty
}

const tKUIDeaultTheme: TKUITheme = {
    colorPrimary: '#23b15e',
    colorSuccess: '#23b15e',
    colorError: '#e34040',
    fontFamily: 'ProximaNova',
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

export const generateClassName = (rule: any, sheet: any) => {
    return sheet.options.classNamePrefix + rule.key;
};

export const generateClassNameSeed = createGenerateClassName();

export interface ITKStyleProviderProps {
    theme?: TKUITheme
}

class TKStyleProvider extends React.Component<ITKStyleProviderProps, {}> {

    public render(): React.ReactNode {
        return (
            <JssProvider generateClassName={generateClassName}>
                <ThemeProvider theme={this.props.theme || tKUIDeaultTheme}>
                    <>
                        {this.props.children}
                    </>
                </ThemeProvider>
            </JssProvider>
        );
    }

}

export default TKStyleProvider;