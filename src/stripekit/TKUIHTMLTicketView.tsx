import React, { useState, useEffect } from 'react';
import { TKUIWithClasses, withStyles } from '../jss/StyleHelper';
import { TKUITheme, white } from '../jss/TKUITheme';
import genStyles from '../css/GenStyle.css';
import TKUICard, { CardPresentation, TKUICardProps } from '../card/TKUICard';
import TKLoading from '../card/TKLoading';
import TripGoApi from '../api/TripGoApi';
import { PurchasedTicket } from '../model/trip/TicketOption';
import { TKError } from '../error/TKError';
import TKUIPagerControl from '../card/TKUIPagerControl';
import TKUIErrorView from '../error/TKUIErrorView';

const tKUIHTMLTicketViewPropsDefaultStyle = (theme: TKUITheme) => ({
    main: {
        ...genStyles.flex,
        ...genStyles.column,
        height: '100%'
    },
    content: {
        position: 'relative',
        padding: '20px',
        ...genStyles.grow,
        overflowY: 'auto'
    },
    loadingPanel: {
        ...genStyles.flex,
        ...genStyles.grow,
        ...genStyles.center,
        position: 'absolute',
        top: '0',
        background: white(1, theme.isDark),
        height: '100%',
        width: '100%'
    }
});

type IStyle = ReturnType<typeof tKUIHTMLTicketViewPropsDefaultStyle>

interface IProps extends TKUIWithClasses<IStyle, IProps>, Pick<TKUICardProps, "onRequestClose"> {
    purchasedTickets: PurchasedTicket[];
}

const TKUIHTMLTicketView: React.FunctionComponent<IProps> =
    ({ purchasedTickets, onRequestClose, classes }) => {
        const [ticketHTMLs, setTicketHTMLs] = useState<string[]>(new Array(purchasedTickets.length));
        const [errors, setErrors] = useState<TKError[]>(new Array(purchasedTickets.length));
        const [selected, setSelected] = useState<number>(0);
        useEffect(() => {
            purchasedTickets.forEach((ticket, i) =>
                TripGoApi.fetchAPI(ticket.ticketURL, {
                    method: 'get',
                    headers: {
                        'Accept': 'text/html'
                    }
                })
                    .then(result => {
                        setTicketHTMLs((prev) => {
                            const update = prev.slice();
                            update.splice(i, 1, result);
                            return update;
                        });
                    })
                    .catch(e => {
                        setErrors((prev) => {
                            const update = prev.slice();
                            update.splice(i, 1, e);
                            return update;
                        });
                    })
            )
        }, []);
        return (
            <TKUICard
                title={((purchasedTickets?.length ?? 0) > 1) ? "Tickets" : "Ticket"}
                onRequestClose={onRequestClose}
                presentation={CardPresentation.MODAL}
                focusTrap={true}
            >
                <div className={classes.main}>
                    {purchasedTickets.length > 1 &&
                        <TKUIPagerControl
                            value={selected}
                            onChange={setSelected}
                            length={purchasedTickets.length}
                        />}
                    <div className={classes.content}>
                        {ticketHTMLs[selected] ?
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: ticketHTMLs[selected]
                                }}
                            /> :
                            errors[selected] ?
                                <TKUIErrorView error={errors[selected]} /> :
                                <div className={classes.loadingPanel}>
                                    <TKLoading />
                                </div>}
                    </div>
                </div>
            </TKUICard>
        );
    }

export default withStyles(TKUIHTMLTicketView, tKUIHTMLTicketViewPropsDefaultStyle);