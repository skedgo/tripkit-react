import React from 'react';
import TicketOption from '../model/trip/TicketOption';
import { overrideClass, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import genStyles from '../css/GenStyle.css';
import { ReactComponent as IconPassenger } from '../images/ic-booking-passenger.svg';
import TKUIRow from '../options/TKUIRow';
import FormatUtil from '../util/FormatUtil';
import TKUIButton, { TKUIButtonType } from '../buttons/TKUIButton';
import { TKComponentDefaultConfig } from '../config/TKUIConfig';
import { connect, mapperFromFunction } from "../config/TKConfigHelper";
import Util from '../util/Util';
import { tKUIMxMBookingCardDefaultStyle } from './TKUIMxMBookingCard.css';
import { TKUITheme } from '../jss/TKUITheme';

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
    passengersInput: {
        ...genStyles.flex,
        ...genStyles.alignCenter,
        ...theme.textSizeBody,
        padding: '5px',
        borderRadius: '4px',
        minWidth: '60px',
        maxWidth: '70px',
        '& input': {
            border: 'none',
            maxWidth: '50px', // Firefox
            ...theme.textSizeBody
        }
    },
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
                                            onChange(update);
                                        }}
                                        type={TKUIButtonType.SECONDARY}
                                        styles={{
                                            secondary: overrideClass(injectedStyles.formButton)
                                        }}
                                    /> :
                                    <span className={classes.passengersInput}>
                                        <span style={{ marginRight: '4px' }}>x</span>
                                        <input
                                            type='number'
                                            value={ticket.value}
                                            min={0}
                                            max={99}
                                            onChange={e => {
                                                const update = tickets.slice();
                                                let valueAsInt = parseInt(e.target.value);
                                                if (!isNaN(valueAsInt) && valueAsInt > 99) {    // If greater that max, then leave previous value.
                                                    valueAsInt = update[i].value;
                                                }
                                                update[i] = Util.iAssign(update[i], { value: valueAsInt });
                                                onChange(update);
                                            }}
                                            onBlur={() => {
                                                // Fallback NaN to 0. Don't do it in onChange since it doesn't allow to delete the current 
                                                // number (with the keyboard) to enter another.
                                                if (isNaN(tickets[i].value)) {
                                                    const update = tickets.slice();
                                                    update[i] = Util.iAssign(update[i], { value: 0 });
                                                    onChange(update);
                                                }
                                            }}
                                        />
                                    </span>
                                }
                            </div>
                        )}
                    </div>
                </div>
        );
    };

export default connect(() => undefined, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));