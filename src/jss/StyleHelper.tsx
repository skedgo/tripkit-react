import * as React from "react";
import injectSheet, {JssProvider, createGenerateClassName} from "react-jss";
import { Subtract } from "utility-types";
import { ClassNameMap, Styles, StyleCreator, WithSheet, CSSProperties } from "react-jss";
import * as CSS from 'csstype';
import {generateClassNameFactory, generateClassNameSeed, TKUITheme} from "./TKStyleProvider";

// TODO: implement a function that takes a default style, which is probably a function receiving a theme
// (TKUIStyles instance) and a style override, and returns a function from theme to style that aplies the first one and
// then applies the override, and returns (function composition). Allows clients to override a default style.
// Will also allow to avoid styles like TKUITimetableView.css.ts.buttonsPanel

export type TKUIStyles<ST, PR> = Styles<keyof ST, PR> | StyleCreator<keyof ST, TKUITheme, PR>;

export interface TKUIWithStyle<ST, CP> {
    styles?: TKUIStyles<ST, CP>,
    randomizeClassNames?: boolean
}

export interface TKUIWithClasses<ST> {
    classes: ClassNameMap<keyof ST>;
}

function withStyleProp<
        ST,
        CP extends {classes: ClassNameMap<keyof ST>},
        ExtS extends string,
        P extends Subtract<CP, {classes: ClassNameMap<keyof ST>}>
            & {styles: TKUIStyles<ST, CP>, randomizeClassNames?: boolean, classNamePrefix?: string}> // TODO: make it required
        (Consumer: React.ComponentType<CP>, classPrefix?: string) {

    return class WithStyleProp extends React.Component<P, {}> {

        private StyledComponent: any;
        private generateClassName: ((rule: any, sheet: any) => string) | undefined;

        constructor(props: P) {
            super(props);
            this.StyledComponent = injectSheet(this.props.styles as TKUIStyles<ST, CP>)(Consumer as any);
            this.generateClassName = generateClassNameFactory(classPrefix ? classPrefix : props.classNamePrefix!);
        }

        public render(): React.ReactNode {
            const {...props} = this.props as P;
            return <JssProvider generateClassName={this.props.randomizeClassNames !== false ?
                generateClassNameSeed : this.generateClassName}>
                <this.StyledComponent {...props}/>
            </JssProvider>
        }
    }
}

function emptyValues<T>(sample: T): T {
    const emptyValues = {};
    for (const key of Object.keys(sample)) {
        emptyValues[key] = {};
    }
    return emptyValues as T;
}

export type CSSProps<T> = CSS.Properties | CSSProperties<T>

export {withStyleProp, emptyValues};