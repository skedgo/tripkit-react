import * as React from "react";
import injectSheet from "react-jss";
import { Subtract } from "utility-types";
import { ClassNameMap, Styles, StyleCreator, WithSheet, CSSProperties } from "react-jss";
import {TKUITheme} from "../example/client-sample";
import * as CSS from 'csstype';

export type TKUIStyles<ST, PR> = Styles<keyof ST, PR> | StyleCreator<keyof ST, TKUITheme, PR>;

function withStyleProp<
        // S,
        // ST extends Record<S extends string & Styles & StyleCreator<keyof S, any>, ST>,
        ST,
        // CP extends WithSheet<keyof ST, object, CP>,
        CP extends {classes: ClassNameMap<keyof ST>},
        ExtS extends string,
        // P extends Subtract<CP, WithSheet<keyof ST, object, CP>> & {styles: Styles<ExtS, CP>}>
        // P extends Subtract<CP, {classes: ClassNameMap<keyof ST>}> & {styles: Styles<ExtS, CP>}>
        P extends Subtract<CP, {classes: ClassNameMap<keyof ST>}> & {styles?: TKUIStyles<ST, CP>}>
        // (Consumer: React.ComponentType<any>, obj: ST) {
        (Consumer: React.ComponentType<CP>, defaultStyle: TKUIStyles<ST, CP>) {

    return class WithStyleProp extends React.Component<P, {}> {

        private StyledComponent: any;

        constructor(props: P) {
            super(props);
            this.StyledComponent =
                this.props.styles ?
                injectSheet(this.props.styles as TKUIStyles<ST, CP>)(Consumer as any) :
                injectSheet(defaultStyle)(Consumer as any);
        }

        public render(): React.ReactNode {
            const {...props} = this.props as P;
            return <this.StyledComponent
                {...props}
            />;
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

export type CSSProps<T> = CSS.Properties & CSSProperties<T>

export {withStyleProp, emptyValues};