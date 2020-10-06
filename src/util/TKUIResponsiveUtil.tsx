import React, {useState} from 'react';
import MediaQuery from 'react-responsive';

class TKUIResponsiveUtil {

    // TODO: maybe this can be a theme prop.
    public static getPortraitWidth(): number {
        return 800;
    }
}

export interface TKUIViewportUtilProps {
    /**
     * Stating if the screen orientation is portrait. In desktop it's related to screen dimensions.
     * @globaldefault
     */
    portrait: boolean;

    /**
     * Stating if the screen orientation is landscape. In desktop it's related to screen dimensions.
     * @globaldefault
     */
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