import React, {useState, useEffect, Fragment, useContext} from 'react';
import {TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {connect, mapperFromFunction} from "../config/TKConfigHelper";
import {TKComponentDefaultConfig} from "../config/TKUIConfig";
import {Subtract} from 'utility-types';
import {default as TKUIButton, TKUIButtonType} from "../buttons/TKUIButton";
import NetworkUtil from "../util/NetworkUtil";
import TripGoApi from "../api/TripGoApi";
import {BookingAction} from "../model/trip/BookingInfo";
import {tKUIBookingActionsDefaultStyle} from "./TKUIBookingActions.css";
import UIUtil from "../util/UIUtil";

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    actions: BookingAction[];
    setWaiting?: (waiting: boolean) => void;
    setError?: (error: any) => void;
    requestRefresh: () => Promise<void>;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {}

type IStyle = ReturnType<typeof tKUIBookingActionsDefaultStyle>

export type TKUIBookingActionsProps = IProps;
export type TKUIBookingActionsStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIBookingActions {...props}/>,
    styles: tKUIBookingActionsDefaultStyle,
    classNamePrefix: "TKUIBookingActions"
};

const TKUIBookingAction: React.SFC<IProps & {action: BookingAction}> = props => {
    const {action, setWaiting, setError, requestRefresh, t} = props;
    return (
        <TKUIButton
            text={action.title}
            type={TKUIButtonType.PRIMARY_LINK}
            onClick={() => {
                if (action.internalURL) {
                    UIUtil.confirmMsg({
                        onConfirm: () => {
                            setWaiting?.(true);
                            TripGoApi.apiCallUrl(action.internalURL, NetworkUtil.MethodType.GET)
                            // NetworkUtil.delayPromise(10)({})     // For testing
                                .then(requestRefresh)
                                .catch((e) => setError?.(e))
                                .finally(() => setWaiting?.(false));
                        }
                    })
                } else if (action.externalURL) {
                    window.open(action.externalURL, "_self");
                }
            }}
        />
    );
};

const TKUIBookingActions: React.SFC<IProps> = (props: IProps) => {
    const {actions, classes} = props;
    return (
        <div className={classes.actions}>
            {actions.map((action, i) => <TKUIBookingAction action={action} key={i} {...props}/>)}
        </div>
    );
};

export default connect(() => undefined, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));