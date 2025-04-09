import React, { useContext } from "react";
import { JssProvider, useTheme, createUseStyles } from "react-jss";
import { Subtract } from "utility-types";
import { Classes } from "jss";
import { Styles } from "react-jss";
import * as CSS from 'csstype';
import { generateClassNameFactory, generateClassNameSeed, TKUITheme } from "./TKUITheme";
import Util from "../util/Util";
import { TKI18nContext, TKI18nContextProps } from "../i18n/TKI18nProvider";
import Environment from "../env/Environment";
import { renderToStaticMarkup as renderToStaticMarkupDomServer } from "react-dom/server";

type StyleCreator<
    Name extends string | number | symbol = string,
    Theme = undefined,
    Props = unknown
> = ((theme: Theme) => Styles<Name, Props>);

type FcValues<PR> = ((props: PR) => CSS.Properties);
type CSSProperties<PR> = FcValues<PR>;
// type CSSProperties<PR> = JssStyle<PR>;

export type TKUIStyles<ST, PR> = Styles<keyof ST, PR> | StyleCreator<keyof ST, TKUITheme, PR>;

export type TKUICustomStyles<ST, PR> = Partial<CustomStyles<keyof ST, PR>> | TKUICustomStyleCreator<keyof ST, TKUITheme, PR>;

export type TKUICustomStyleCreator<C extends string | number | symbol = string, T extends {} = {}, Props = {}> = (
    theme: T
) => Partial<CustomStyles<C, Props>>;

export type CustomStyles<ClassKey extends string | number | symbol = string, Props = {}> = Record<
    ClassKey,
    TKUICustomCSSProperties<Props>
>;

export type CSSPropertiesCreator<Props> = ((defaultStyle: CSSProps<Props>) => CSSProps<Props>);

export type TKUICustomCSSProperties<Props> = CSSProps<Props> | CSSPropertiesCreator<Props>;

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
    styles?: TKUICustomStyles<ST, CP>;
    /**
     * @ignore
     */
    randomizeClassNames?: boolean;
}

// TODO: maybe rename TKUIWithClasses to TKInjectedProps? It's not intuitive to extend this with TKI18nContextProps.
// See if can put as another consumer (IConsumedProps) (e.g. using a helper function to easily consume it) without
// adding too much boilerplate to current TKUI components scheme.
export interface TKUIWithClasses<STYLE, PROPS> extends TKI18nContextProps {
    injectedStyles: Styles<keyof STYLE, PROPS>,
    classes: Classes<keyof STYLE>;
    refreshStyles: () => void;
    theme: TKUITheme;
}

export function mergeCustomStyles<ST, PR>(style1: TKUICustomStyles<ST, PR>, style2: TKUICustomStyles<ST, PR>): TKUICustomStyles<ST, PR> {
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
                        (defaultStyle: CSSProps<PR>) => {
                            const style1CssProps: CSSProps<PR> = Util.isFunction(style1CustomCssProps) ?
                                (style1CustomCssProps as CSSPropertiesCreator<PR>)(defaultStyle) :
                                style1CustomCssProps as CSSProps<PR>;
                            const style2CssProps: CSSProps<PR> = Util.isFunction(style2CustomCssProps) ?
                                (style2CustomCssProps as CSSPropertiesCreator<PR>)(style1CssProps) :
                                style2CustomCssProps as CSSProps<PR>;
                            return style2CssProps;
                        };
                    return {
                        ...overrideStylesMerge,
                        [className]: mergedStyleProps
                    }
                }, {});
        return { ...style1, ...overrideStyles };
    }
}

export function overrideStyles<ST, PR>(style: TKUIStyles<ST, PR>, styleOverride: TKUICustomStyles<ST, PR>): StyleCreator<keyof ST, TKUITheme, PR> {
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
                    const cssProps: CSSProps<PR> = themedStyle[className];
                    const cssPropsOverride: TKUICustomCSSProperties<PR> = themedStyleOverride[className];
                    const cssPropsOverridden: CSSProps<PR> = Util.isFunction(cssPropsOverride) ?
                        (cssPropsOverride as CSSPropertiesCreator<PR>)(cssProps) :
                        cssPropsOverride as CSSProps<PR>;
                    return {
                        ...overrideStylesMerge,
                        [className]: cssPropsOverridden
                    }
                }, {});
        return { ...themedStyle, ...overrideStyles };
    }
}

export function mergeStyleOverrides<ST, PR>(styleOverride1: TKUICustomStyles<ST, PR>, styleOverride2: TKUICustomStyles<ST, PR>): TKUICustomStyleCreator<keyof ST, TKUITheme, PR> {
    return (theme: TKUITheme) => {
        const themedStyleOverride1: Partial<CustomStyles<keyof ST, PR>> = Util.isFunction(styleOverride1) ?
            (styleOverride1 as TKUICustomStyleCreator<keyof ST, TKUITheme, PR>)(theme) :
            styleOverride1 as Partial<CustomStyles<keyof ST, PR>>;
        const themedStyleOverride2: Partial<CustomStyles<keyof ST, PR>> = Util.isFunction(styleOverride2) ?
            (styleOverride2 as TKUICustomStyleCreator<keyof ST, TKUITheme, PR>)(theme) :
            styleOverride2 as Partial<CustomStyles<keyof ST, PR>>;
        const overrideStyles =
            Object.keys(themedStyleOverride2)
                .reduce((overrideStylesMerge: Partial<CustomStyles<keyof ST, PR>>, className: string) => {
                    const classOverride = defaultStyle => {
                        const cssPropsOverride1: TKUICustomCSSProperties<PR> = themedStyleOverride1[className];
                        const cssPropsOverridden1: CSSProps<PR> = Util.isFunction(cssPropsOverride1) ?
                            (cssPropsOverride1 as CSSPropertiesCreator<PR>)(defaultStyle) :
                            (cssPropsOverride1 as CSSProperties<PR>) ?? defaultStyle;   // If no class for className (cssPropsOverride1 === undefined), then retain defaultStyle.
                        const cssPropsOverride2: TKUICustomCSSProperties<PR> = themedStyleOverride2[className];
                        const cssPropsOverridden2: CSSProps<PR> = Util.isFunction(cssPropsOverride2) ?
                            (cssPropsOverride2 as CSSPropertiesCreator<PR>)(cssPropsOverridden1) :
                            (cssPropsOverride2 as CSSProperties<PR>) ?? cssPropsOverridden1;    // If no class for className (cssPropsOverride2 === undefined), then retain cssPropsOverriden1.
                        return cssPropsOverridden2
                    }
                    return {
                        ...overrideStylesMerge,
                        [className]: classOverride
                    }
                }, {});
        return { ...themedStyleOverride1, ...overrideStyles };
    }
}

export function withStyleInjection<
    STYLE,
    IMPL_PROPS extends TKUIWithClasses<STYLE, IMPL_PROPS>,
    _ExtS extends string,
    P extends Subtract<IMPL_PROPS, TKUIWithClasses<STYLE, IMPL_PROPS>> & {
        defaultStyles: TKUIStyles<STYLE, IMPL_PROPS>,
        propStyles?: TKUICustomStyles<STYLE, IMPL_PROPS>,
        configStyles?: TKUICustomStyles<STYLE, IMPL_PROPS>,
        randomizeClassNames?: boolean,
        classNamePrefix?: string,
        verboseClassNames?: boolean
    }>
    (Consumer: React.ComponentType<IMPL_PROPS>) { // TODO: make classNamePrefix required

    return class WithStyleProp extends React.Component<P, {}> {

        // public StyledComponent: any;
        public generateClassName: ((rule: any, sheet: any) => string) | undefined;
        public stylesToInject: StyleCreator<keyof STYLE, TKUITheme, IMPL_PROPS>;
        public WithTheme: React.FC<any> = () => null;

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
            const useStyles = createUseStyles(this.stylesToInject)
            const prefix = props.classNamePrefix!;
            this.generateClassName = generateClassNameFactory(prefix);
            const WithTheme = props => {
                const theme = useTheme<TKUITheme>();
                const classes = useStyles({ ...props, theme })
                return <JssProvider
                    classNamePrefix={Environment.isDev() ? prefix : undefined}
                    generateId={this.props.randomizeClassNames === false ? this.generateClassName :
                        this.props.verboseClassNames === true ?
                            (rule: any, sheet: any) => {
                                return prefix + "-" + rule.key + "-" + generateClassNameSeed(rule, sheet);
                            } : generateClassNameSeed}>
                    <Consumer {...props}
                        classes={classes}
                        injectedStyles={this.stylesToInject(theme)}
                        refreshStyles={() => this.onRefreshStyles(true)}
                        theme={theme} />
                </JssProvider>;
            };
            this.WithTheme = WithTheme;
            if (forceUpdate) {
                this.forceUpdate();
            }
        }

        public render(): React.ReactNode {
            return <this.WithTheme {...this.props} />;
        }
    }
}

export function withStyles<PROPS extends TKUIWithClasses<STYLE, PROPS>, STYLE>(
    Consumer: React.ComponentType<PROPS>,
    stylesJss: (theme: TKUITheme) => STYLE) {
    const useStyles = createUseStyles(stylesJss)
    const WithTheme = props => {
        const theme = useTheme<TKUITheme>();
        const classes = useStyles({ ...props, theme });
        const i18nContext = useContext(TKI18nContext);
        return <Consumer
            {...props}
            classes={classes}
            injectedStyles={stylesJss(theme)}
            refreshStyles={() => { }}
            theme={theme}
            {...i18nContext} />;
    };
    return (props: Subtract<PROPS, TKUIWithClasses<STYLE, PROPS>>) => {
        const consumerProps = { ...props } as PROPS; // See why I need to do this.
        return <WithTheme {...consumerProps} />;
    };
}

function isObject(x): boolean {
    return typeof x === 'object' && x !== null;
}

/**
 * Support override of nested selectors (just 1 level).
 */
export function overrideClass(propsOverride: any) {
    return (defaultStyle) =>
        Object.keys(propsOverride ?? {}).reduce((acc, key) => {
            acc[key] = isObject(acc[key]) && isObject(propsOverride[key]) ? { ...acc[key], ...propsOverride[key] } : propsOverride[key];
            return acc;
        }, defaultStyle);
}
/**
 * To avoid warn / error about useLayoutEffect in dev mode. It's caused due to react-jss useStyles hook using
 * useLayoutEffect to dynamically update styles (e.g. on props change), and react doesn't like it happening inside
 * a renderToStaticMarkup, since it assumes we are puting dynamic logic on server side rendering.
 */
export function renderToStaticMarkup(elem) {
    return renderToStaticMarkupDomServer(elem);
}

export { createUseStyles };