import React, { Fragment } from 'react';
import { TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { connect, mapperFromFunction } from "../config/TKConfigHelper";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import { default as TKUIButton, TKUIButtonType } from "../buttons/TKUIButton";
import { BookingAction } from "../model/trip/BookingInfo";
import { tKUIBookingActionsDefaultStyle } from "./TKUIBookingActions.css";
import { Subtract } from 'utility-types';
interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    actions: BookingAction[];
    onAction?: (action: BookingAction) => void;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> { }

type IStyle = ReturnType<typeof tKUIBookingActionsDefaultStyle>

export type TKUIBookingActionsProps = IProps;
export type TKUIBookingActionsStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIBookingActions {...props} />,
    styles: tKUIBookingActionsDefaultStyle,
    classNamePrefix: "TKUIBookingActions"
};

type TKUIBookingActionProps = Subtract<IClientProps, { actions: BookingAction[], onAction?: (action: BookingAction) => void, }> & { action: BookingAction; onAction?: () => void; }

const TKUIBookingAction: React.FunctionComponent<TKUIBookingActionProps> = props => {
    const { action, onAction } = props;
    return (
        <Fragment>
            <TKUIButton
                text={action.title}
                type={TKUIButtonType.PRIMARY_LINK}
                onClick={() => {
                    onAction?.();
                }}
            />
        </Fragment>
    );
};

const TKUIBookingActions: React.FunctionComponent<IProps> = (props: IProps) => {
    const { actions, onAction, ...otherProps } = props;
    const { classes } = props;
    return (
        <div className={classes.actions}>
            {actions.map((action, i) => <TKUIBookingAction action={action} onAction={() => onAction?.(action)} key={i} {...otherProps} />)}
        </div>
    );
};

export default connect((config: TKUIConfig) => config.TKUIBookingActions, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));