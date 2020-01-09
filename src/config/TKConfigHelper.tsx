import * as React from "react";
import {
    TKUIWithClasses,
    TKUIWithStyle, withStyleInjection
} from "../jss/StyleHelper";
import {TKUIConfig, TKComponentDefaultConfig, TKComponentConfig} from "./TKUIConfig";
import {TKUIConfigContext} from "./TKUIConfigProvider";
import {Subtract} from "utility-types";
import { Styles, StyleCreator, CSSProperties} from "react-jss";
import {useContext} from "react";
import Util from "../util/Util";

function dependencyInjector<IMPL_PROPS extends TKUIWithClasses<STYLE, IMPL_PROPS>, STYLE>(
    confToCompMapper: (config: TKUIConfig) => Partial<TKComponentConfig<IMPL_PROPS, STYLE>> | undefined,
    defaultConfig: TKComponentDefaultConfig<IMPL_PROPS, STYLE>): (props: IMPL_PROPS) => JSX.Element {
    return (props: IMPL_PROPS) =>
        <TKUIConfigContext.Consumer>
            {(config: TKUIConfig) => {
                // Dependency (renderer) injection
                const renderFromConfig = confToCompMapper(config) ? confToCompMapper(config)!.render : undefined;
                const render = renderFromConfig || defaultConfig.render;

                // Config props injection
                const defaultConfigProps = Util.isFunction(defaultConfig.props) ?
                    (defaultConfig.props as ((defaultConfigProps: IMPL_PROPS) => Partial<IMPL_PROPS>))(props) : defaultConfig.props;

                const componentConfig = confToCompMapper(config);
                const configProps = componentConfig &&
                    (Util.isFunction(componentConfig.props) ?
                        (componentConfig.props as ((defaultConfigProps: Subtract<IMPL_PROPS, TKUIWithClasses<STYLE, IMPL_PROPS>>) => Partial<IMPL_PROPS>))({...props, ...defaultConfigProps}) :
                        componentConfig.props);

                return render({...props, ...defaultConfigProps, ...configProps});
            }}
        </TKUIConfigContext.Consumer>;
}

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
    >(confToCompMapper: (config: TKUIConfig) => Partial<TKComponentConfig<IMPL_PROPS, STYLE>> | undefined,
      defaultConfig: TKComponentDefaultConfig<IMPL_PROPS, STYLE>,
      PropsMapper: PropsMapper<CLIENT_PROPS, Subtract<IMPL_PROPS, TKUIWithClasses<STYLE, IMPL_PROPS>>>) {
    // Renderer + config props injector
    const ComponentRenderer = dependencyInjector(confToCompMapper, defaultConfig);
    // Wraps ComponentRenderer on a component that injects styles, received as properties, on creation / mount (not on render), so just once.
    const WithStyleInjector = withStyleInjection(ComponentRenderer);
    // Wraps prev component to the final component, mapping client props to the component implementation props.
    return (props: CLIENT_PROPS) =>
        <PropsMapper inputProps={props}>
            {(implProps: Subtract<IMPL_PROPS, TKUIWithClasses<STYLE, IMPL_PROPS>>) => {
                return <TKUIConfigContext.Consumer>
                    {(config: TKUIConfig) => {
                        const componentConfig = confToCompMapper(config);
                        const randomizeClassNamesToPass = props.randomizeClassNames !== undefined ? props.randomizeClassNames :
                            componentConfig && componentConfig.randomizeClassNames != undefined ? componentConfig.randomizeClassNames : defaultConfig.randomizeClassNames;
                        return <WithStyleInjector {...implProps}
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