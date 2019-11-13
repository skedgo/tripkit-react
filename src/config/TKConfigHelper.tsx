import * as React from "react";
import {TKUIWithClasses, TKUIWithStyle, withStyleProp} from "../jss/StyleHelper";
import {default as ITKUIConfig, ITKUIComponentConfig} from "./TKUIConfig";
import {TKUIConfigContext} from "config/TKUIConfigProvider";
import {Subtract} from "utility-types";

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
    IMPL_PROPS extends CLIENT_PROPS & TKUIWithClasses<STYLE>,
    CLIENT_PROPS extends TKUIWithStyle<STYLE, IMPL_PROPS>,
    STYLE
    >(confToCompMapper: (config: ITKUIConfig) => Partial<ITKUIComponentConfig<IMPL_PROPS, STYLE>>,
      defaultConfig: ITKUIComponentConfig<IMPL_PROPS, STYLE>,
      // classPrefix: string,
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
                        const stylesToPass = props.styles || componentConfig.styles || defaultConfig.styles;
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