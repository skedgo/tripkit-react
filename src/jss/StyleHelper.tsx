import React from "react";
import injectSheet, {JssProvider, withTheme} from "react-jss";
import { Subtract } from "utility-types";
import { ClassNameMap, Styles, StyleCreator, CSSProperties } from "react-jss";
import * as CSS from 'csstype';
import {generateClassNameFactory, generateClassNameSeed, TKUITheme} from "./TKUITheme";
import Util from "../util/Util";
import {TKI18nContextProps} from "../i18n/TKI18nProvider";

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

// TODO: maybe rename TKUIWithClasses to TKInjectedProps? It's not intuitive to extend this with TKI18nContextProps.
// See if can put as another consumer (IConsumedProps) (e.g. using a helper function to easily consume it) without
// adding too much boilerplate to current TKUI components scheme.
export interface TKUIWithClasses<STYLE, PROPS> extends TKI18nContextProps {
    injectedStyles: Styles<keyof STYLE, PROPS>,
    classes: ClassNameMap<keyof STYLE>;
    refreshStyles: () => void;
}

export function mergeStyles<ST,PR>(style1: TKUICustomStyles<ST, PR>, style2: TKUICustomStyles<ST, PR>): TKUICustomStyles<ST, PR> {
    return (theme: TKUITheme) => {
        const themedStyle1: Partial<CustomStyles<keyof ST, PR>> = Util.isFunction(style1) ?
            (style1 as TKUICustomStyleCreator<keyof ST, TKUITheme, PR>)(theme) :
            style1 as Partial<CustomStyles<keyof ST, PR>>;
        const themedStyle2: Partial<CustomStyles<keyof ST, PR>> = Util.isFunction(style2) ?
            (style2 as TKUICustomStyleCreator<keyof ST, TKUITheme, PR>)(theme) :
            style2 as Partial<CustomStyles<keyof ST, PR>>;
        const overrideStyles =
            Object.keys(themedStyle2)
                .reduce((overrideStylesMerge: Partial<CustomStyles<keyof ST, PR>>, className: string) => {
                    const style1CustomCssProps: TKUICustomCSSProperties<PR> = themedStyle1[className];
                    const style2CustomCssProps: TKUICustomCSSProperties<PR> = themedStyle2[className];
                    const mergedStyleProps: CSSPropertiesCreator<PR> =
                        (defaultStyle: CSSProperties<PR>) => {
                            const style1CssProps: CSSProperties<PR> = Util.isFunction(style1CustomCssProps) ?
                                (style1CustomCssProps as CSSPropertiesCreator<PR>)(defaultStyle) :
                                style1CustomCssProps as CSSProperties<PR>;
                            const style2CssProps: CSSProperties<PR> = Util.isFunction(style2CustomCssProps) ?
                                (style2CustomCssProps as CSSPropertiesCreator<PR>)(style1CssProps) :
                                style2CustomCssProps as CSSProperties<PR>;
                            return style2CssProps;
                        };
                    return {
                        ...overrideStylesMerge,
                        [className]: mergedStyleProps
                    }
                }, {});
        return {...style1, ...overrideStyles};
    }
}

export function withStyleInjection<
    STYLE,
    IMPL_PROPS extends TKUIWithClasses<STYLE, IMPL_PROPS>,
    ExtS extends string,
    P extends Subtract<IMPL_PROPS, TKUIWithClasses<STYLE, IMPL_PROPS>>
        & {defaultStyles: TKUIStyles<STYLE, IMPL_PROPS>, configStyles?: TKUICustomStyles<STYLE, IMPL_PROPS>, randomizeClassNames?: boolean, classNamePrefix?: string}>
(Consumer: React.ComponentType<IMPL_PROPS>, classPrefix?: string) { // TODO: remove classPrefix and make classNamePrefix required

    return class WithStyleProp extends React.Component<P, {}> {

        public StyledComponent: any;
        public generateClassName: ((rule: any, sheet: any) => string) | undefined;
        public stylesToInject: StyleCreator<keyof STYLE, TKUITheme, IMPL_PROPS>;
        public WithTheme: any;

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
            this.onRefreshStyles = this.onRefreshStyles.bind(this);
            this.onRefreshStyles();
        }

        /**
         * TODO: re-injecting sheet to refresh styles has the problem that it triggers the re-construction of the
         * entire subtree.
         * As per react-jss documentation, it seems that refresh of css on props update should happen automatically:
         * https://cssinjs.org/react-jss/?v=v10.0.0-alpha.3#dynamic-values
         * Investigate why it doesn't work.
         */
        public onRefreshStyles(forceUpdate: boolean = false) {
            const props = this.props;
            this.StyledComponent = injectSheet(this.stylesToInject)(Consumer as any);
            this.generateClassName = generateClassNameFactory(classPrefix ? classPrefix : props.classNamePrefix!);
            this.WithTheme = withTheme(({theme, ...props}) =>
                <JssProvider generateClassName={this.props.randomizeClassNames !== false ?
                    generateClassNameSeed : this.generateClassName}>
                    <this.StyledComponent {...props}
                                          injectedStyles={this.stylesToInject(theme as TKUITheme)}
                                          refreshStyles={() => this.onRefreshStyles(true)}
                    />
                </JssProvider>
            );
            if (forceUpdate) {
                this.forceUpdate();
            }
        }

        public render(): React.ReactNode {
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

        public StyledComponent: any;
        public generateClassName: ((rule: any, sheet: any) => string) | undefined;

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