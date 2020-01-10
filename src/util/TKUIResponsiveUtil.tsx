import React, {useState} from 'react';
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
        //const [count, setCount] = useState(0);
        return (
            // TODO: re-enable. Error on library:
            // Invalid hook call. Hooks can only be called inside of the body of a function component.
            // This could happen for one of the following reasons:
            // 1. You might have mismatching versions of React and the renderer (such as React DOM)
            // 2. You might be breaking the Rules of Hooks
            // 3. You might have more than one copy of React in the same app
            // See https://fb.me/react-invalid-hook-call for tips about how to debug and fix this problem.
            //<>
                //{/*<button */}
                    // {/*onClick={() => setCount(count + 1)}>*/}
                    // {/*hola*/}
                // {/*</button>*/}
            //    {props.children({portrait: false, landscape: true})}
            //</>
            <MediaQuery maxWidth={TKUIResponsiveUtil.getPortraitWidth()}>
                {(matches: boolean) =>
                    props.children({portrait: matches, landscape: !matches})
                }
            </MediaQuery>
        );
    };

export default TKUIResponsiveUtil;