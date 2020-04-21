import * as React from "react";
import { Subtract } from "utility-types";
import { ClassNameMap, Styles, StyleCreator, CSSProperties } from "react-jss";
import * as CSS from 'csstype';
import { TKUITheme } from "./TKUITheme";
import { TKI18nContextProps } from "../i18n/TKI18nProvider";
export declare type TKUIStyles<ST, PR> = Styles<keyof ST, PR> | StyleCreator<keyof ST, TKUITheme, PR>;
export declare type TKUICustomStyles<ST, PR> = Partial<CustomStyles<keyof ST, PR>> | TKUICustomStyleCreator<keyof ST, TKUITheme, PR>;
export declare type TKUICustomStyleCreator<C extends string | number | symbol = string, T extends {} = {}, Props = {}> = (theme: T) => Partial<CustomStyles<C, Props>>;
export declare type CustomStyles<ClassKey extends string | number | symbol = string, Props = {}> = Record<ClassKey, TKUICustomCSSProperties<Props>>;
export declare type CSSPropertiesCreator<Props> = ((defaultStyle: CSSProperties<Props>) => CSSProperties<Props>);
export declare type TKUICustomCSSProperties<Props> = CSSProperties<Props> | CSSPropertiesCreator<Props>;
export declare type CSSProps<Props> = CSS.Properties | CSSProperties<Props>;
export interface TKUIWithStyle<ST, CP> {
    styles?: TKUIStyles<ST, CP>;
    randomizeClassNames?: boolean;
}
export interface TKUIWithClasses<STYLE, PROPS> extends TKI18nContextProps {
    injectedStyles: Styles<keyof STYLE, PROPS>;
    classes: ClassNameMap<keyof STYLE>;
    refreshStyles: () => void;
}
export declare function withStyleInjection<STYLE, IMPL_PROPS extends TKUIWithClasses<STYLE, IMPL_PROPS>, ExtS extends string, P extends Subtract<IMPL_PROPS, TKUIWithClasses<STYLE, IMPL_PROPS>> & {
    defaultStyles: TKUIStyles<STYLE, IMPL_PROPS>;
    configStyles?: TKUICustomStyles<STYLE, IMPL_PROPS>;
    randomizeClassNames?: boolean;
    classNamePrefix?: string;
}>(Consumer: React.ComponentType<IMPL_PROPS>, classPrefix?: string): {
    new (props: P): {
        StyledComponent: any;
        generateClassName: ((rule: any, sheet: any) => string) | undefined;
        stylesToInject: StyleCreator<keyof STYLE, TKUITheme, IMPL_PROPS>;
        WithTheme: any;
        /**
         * TODO: re-injecting sheet to refresh styles has the problem that it triggers the re-construction of the
         * entire subtree.
         * As per react-jss documentation, it seems that refresh of css on props update should happen automatically:
         * https://cssinjs.org/react-jss/?v=v10.0.0-alpha.3#dynamic-values
         * Investigate why it doesn't work.
         */
        onRefreshStyles(forceUpdate?: boolean): void;
        render(): React.ReactNode;
        context: any;
        setState<K extends never>(state: {} | ((prevState: Readonly<{}>, props: Readonly<P>) => {} | Pick<{}, K> | null) | Pick<{}, K> | null, callback?: (() => void) | undefined): void;
        forceUpdate(callback?: (() => void) | undefined): void;
        readonly props: Readonly<P> & Readonly<{
            children?: React.ReactNode;
        }>;
        state: Readonly<{}>;
        refs: {
            [key: string]: React.ReactInstance;
        };
        componentDidMount?(): void;
        shouldComponentUpdate?(nextProps: Readonly<P>, nextState: Readonly<{}>, nextContext: any): boolean;
        componentWillUnmount?(): void;
        componentDidCatch?(error: Error, errorInfo: React.ErrorInfo): void;
        getSnapshotBeforeUpdate?(prevProps: Readonly<P>, prevState: Readonly<{}>): any;
        componentDidUpdate?(prevProps: Readonly<P>, prevState: Readonly<{}>, snapshot?: any): void;
        componentWillMount?(): void;
        UNSAFE_componentWillMount?(): void;
        componentWillReceiveProps?(nextProps: Readonly<P>, nextContext: any): void;
        UNSAFE_componentWillReceiveProps?(nextProps: Readonly<P>, nextContext: any): void;
        componentWillUpdate?(nextProps: Readonly<P>, nextState: Readonly<{}>, nextContext: any): void;
        UNSAFE_componentWillUpdate?(nextProps: Readonly<P>, nextState: Readonly<{}>, nextContext: any): void;
    };
    contextType?: React.Context<any> | undefined;
};
declare function withStyleProp<ST, CP extends {
    classes: ClassNameMap<keyof ST>;
}, ExtS extends string, P extends Subtract<CP, {
    classes: ClassNameMap<keyof ST>;
}> & {
    styles: TKUIStyles<ST, CP>;
    randomizeClassNames?: boolean;
    classNamePrefix?: string;
}>(Consumer: React.ComponentType<CP>, classPrefix?: string): {
    new (props: P): {
        StyledComponent: any;
        generateClassName: ((rule: any, sheet: any) => string) | undefined;
        render(): React.ReactNode;
        context: any;
        setState<K extends never>(state: {} | ((prevState: Readonly<{}>, props: Readonly<P>) => {} | Pick<{}, K> | null) | Pick<{}, K> | null, callback?: (() => void) | undefined): void;
        forceUpdate(callback?: (() => void) | undefined): void;
        readonly props: Readonly<P> & Readonly<{
            children?: React.ReactNode;
        }>;
        state: Readonly<{}>;
        refs: {
            [key: string]: React.ReactInstance;
        };
        componentDidMount?(): void;
        shouldComponentUpdate?(nextProps: Readonly<P>, nextState: Readonly<{}>, nextContext: any): boolean;
        componentWillUnmount?(): void;
        componentDidCatch?(error: Error, errorInfo: React.ErrorInfo): void;
        getSnapshotBeforeUpdate?(prevProps: Readonly<P>, prevState: Readonly<{}>): any;
        componentDidUpdate?(prevProps: Readonly<P>, prevState: Readonly<{}>, snapshot?: any): void;
        componentWillMount?(): void;
        UNSAFE_componentWillMount?(): void;
        componentWillReceiveProps?(nextProps: Readonly<P>, nextContext: any): void;
        UNSAFE_componentWillReceiveProps?(nextProps: Readonly<P>, nextContext: any): void;
        componentWillUpdate?(nextProps: Readonly<P>, nextState: Readonly<{}>, nextContext: any): void;
        UNSAFE_componentWillUpdate?(nextProps: Readonly<P>, nextState: Readonly<{}>, nextContext: any): void;
    };
    contextType?: React.Context<any> | undefined;
};
declare function emptyValues<T>(sample: T): T;
export { withStyleProp, emptyValues };
