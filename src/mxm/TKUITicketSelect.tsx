import React from 'react';
import TicketOption from '../model/trip/TicketOption';
import { overrideClass, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import genStyles from '../css/GenStyle.css';
import { ReactComponent as IconPassenger } from '../images/ic-booking-passenger.svg';
import { ReactComponent as IconAdd } from '../images/ic-add.svg';
import { ReactComponent as IconRemove } from '../images/ic-remove.svg';
import TKUIRow from '../options/TKUIRow';
import FormatUtil from '../util/FormatUtil';
import TKUIButton, { TKUIButtonType } from '../buttons/TKUIButton';
import { TKComponentDefaultConfig } from '../config/TKUIConfig';
import { connect, mapperFromFunction } from "../config/TKConfigHelper";
import Util from '../util/Util';
import { tKUIMxMBookingCardDefaultStyle } from './TKUIMxMBookingCard.css';
import { black, TKUITheme } from '../jss/TKUITheme';

const ticketSelectJss = (theme: TKUITheme) => ({
    main: {
        ...genStyles.flex,
        ...genStyles.column
    },
    title: {
        ...theme.textColorGray,
        ...theme.textWeightSemibold,
        marginBottom: '16px'
    },
    form: tKUIMxMBookingCardDefaultStyle(theme).form,
    option: tKUIMxMBookingCardDefaultStyle(theme).group,
    icon: tKUIMxMBookingCardDefaultStyle(theme).icon,
    row: {
        padding: 0,
        ...genStyles.grow
    },
    formButton: {
        padding: '4px 16px',
        color: theme.colorPrimary
    },
    mainReadOnly: {
        ...genStyles.flex,
        ...genStyles.alignCenter,
        ...genStyles.grow
    },
    ticketsReadonly: {
        ...genStyles.grow,
        ...genStyles.flex,
        ...genStyles.column,
        '&>*:not(:first-child)': {
            marginTop: '5px'
        }
    },
    passengersStepper: {
        ...genStyles.flex,
        ...genStyles.alignCenter,
        ...theme.textSizeBody
    },
    stepperButtons: {
        ...genStyles.flex,
        ...genStyles.alignCenter,
        '&>*:not(:last-child)': {
            marginRight: '10px'
        }
    },
    stepperBtn: {
        padding: '2px',
        height: '32px',
        width: '32px',
        '& svg': {
            width: '14px',
            height: '14px',
            '& path': {
                fill: black(0, theme.isDark)
            }
        }
    }
});

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    tickets: TicketOption[];
    onChange?: (update: TicketOption[]) => void;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> { }

type IStyle = ReturnType<typeof ticketSelectJss>

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUITicketSelect {...props} />,
    styles: ticketSelectJss,
    classNamePrefix: "TKUITicketSelect"
};

const TKUITicketSelect: React.FunctionComponent<IProps> =
    ({ tickets, onChange, classes, injectedStyles }) => {
        const readonly = !onChange;
        const onTicketValueChange = (ticketNumber: number, increase: boolean) => {
            const update = tickets.slice();
            const newValue = update[ticketNumber].value + (increase ? 1 : -1);
            update[ticketNumber] = Util.iAssign(update[ticketNumber], { value: newValue });
            onChange!(update);
        }
        return (
            readonly ?
                <div className={classes.mainReadOnly}>
                    <IconPassenger className={classes.icon} />
                    <div className={classes.ticketsReadonly}>
                        {tickets.map((ticket, i) =>
                            <div>
                                {ticket.value + " x " + ticket.name}
                            </div>)}
                    </div>
                    <div>
                        {FormatUtil.toMoney(tickets.reduce((totalPrice, ticket) => totalPrice + ticket.price, 0),
                            { currency: tickets[0].currency + " ", nInCents: true })}
                    </div>
                </div>
                :
                <div className={classes.main}>
                    <div className={classes.title}>
                        Select tickets
                    </div>
                    <div className={classes.form}>
                        {tickets.map((ticket, i) =>
                            <div className={classes.option} key={i}>
                                <IconPassenger className={classes.icon} />
                                <TKUIRow
                                    title={ticket.name}
                                    subtitle={FormatUtil.toMoney(ticket.price, { currency: ticket.currency + " ", nInCents: true })}
                                    styles={{
                                        main: overrideClass(injectedStyles.row)
                                    }}
                                />
                                {ticket.value === 0 ?
                                    <TKUIButton
                                        text={"Select"}
                                        onClick={() => {
                                            const update = tickets.slice();
                                            update[i] = Util.iAssign(update[i], { value: 1 });
                                            onChange!(update);
                                        }}
                                        type={TKUIButtonType.SECONDARY}
                                        styles={{
                                            secondary: overrideClass(injectedStyles.formButton)
                                        }}
                                    /> :
                                    <div className={classes.passengersStepper}>
                                        <span style={{ marginRight: '14px' }}>{"x" + ticket.value}</span>
                                        <div className={classes.stepperButtons}>
                                            <TKUIButton
                                                type={TKUIButtonType.SECONDARY_VERTICAL}
                                                onClick={() => onTicketValueChange(i, false)}
                                                icon={<IconRemove />}
                                                styles={{ secondary: overrideClass(injectedStyles.stepperBtn) }}
                                            />
                                            <TKUIButton
                                                type={TKUIButtonType.SECONDARY_VERTICAL}
                                                onClick={() => onTicketValueChange(i, true)}
                                                icon={<IconAdd />}
                                                styles={{ secondary: overrideClass(injectedStyles.stepperBtn) }}
                                            />
                                        </div>
                                    </div>
                                }
                            </div>
                        )}
                    </div>
                </div>
        );
    };

export default connect(() => undefined, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));