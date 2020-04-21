import React from 'react';
declare class TKUIResponsiveUtil {
    static getPortraitWidth(): number;
}
export interface TKUIViewportUtilProps {
    portrait: boolean;
    landscape: boolean;
}
export declare const TKUIViewportUtil: React.SFC<{
    children: (props: TKUIViewportUtilProps) => React.ReactNode;
}>;
export default TKUIResponsiveUtil;
