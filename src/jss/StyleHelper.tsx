import * as React from "react";
import injectSheet, {JssProvider, createGenerateClassName, withTheme} from "react-jss";
import { Subtract } from "utility-types";
import { ClassNameMap, Styles, StyleCreator, WithSheet, CSSProperties } from "react-jss";
import * as CSS from 'csstype';
import {generateClassNameFactory, generateClassNameSeed, TKUITheme} from "./TKUITheme";
import Util from "../util/Util";

export type TKUIStyles<ST, PR> = Styles<keyof ST, PR> | StyleCreator<keyof ST, TKUITheme, PR>;

export type TKUICustomStyles<ST, PR> = Partial<CustomStyles<keyof ST, PR>> | TKUICustomStyleCreator<keyof ST, TKUITheme, PR>;

export type TKUICustomStyleCreator<C extends string | number | symbol = string, T extends {} = {}, Props = {}> = (
    theme: T
) => Partial<CustomStyles<C, Props>>;

export type CustomStyles<ClassKey extends string | number | symbol = string, Props = {}> = Record<
    ClassKey,
    TKUICustomCSSProperties<Props>
    >;

export type CSSPropertiesCreator<Props> = ((defaultStyle: CSSProperties<Props>) => CSSProperties<Props>);

export type TKUICustomCSSProperties<Props> = CSSProperties<Props> | CSSPropertiesCreator<Props>;

export type CSSProps<Props> = CSS.Properties | CSSProperties<Props>

export interface TKUIWithStyle<ST, CP> {
    styles?: TKUIStyles<ST, CP>,
    randomizeClassNames?: boolean
}

export interface TKUIWithClasses<STYLE, PROPS> {
    injectedStyles: TKUIStyles<STYLE, PROPS>,
    classes: ClassNameMap<keyof STYLE>;
}

export function withStyleInjection<
    STYLE,
    IMPL_PROPS extends TKUIWithClasses<STYLE, IMPL_PROPS>,
    ExtS extends string,
    P extends Subtract<IMPL_PROPS, TKUIWithClasses<STYLE, IMPL_PROPS>>
        & {defaultStyles: TKUIStyles<STYLE, IMPL_PROPS>, configStyles?: TKUICustomStyles<STYLE, IMPL_PROPS>, randomizeClassNames?: boolean, classNamePrefix?: string}>
(Consumer: React.ComponentType<IMPL_PROPS>, classPrefix?: string) { // TODO: remove classPrefix and make classNamePrefix required

    return class WithStyleProp extends React.Component<P, {}> {

        private StyledComponent: any;
        private generateClassName: ((rule: any, sheet: any) => string) | undefined;
        private stylesToInject: StyleCreator<keyof STYLE, TKUITheme, IMPL_PROPS>;
        private WithTheme: any;

        constructor(props: P) {
            super(props);
            this.stylesToInject = (theme: TKUITheme) => {
                const defaultStyles = (Util.isFunction(this.props.defaultStyles) ?
                    (this.props.defaultStyles as StyleCreator<keyof STYLE, TKUITheme, IMPL_PROPS>)(theme) :
                    this.props.defaultStyles as Styles<keyof STYLE, IMPL_PROPS>);
                const customStyles: Partial<CustomStyles<keyof STYLE, IMPL_PROPS>> = (Util.isFunction(this.props.configStyles) ?
                    (this.props.configStyles as TKUICustomStyleCreator<keyof STYLE, TKUITheme, IMPL_PROPS>)(theme) :
                    this.props.configStyles as Partial<Styles<keyof STYLE, IMPL_PROPS>>);
                const overrideStyles = customStyles ?
                    Object.keys(customStyles)
                        .reduce((overrideStyles: Partial<Styles<keyof STYLE, IMPL_PROPS>>, className: string) => {
                            const customStyle: TKUICustomCSSProperties<IMPL_PROPS> = customStyles[className];
                            const customJssStyle: CSSProperties<IMPL_PROPS> = Util.isFunction(customStyle) ?
                                (customStyle as CSSPropertiesCreator<IMPL_PROPS>)(defaultStyles[className]) :
                                customStyle as CSSProperties<IMPL_PROPS>;
                            return {
                                ...overrideStyles,
                                [className]: customJssStyle
                            }
                        }, {}) : {};
                return {...defaultStyles, ...overrideStyles};
            };
            this.StyledComponent = injectSheet(this.stylesToInject)(Consumer as any);
            this.generateClassName = generateClassNameFactory(classPrefix ? classPrefix : props.classNamePrefix!);
            this.WithTheme = withTheme(({theme, ...props}) =>
                <JssProvider generateClassName={this.props.randomizeClassNames !== false ?
                    generateClassNameSeed : this.generateClassName}>
                    <this.StyledComponent {...props} injectedStyles={this.stylesToInject(theme as TKUITheme)}/>
                    {/*<this.StyledComponent {...props} />*/}
                </JssProvider>
            );
        }

        public render(): React.ReactNode {
            const props = this.props;
            return <this.WithTheme {...this.props}/>;
        }
    }
}

// Deprecated
function withStyleProp<
        ST,
        CP extends {classes: ClassNameMap<keyof ST>},
        ExtS extends string,
        P extends Subtract<CP, {classes: ClassNameMap<keyof ST>}>
            & {styles: TKUIStyles<ST, CP>, randomizeClassNames?: boolean, classNamePrefix?: string}>
        (Consumer: React.ComponentType<CP>, classPrefix?: string) { // TODO: remove classPrefix and make classNamePrefix required

    return class WithStyleProp extends React.Component<P, {}> {

        private StyledComponent: any;
        private generateClassName: ((rule: any, sheet: any) => string) | undefined;

        constructor(props: P) {
            super(props);
            this.StyledComponent = injectSheet(this.props.styles as TKUIStyles<ST, CP>)(Consumer as any);
            this.generateClassName = generateClassNameFactory(classPrefix ? classPrefix : props.classNamePrefix!);
        }

        public render(): React.ReactNode {
            const props = this.props;
            // const {...props} = this.props as P;
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

export {withStyleProp, emptyValues};