import * as React from "react";
import {
    CSSPropertiesCreator,
    CustomStyles,
    TKUICustomCSSProperties,
    TKUICustomStyleCreator,
    TKUIWithClasses,
    TKUIWithStyle,
    withStyleProp
} from "../jss/StyleHelper";
import {default as ITKUIConfig, ITKUIComponentConfig} from "./TKUIConfig";
import {TKUIConfigContext} from "config/TKUIConfigProvider";
import {Subtract} from "utility-types";
import {TKUITheme} from "../jss/TKStyleProvider";
import { Styles, StyleCreator, CSSProperties} from "react-jss";

function dependencyInjector<P>(configToRenderMapper: (config: ITKUIConfig) => ((props: P) => JSX.Element) | undefined,
                               defaultRender: (props: P) => JSX.Element): (props: P) => JSX.Element {
    return (props: P) =>
        <TKUIConfigContext.Consumer>
            {(config: ITKUIConfig) => {
                const renderFromConfig = configToRenderMapper(config);
                const render = renderFromConfig || defaultRender;
                return render(props);
            }}
        </TKUIConfigContext.Consumer>;
}

// function dependencyInjector4<P>(configToRenderMapper: (config: ITKUIConfig) => ((props: P) => JSX.Element) | undefined,
//                                defaultRender: (props: P) => JSX.Element): (props: P & {rendera: any}) => JSX.Element {
//
//     return (props: P) => {
//         // const {rendera, ...callProps} = props;
//         // return rendera(callProps);
//         return defaultRender(props);
//     }
// }
//
// function dependencyInjectorTwo<P>(): (props: P & {rendera: (props: P) => JSX.Element}) => JSX.Element {
//     return (props: P & {rendera: (props: P) => JSX.Element}) => {
//         const {rendera, ...callProps} = props;
//         // return rendera(callProps);
//         return rendera(props);
//     }
// }
//
// function dependencyInjector3<P, Q extends P & {rendera: any}>(configToRenderMapper: (config: ITKUIConfig) => ((props: P) => JSX.Element) | undefined,
//                                 defaultRender: (props: P) => JSX.Element): (props: Q) => JSX.Element {
//
//     return (props: Q) => {
//         // const {rendera, ...callProps} = props;
//         // return rendera(callProps);
//         return props.rendera!(props);
//     }
// }

export type PropsMapper<INPUT_PROPS, OUTPUT_PROPS> =
    React.SFC<{inputProps: INPUT_PROPS, children: (outputProps: OUTPUT_PROPS) => React.ReactNode}>


export function mapperFromFunction<INPUT_PROPS, OUTPUT_PROPS>(mapperFc: (inputProps: INPUT_PROPS) => OUTPUT_PROPS): PropsMapper<INPUT_PROPS, OUTPUT_PROPS> {
    return (props: {
        inputProps: INPUT_PROPS,
        children: (outputProps: OUTPUT_PROPS) => React.ReactNode}) =>
        <>
            {props.children!(mapperFc(props.inputProps))}
        </>
}

function isFunction(functionToCheck: any) {
    console.log(functionToCheck && {}.toString.call(functionToCheck));
    return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
}

export function connect<
    IMPL_PROPS extends CLIENT_PROPS & TKUIWithClasses<STYLE>,
    CLIENT_PROPS extends TKUIWithStyle<STYLE, IMPL_PROPS>,
    STYLE
    >(confToCompMapper: (config: ITKUIConfig) => Partial<ITKUIComponentConfig<IMPL_PROPS, STYLE>>,
      defaultConfig: ITKUIComponentConfig<IMPL_PROPS, STYLE>,
      PropsMapper: PropsMapper<CLIENT_PROPS, Subtract<IMPL_PROPS, TKUIWithClasses<STYLE>>>) {
    // Renderer injector
    const configToRenderMapper = (config: ITKUIConfig) => confToCompMapper(config).render;
    const ComponentRenderer = dependencyInjector(configToRenderMapper, defaultConfig.render);
    // Wraps ComponentRenderer on a component that injects styles, received as properties, on creation / mount (not on render), so just once.
    const WithStyleInjector = withStyleProp(ComponentRenderer);
    // Wraps prev component to the final component, mapping interface / use props to the raw component full props.
    return (props: CLIENT_PROPS) =>
        <PropsMapper inputProps={props}>
            {(implProps: Subtract<IMPL_PROPS, TKUIWithClasses<STYLE>>) =>
                <TKUIConfigContext.Consumer>
                    {(config: ITKUIConfig) => {
                        const componentConfig = confToCompMapper(config);
                        // TODO: merge styles instead of next line.
                        // const stylesToPass = props.styles || componentConfig.styles || defaultConfig.styles;
                        // TODO: move this inside constructor of withStyleProp
                        const stylesToPass = (theme: TKUITheme) => {
                            const defaultStyles = (isFunction(defaultConfig.styles) ?
                                (defaultConfig.styles as StyleCreator<keyof STYLE, TKUITheme, IMPL_PROPS>)(theme) :
                                defaultConfig.styles as Styles<keyof STYLE, IMPL_PROPS>);
                            const customStyles: Partial<CustomStyles<keyof STYLE, IMPL_PROPS>> = (isFunction(componentConfig.styles) ?
                                (componentConfig.styles as TKUICustomStyleCreator<keyof STYLE, TKUITheme, IMPL_PROPS>)(theme) :
                                componentConfig.styles as Partial<Styles<keyof STYLE, IMPL_PROPS>>);
                            const overrideStyles = customStyles ?
                                Object.keys(customStyles)
                                    .reduce((overrideStyles: Partial<Styles<keyof STYLE, IMPL_PROPS>>, className: string) => {
                                        const customStyle: TKUICustomCSSProperties<IMPL_PROPS> = customStyles[className];
                                        const customJssStyle: CSSProperties<IMPL_PROPS> = isFunction(customStyle) ?
                                            (customStyle as CSSPropertiesCreator<IMPL_PROPS>)(defaultStyles[className]) :
                                            customStyle as CSSProperties<IMPL_PROPS>;
                                        return {
                                            ...overrideStyles,
                                            [className]: customJssStyle
                                        }
                                    }, {}) : {};
                            console.log("overrideStyles: ");
                            console.log(overrideStyles);
                            return {...defaultStyles, ...overrideStyles};
                        };
                        const randomizeClassNamesToPass = props.randomizeClassNames !== undefined ? props.randomizeClassNames :
                            componentConfig.randomizeClassNames != undefined ? componentConfig.randomizeClassNames : defaultConfig.randomizeClassNames;
                        return <WithStyleInjector {...implProps}
                                                  styles={stylesToPass}
                                                  randomizeClassNames={randomizeClassNamesToPass}
                                                  classNamePrefix={componentConfig.classNamePrefix || defaultConfig.classNamePrefix}
                        />;
                    }}
                </TKUIConfigContext.Consumer>
            }
        </PropsMapper>
}