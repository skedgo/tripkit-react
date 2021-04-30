import React from "react";
import injectSheet, {JssProvider, withTheme} from "react-jss";
import { Subtract } from "utility-types";
import { ClassNameMap, Styles, StyleCreator, CSSProperties } from "react-jss";
import * as CSS from 'csstype';
import {generateClassNameFactory, generateClassNameSeed, TKUITheme} from "./TKUITheme";
import Util from "../util/Util";
import {TKI18nContextProps} from "../i18n/TKI18nProvider";
import Environment from "../env/Environment";

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

export type CSSProps<Props> = CSS.Properties | CSSProperties<Props>;

export type TKCSSProperties<Props> = CSSProperties<Props>;

export interface TKUIWithStyle<ST, CP> {
    /**
     * Where:
     *
     * - StylesOverride is defined as:
     *
     * ```
     * type StylesOverride = {
     *      [class: string]:
     *          CSSProps |
     *          (defaultStyle: CSSProps) => CSSProps
     * }
     * ```
     *
     * - CSSProps is an object with camelCased properties like that passed to
     * [```style``` attribute](https://reactjs.org/docs/dom-elements.html#style) of React components.
     *
     * For more information see [here](#/Component-level%20Customization/Styles?id=pass-styles-directly-to-component).
     *
     * @ctype StylesOverride | (theme: TKUITheme) => StylesOverride
     */
    styles?: TKUICustomStyles<ST, CP>,
    /**
     * @ignore
     */
    randomizeClassNames?: boolean
}

// TODO: maybe rename TKUIWithClasses to TKInjectedProps? It's not intuitive to extend this with TKI18nContextProps.
// See if can put as another consumer (IConsumedProps) (e.g. using a helper function to easily consume it) without
// adding too much boilerplate to current TKUI components scheme.
export interface TKUIWithClasses<STYLE, PROPS> extends TKI18nContextProps {
    injectedStyles: Styles<keyof STYLE, PROPS>,
    classes: ClassNameMap<keyof STYLE>;
    refreshStyles: () => void;
    theme: TKUITheme;
}

export function mergeCustomStyles<ST,PR>(style1: TKUICustomStyles<ST, PR>, style2: TKUICustomStyles<ST, PR>): TKUICustomStyles<ST, PR> {
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

export function overrideStyles<ST,PR>(style: TKUIStyles<ST, PR>, styleOverride: TKUICustomStyles<ST, PR>): StyleCreator<keyof ST, TKUITheme, PR> {
    return (theme: TKUITheme) => {
        const themedStyle: Styles<keyof ST, PR> = Util.isFunction(style) ?
            (style as StyleCreator<keyof ST, TKUITheme, PR>)(theme) :
            style as Styles<keyof ST, PR>;
        const themedStyleOverride: Partial<CustomStyles<keyof ST, PR>> = Util.isFunction(styleOverride) ?
            (styleOverride as TKUICustomStyleCreator<keyof ST, TKUITheme, PR>)(theme) :
            styleOverride as Partial<CustomStyles<keyof ST, PR>>;
        const overrideStyles =
            Object.keys(themedStyleOverride)
                .reduce((overrideStylesMerge: Partial<Styles<keyof ST, PR>>, className: string) => {
                    const cssProps: CSSProperties<PR> = themedStyle[className];
                    const cssPropsOverride: TKUICustomCSSProperties<PR> = themedStyleOverride[className];
                    const cssPropsOverridden: CSSProperties<PR> = Util.isFunction(cssPropsOverride) ?
                        (cssPropsOverride as CSSPropertiesCreator<PR>)(cssProps) :
                        cssPropsOverride as CSSProperties<PR>;
                    return {
                        ...overrideStylesMerge,
                        [className]: cssPropsOverridden
                    }
                }, {});
        return {...themedStyle, ...overrideStyles};
    }
}

export function withStyleInjection<
    STYLE,
    IMPL_PROPS extends TKUIWithClasses<STYLE, IMPL_PROPS>,
    ExtS extends string,
    P extends Subtract<IMPL_PROPS, TKUIWithClasses<STYLE, IMPL_PROPS>> & {
        defaultStyles: TKUIStyles<STYLE, IMPL_PROPS>,
        propStyles?: TKUICustomStyles<STYLE, IMPL_PROPS>,
        configStyles?: TKUICustomStyles<STYLE, IMPL_PROPS>,
        randomizeClassNames?: boolean,
        classNamePrefix?: string,
        verboseClassNames?: boolean}>
(Consumer: React.ComponentType<IMPL_PROPS>) { // TODO: make classNamePrefix required

    return class WithStyleProp extends React.Component<P, {}> {

        public StyledComponent: any;
        public generateClassName: ((rule: any, sheet: any) => string) | undefined;
        public stylesToInject: StyleCreator<keyof STYLE, TKUITheme, IMPL_PROPS>;
        public WithTheme: any;

        constructor(props: P) {
            super(props);
            const merge1 = overrideStyles(this.props.defaultStyles, this.props.configStyles ? this.props.configStyles : {});
            this.stylesToInject = this.props.propStyles ? overrideStyles(merge1, this.props.propStyles) : merge1;
            this.onRefreshStyles = this.onRefreshStyles.bind(this);
            this.onRefreshStyles();
        }

        /**
         * TODO: re-injecting sheet to refresh styles has the problem that it triggers the re-construction of the
         * entire subtree.
         * As per react-jss documentation, it seems that refresh of css on props update should happen automatically:
         * https://cssinjs.org/react-jss/?v=v10.0.0-alpha.3#dynamic-values
         * Investigate why it doesn't work.
         * Try workaround of forcing an artificial update of theme (maybe just re-setting a shallow copy of theme) to
         * get prop dependent styles refreshed.
         */
        public onRefreshStyles(forceUpdate: boolean = false) {
            const props = this.props;
            this.StyledComponent = injectSheet(this.stylesToInject)(Consumer as any);
            const prefix = props.classNamePrefix!;
            this.generateClassName = generateClassNameFactory(prefix);
            this.WithTheme = withTheme(({theme, ...props}) =>
                <JssProvider
                    classNamePrefix={Environment.isDev() ? prefix : undefined}
                    generateClassName={this.props.randomizeClassNames === false ? this.generateClassName :
                        this.props.verboseClassNames === true ?
                            (rule: any, sheet: any) => {
                                return prefix + "-" + rule.key + "-" + generateClassNameSeed(rule, sheet);
                            } : generateClassNameSeed}>
                    <this.StyledComponent {...props}
                                          injectedStyles={this.stylesToInject(theme as TKUITheme)}
                                          refreshStyles={() => this.onRefreshStyles(true)}
                                          theme={theme}
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

export function withStyles<PROPS extends TKUIWithClasses<STYLE, PROPS>, STYLE>(
    Consumer: React.ComponentType<PROPS>,
    stylesJss: (theme: TKUITheme) => STYLE) {
    const StyledComponent: any = injectSheet(stylesJss)(Consumer as any);
    const WithTheme = withTheme(({theme, ...props}) =>
        <StyledComponent
            {...props}
            injectedStyles={stylesJss(theme)}
            refreshStyles={() => {}}
            theme={theme}
        />);
    return (props: Subtract<PROPS, TKUIWithClasses<STYLE, PROPS>>) => {
        const consumerProps = {...props} as PROPS; // See why I need to do this.
        return <WithTheme {...consumerProps}/>;
    };
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

export function overrideClass(propsOverride: CSSProperties<any>) {
    return (defaultStyle) => ({
        ...defaultStyle,
        ...propsOverride
    });
}

export {withStyleProp, emptyValues};