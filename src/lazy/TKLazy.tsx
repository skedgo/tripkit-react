import React, { ReactElement, Suspense, lazy } from "react";
import { TKUIWithClasses } from "../jss/StyleHelper";
import { TKUIStreetsChartProps, TKUIStreetsChartStyle } from "../trip/TKUIStreetsChart";
import { Subtract } from "utility-types/dist/mapped-types";

export function lazyComponent<PROPS extends TKUIWithClasses<STYLE, PROPS>, STYLE>(factory: () => Promise<{ default: any }>, fallback: React.ReactNode = null) {
    const LazyComponent = lazy(factory);
    return (props: Subtract<PROPS, TKUIWithClasses<STYLE, PROPS>>) =>
        <Suspense fallback={fallback}>
            <LazyComponent {...props} />
        </Suspense>
}

type ComponentType<PROPS extends TKUIWithClasses<STYLE, PROPS>, STYLE> = (props: Subtract<PROPS, TKUIWithClasses<STYLE, PROPS>>) => ReactElement<any, any> | null;

export type TKUIStreetsChartType = ComponentType<TKUIStreetsChartProps, TKUIStreetsChartStyle>;

const TKLazy = {
    TKUIStreetsChart: lazyComponent<TKUIStreetsChartProps, TKUIStreetsChartStyle>(() => import("../trip/TKUIStreetsChart")) as unknown as TKUIStreetsChartType,
    tKUIStreetsChartBuilder: (fallback: React.ReactNode = null) => lazyComponent<TKUIStreetsChartProps, TKUIStreetsChartStyle>(() => import("../trip/TKUIStreetsChart"), fallback) as unknown as TKUIStreetsChartType
}

// export default TKLazy;   This doesn't compile.  
export default TKLazy as any;

// TODO: evaluate preloading component to avoid waiting in general, while still get the benefit of code splitting.
// For now preload here, and in this way.
// setTimeout(() => import("../trip/TKUIStreetsChart"), 2000);