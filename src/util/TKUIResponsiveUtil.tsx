import React from 'react';
import MediaQuery from 'react-responsive';

class TKUIResponsiveUtil {

    // TODO: maybe this can be a theme prop.
    public static getPortraitWidth(): number {
        return 800;
    }
}

export interface TKUIViewportUtilProps {
    portrait: boolean;
    landscape: boolean;
}

export const TKUIViewportUtil: React.SFC<{children: (props: TKUIViewportUtilProps) => React.ReactNode}> =
    (props: {children: (props: TKUIViewportUtilProps) => React.ReactNode}) => {
        return (
            <MediaQuery maxWidth={TKUIResponsiveUtil.getPortraitWidth()}>
                {(matches: boolean) =>
                    props.children({portrait: matches, landscape: !matches})
                }
            </MediaQuery>
        );
    };

export default TKUIResponsiveUtil;