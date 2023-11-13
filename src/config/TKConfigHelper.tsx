import React from "react";
import {
    mergeStyleOverrides,
    TKUICustomStyles,
    TKUIWithClasses,
    TKUIWithStyle, withStyleInjection
} from "../jss/StyleHelper";
import { TKUIConfig, TKComponentDefaultConfig, ITKUIConfigOptional } from "./TKUIConfig";
import { TKComponentConfig, TKUIPropsOverride } from "./TKComponentConfig";
import { TKUIConfigContext, default as TKUIConfigProvider } from "./TKUIConfigProvider";
import { Subtract } from "utility-types";
import Util from "../util/Util";
import { TKI18nContextProps, TKI18nContext } from "../i18n/TKI18nProvider";

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
                        (componentConfig.props as ((defaultConfigProps: Subtract<IMPL_PROPS, TKUIWithClasses<STYLE, IMPL_PROPS>>) => Partial<IMPL_PROPS>))({ ...defaultConfigProps, ...props }) :
                        componentConfig.props);
                return render({ ...defaultConfigProps, ...props, ...configProps });
            }}
        </TKUIConfigContext.Consumer>;
}

function i18nInjector<IMPL_PROPS extends TKI18nContextProps>(
    // Consumer: React.ComponentType<IMPL_PROPS>
    Consumer: React.ComponentType<any>
): (props: Subtract<IMPL_PROPS, TKI18nContextProps>) => JSX.Element {
    return (props: Subtract<IMPL_PROPS, TKI18nContextProps>) =>
        <TKI18nContext.Consumer>
            {(i18nProps: TKI18nContextProps) =>
                <Consumer
                    {...props}
                    {...i18nProps}
                />
            }
        </TKI18nContext.Consumer>

}

export type PropsMapper<INPUT_PROPS, OUTPUT_PROPS> =
    React.FunctionComponent<{ inputProps: INPUT_PROPS, children: (outputProps: OUTPUT_PROPS) => React.ReactNode }>


export function mapperFromFunction<INPUT_PROPS, OUTPUT_PROPS>(mapperFc: (inputProps: INPUT_PROPS) => OUTPUT_PROPS): PropsMapper<INPUT_PROPS, OUTPUT_PROPS> {
    return (props: {
        inputProps: INPUT_PROPS,
        children: (outputProps: OUTPUT_PROPS) => React.ReactNode
    }) =>
        <>
            {props.children!(mapperFc(props.inputProps))}
        </>
}

/**
 * Props override order (from less to more priority):
 * 1. default config props
 * 2. consumed props (from global state)
 * 3. client props (from direct client call)
 * 4. config props
 *
 * Order of 2 and 3 is controlled by props mapper defined on each component.
 */

export function connect<
    IMPL_PROPS extends CLIENT_PROPS & TKUIWithClasses<STYLE, IMPL_PROPS> & TKI18nContextProps,
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
    const WithI18nInjector = i18nInjector(WithStyleInjector);
    return (props: CLIENT_PROPS) =>
        <PropsMapper inputProps={props}>
            {(implProps: Subtract<IMPL_PROPS, TKUIWithClasses<STYLE, IMPL_PROPS>>) => {
                return <TKUIConfigContext.Consumer>
                    {(config: TKUIConfig) => {
                        const componentConfig = confToCompMapper(config);
                        const randomizeClassNamesToPass = props.randomizeClassNames !== undefined ? props.randomizeClassNames :
                            componentConfig && componentConfig.randomizeClassNames != undefined ? componentConfig.randomizeClassNames : defaultConfig.randomizeClassNames;
                        const verboseClassNamesToPass = componentConfig && componentConfig.verboseClassNames != undefined ? componentConfig.verboseClassNames : defaultConfig.verboseClassNames;
                        return <WithI18nInjector {...implProps}
                            defaultStyles={defaultConfig.styles}
                            propStyles={props.styles}
                            configStyles={componentConfig && componentConfig.styles}
                            randomizeClassNames={randomizeClassNamesToPass}
                            classNamePrefix={(componentConfig && componentConfig.classNamePrefix) || defaultConfig.classNamePrefix}
                            verboseClassNames={verboseClassNamesToPass}
                        />;
                    }}
                </TKUIConfigContext.Consumer>
            }}
        </PropsMapper>
}

export function replaceStyle<ST, PR extends TKUIWithClasses<ST, PR>>
    (config: TKUIConfig, componentKey: string, styles: TKUICustomStyles<ST, PR>): TKUIConfig {
    const resultConfig = Object.assign({}, config);
    const targetComponent: TKComponentConfig<PR, ST> | undefined = config[componentKey];
    const resultComponent: TKComponentConfig<PR, ST> = Object.assign({}, targetComponent);
    resultComponent.styles = resultComponent.styles ? mergeStyleOverrides(resultComponent.styles, styles) : styles;
    resultConfig[componentKey] = resultComponent;
    return resultConfig;
}

export const TKStyleOverride = (props: { componentKey: string, stylesOverride: any, children: any }) => (
    <TKUIConfigContext.Consumer>
        {(config: TKUIConfig) => {
            const configOverride = replaceStyle(config, props.componentKey, props.stylesOverride);
            return (
                // <TKUIConfigProvider config={configOverride}> // Replace this since re-injects styles
                <TKUIConfigContext.Provider value={configOverride}>
                    {props.children}
                </TKUIConfigContext.Provider>
                // </TKUIConfigProvider>
            )
        }}
    </TKUIConfigContext.Consumer>
);

export function replaceRender<ST, PR extends TKUIWithClasses<ST, PR>>
    (config: TKUIConfig, componentKey: string, render: (props: PR, configRender: (props: PR) => JSX.Element) => JSX.Element): TKUIConfig {
    const resultConfig = Object.assign({}, config);
    const targetComponent: TKComponentConfig<PR, ST> | undefined = config[componentKey];
    const resultComponent: TKComponentConfig<PR, ST> = Object.assign({}, targetComponent);
    resultComponent.render = props => render(props, config[componentKey]?.render);
    resultConfig[componentKey] = resultComponent;
    return resultConfig;
}

export const TKRenderOverride = (props: { componentKey: string, renderOverride: (props: any, configRender?: (props: any) => JSX.Element) => JSX.Element, children: any }) => (
    <TKUIConfigContext.Consumer>
        {(config: TKUIConfig) => {
            const configOverride = replaceRender(config, props.componentKey, props.renderOverride);
            return (
                <TKUIConfigContext.Provider value={configOverride}>
                    {props.children}
                </TKUIConfigContext.Provider>
            )
        }}
    </TKUIConfigContext.Consumer>
);

function mergeProps<ST, PR extends TKUIWithClasses<ST, PR>>
    (props1: TKUIPropsOverride<PR, ST>, props2: TKUIPropsOverride<PR, ST>): (implProps: PR) => Partial<PR> {
    return (props0: PR) => {
        const props1Obj = Util.isFunction(props1) ? (props1 as (implProps: PR) => Partial<PR>)(props0) : props1;
        const props2Obj = Util.isFunction(props2) ?
            (props2 as (implProps: PR) => Partial<PR>)({ ...props0, ...props1Obj as PR }) : props2;
        return { ...props0, ...props1Obj, ...props2Obj };
    }
}

export function replaceProps<ST, PR extends TKUIWithClasses<ST, PR>>
    (config: TKUIConfig, componentKey: string, propsOverride: TKUIPropsOverride<PR, ST>): TKUIConfig {
    const resultConfig = Object.assign({}, config);
    const targetComponent: TKComponentConfig<PR, ST> | undefined = config[componentKey];
    const resultComponent: TKComponentConfig<PR, ST> = Object.assign({}, targetComponent);
    resultComponent.props = resultComponent.props ? mergeProps(resultComponent.props, propsOverride) : propsOverride;
    resultConfig[componentKey] = resultComponent;
    return resultConfig;
}

// type FilterKeysOfType<T, U> = {
//     [K in keyof T]: T[K] extends U ? K : never;
// }[keyof T];

// type TKComponentKeys = FilterKeysOfType<ITKUIConfigOptional, TKComponentConfig<any, any>>;

// export const TKPropsOverride = (props: { componentKey: TKComponentKeys, propsOverride: any, children: any }) => (
export const TKPropsOverride = (props: { componentKey: string, propsOverride: any, children: any }) => (
    <TKUIConfigContext.Consumer>
        {(config: TKUIConfig) => {
            const configOverride = replaceProps(config, props.componentKey, props.propsOverride);
            return (
                // <TKUIConfigProvider config={configOverride}> // Replace this since re-injects styles
                <TKUIConfigContext.Provider value={configOverride}>
                    {props.children}
                </TKUIConfigContext.Provider>
                // </TKUIConfigProvider>
            )
        }}
    </TKUIConfigContext.Consumer>
);

export const TKRandomizeClassNamesOverride = (props: { componentKey: string, randomizeOverride?: boolean, verboseOverride?: boolean, children: any }) => (
    <TKUIConfigContext.Consumer>
        {(config: TKUIConfig) => {
            const configOverride = Object.assign({}, config);
            const targetComponent = config[props.componentKey];
            const resultComponent = Object.assign({}, targetComponent);
            if (props.randomizeOverride !== undefined) {
                resultComponent.randomizeClassNames = props.randomizeOverride;
            }
            if (props.verboseOverride !== undefined) {
                resultComponent.verboseClassNames = props.verboseOverride;
            }
            configOverride[props.componentKey] = resultComponent;
            return (
                <TKUIConfigProvider config={configOverride}>
                    {props.children}
                </TKUIConfigProvider>
            )
        }}
    </TKUIConfigContext.Consumer>
);