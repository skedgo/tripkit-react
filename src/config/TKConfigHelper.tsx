import * as React from "react";
import {
    TKUIWithClasses,
    TKUIWithStyle, withStyleInjection
} from "../jss/StyleHelper";
import {TKUIConfig, ITKUIComponentDefaultConfig, ConfigRefiner} from "./TKUIConfig";
import {TKUIConfigContext} from "config/TKUIConfigProvider";
import {Subtract} from "utility-types";
import { Styles, StyleCreator, CSSProperties} from "react-jss";
import {useContext} from "react";
import Util from "../util/Util";

function dependencyInjector<P>(configToRenderMapper: (config: TKUIConfig) => ((props: P) => JSX.Element) | undefined,
                               defaultRender: (props: P) => JSX.Element): (props: P) => JSX.Element {
    return (props: P) =>
        <TKUIConfigContext.Consumer>
            {(config: TKUIConfig) => {
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

export function connect<
    IMPL_PROPS extends CLIENT_PROPS & TKUIWithClasses<STYLE, IMPL_PROPS>,
    CLIENT_PROPS extends TKUIWithStyle<STYLE, IMPL_PROPS>,
    STYLE
    >(confToCompMapper: (config: TKUIConfig) => Partial<ConfigRefiner<IMPL_PROPS, STYLE>> | undefined,
      defaultConfig: ITKUIComponentDefaultConfig<IMPL_PROPS, STYLE>,
      PropsMapper: PropsMapper<CLIENT_PROPS, Subtract<IMPL_PROPS, TKUIWithClasses<STYLE, IMPL_PROPS>>>) {
    // Renderer injector
    const configToRenderMapper = (config: TKUIConfig) => confToCompMapper(config) ?  confToCompMapper(config)!.render : undefined;
    const ComponentRenderer = dependencyInjector(configToRenderMapper, defaultConfig.render);
    // Wraps ComponentRenderer on a component that injects styles, received as properties, on creation / mount (not on render), so just once.
    const WithStyleInjector = withStyleInjection(ComponentRenderer);
    // Wraps prev component to the final component, mapping interface / use props to the raw component full props.
    return (props: CLIENT_PROPS) =>
        <PropsMapper inputProps={props}>
            {(implProps: Subtract<IMPL_PROPS, TKUIWithClasses<STYLE, IMPL_PROPS>>) => {
                return <TKUIConfigContext.Consumer>
                    {(config: TKUIConfig) => {
                        const defaultConfigProps = Util.isFunction(defaultConfig.configProps) ?
                            (defaultConfig.configProps as ((defaultConfigProps: Subtract<IMPL_PROPS, TKUIWithClasses<STYLE, IMPL_PROPS>>) => Partial<IMPL_PROPS>))(implProps) : defaultConfig.configProps;
                        const componentConfig = confToCompMapper(config);
                        const randomizeClassNamesToPass = props.randomizeClassNames !== undefined ? props.randomizeClassNames :
                            componentConfig && componentConfig.randomizeClassNames != undefined ? componentConfig.randomizeClassNames : defaultConfig.randomizeClassNames;
                        // TODO: maybe move configProps merge logic into withStyleInjection to make it just once, on construction.
                        const configProps = componentConfig &&
                            (Util.isFunction(componentConfig.configProps) ?
                                (componentConfig.configProps as ((defaultConfigProps: Subtract<IMPL_PROPS, TKUIWithClasses<STYLE, IMPL_PROPS>>) => Partial<IMPL_PROPS>))({...implProps, ...defaultConfigProps}) :
                                componentConfig.configProps);
                        // TODO: maybe shold pass defaultConfig.configProps, then implProps (so props directly passed to
                        // component override default config props, and finally configProps (so props passed through
                        // config override everything)
                        return <WithStyleInjector {...implProps}
                                                  {...defaultConfigProps}
                                                  {...configProps}
                                                  defaultStyles={defaultConfig.styles}
                                                  configStyles={componentConfig && componentConfig.styles}
                                                  randomizeClassNames={randomizeClassNamesToPass}
                                                  classNamePrefix={(componentConfig && componentConfig.classNamePrefix) || defaultConfig.classNamePrefix}
                        />;
                    }}
                </TKUIConfigContext.Consumer>
            }}
        </PropsMapper>
}