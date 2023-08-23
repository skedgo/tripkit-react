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

type TKUIWCSegmentInfoType = ComponentType<TKUIWCSegmentInfoProps, TKUIWCSegmentInfoStyle>;

const TKLazy = {
    TKUIWCSegmentInfo: lazyComponent<TKUIWCSegmentInfoProps, TKUIWCSegmentInfoStyle>(() => import("../trip/TKUIWCSegmentInfo")) as TKUIWCSegmentInfoType,
    tKUIWCSegmentInfoBuilder: (fallback: React.ReactNode = null) => lazyComponent<TKUIWCSegmentInfoProps, TKUIWCSegmentInfoStyle>(() => import("../trip/TKUIWCSegmentInfo"), fallback) as TKUIWCSegmentInfoType
}

export default TKLazy;