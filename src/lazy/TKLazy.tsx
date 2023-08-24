import React, { ReactElement, Suspense, lazy } from "react";
import { TKUIWithClasses } from "../jss/StyleHelper";
import { TKUIWCSegmentInfoProps, TKUIWCSegmentInfoStyle } from "../trip/TKUIWCSegmentInfo";
import { Subtract } from "utility-types/dist/mapped-types";

export function lazyComponent<PROPS extends TKUIWithClasses<STYLE, PROPS>, STYLE>(factory: () => Promise<{ default: any }>, fallback: React.ReactNode = null) {
    const LazyComponent = lazy(factory);
    return (props: Subtract<PROPS, TKUIWithClasses<STYLE, PROPS>>) =>
        <Suspense fallback={fallback}>
            <LazyComponent {...props} />
        </Suspense>
}

type ComponentType<PROPS extends TKUIWithClasses<STYLE, PROPS>, STYLE> = (props: Subtract<PROPS, TKUIWithClasses<STYLE, PROPS>>) => ReactElement<any, any> | null;

export type TKUIWCSegmentInfoType = ComponentType<TKUIWCSegmentInfoProps, TKUIWCSegmentInfoStyle>;

const TKLazy = {
    TKUIWCSegmentInfo: lazyComponent<TKUIWCSegmentInfoProps, TKUIWCSegmentInfoStyle>(() => import("../trip/TKUIWCSegmentInfo")) as unknown as TKUIWCSegmentInfoType,
    tKUIWCSegmentInfoBuilder: (fallback: React.ReactNode = null) => lazyComponent<TKUIWCSegmentInfoProps, TKUIWCSegmentInfoStyle>(() => import("../trip/TKUIWCSegmentInfo"), fallback) as unknown as TKUIWCSegmentInfoType
}

// export default TKLazy;   This doesn't compile.  
export default TKLazy as any;

// TODO: evaluate preloading component to avoid waiting in general, while still get the benefit of code splitting.
// For now preload here, and in this way.
// setTimeout(() => import("../trip/TKUIWCSegmentInfo"), 2000);