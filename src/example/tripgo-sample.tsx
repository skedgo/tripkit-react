import React, {MouseEvent} from 'react';
import ReactDOM from 'react-dom';
import {TKUITripPlanner, TKRoot, TKUIConfig, TKShareHelper, TKUIReportBtnProps, LatLng, TKState, Environment}
    from '../index';
// from 'tripkit-react';
import {ReactComponent as IconReport} from './images/icon-usersnap.svg';
import Usersnap from "./usersnap/Usersnap";



const analyticsConfig = Environment.isProd() ? {
    google: {
        tracker: {
            trackingId: "UA-31384649-1",
            debug: true
        }
    }
} : undefined;

const config: TKUIConfig = {
    apiKey: '790892d5eae024712cfd8616496d7317',
    theme: {
        fontFamily: 'ProximaNova, sans-serif'
    },
    analytics: analyticsConfig,
    userLocationPromise: (window as any).tKUserLocationPromise ?
        (window as any).tKUserLocationPromise
            .then((userCoords: [number, number]) => LatLng.createLatLng(userCoords[0], userCoords[1])) : undefined,
    i18nPromise: (window as any).tKI18nPromise,
    TKUIReportBtn: {
        // Good example of element replacement.
        // render: (props: TKUIReportBtnProps) =>
        //     <IconReport
        //         className={classNames(props.className, props.classes.main)}
        //         onClick={() => {
        //             Usersnap.setFeedbackData(props.tKState);
        //             Usersnap.openReportWindow();
        //         }}
        //     />,
        // Other alternative, preserve all features on TKUIReportBtn
        // (viz. copy to clipboard on right click).
        props: {
            renderIcon: () => <IconReport style={{height: '100%', width: '100%'}}/>,
            onClick: (state: TKState) => {
                Usersnap.setFeedbackData(state);
                Usersnap.openReportWindow();
            }
        }
    }
};

ReactDOM.render(
    <TKRoot config={config}>
        <TKUITripPlanner/>
    </TKRoot>, document.getElementById("tripgo-sample-root"));