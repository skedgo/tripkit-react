import React, { useState } from 'react';
import { TKUIWithClasses, withStyles } from '../jss/StyleHelper';
import { TKUITheme } from '../jss/TKUITheme';
import genStyles from '../css/GenStyle.css';
import TKUICard, { CardPresentation, TKUICardProps } from '../card/TKUICard';
import TKLoading from '../card/TKLoading';
import { useEffect } from 'react';
import TripGoApi from '../api/TripGoApi';
import { PurchasedTicket } from '../model/trip/TicketOption';

const tKUIHTMLTicketViewPropsDefaultStyle = (theme: TKUITheme) => ({
    main: {
        margin: '20px'
    },
    loadingPanel: {
        ...genStyles.flex,
        ...genStyles.grow,
        ...genStyles.center,
        position: 'absolute',
        top: '0',
        backgroundColor: '#ffffffbf',
        height: '100%',
        width: '100%'
    }
});

type IStyle = ReturnType<typeof tKUIHTMLTicketViewPropsDefaultStyle>

interface IProps extends TKUIWithClasses<IStyle, IProps>, Pick<TKUICardProps, "onRequestClose"> {
    purchasedTickets: PurchasedTicket[];
}

const TKUIHTMLTicketView: React.FunctionComponent<IProps> =
    ({ purchasedTickets, onRequestClose, t, classes, theme }) => {
        const [ticketHTML, setTicketHTML] = useState<string | undefined>(undefined);
        useEffect(() => {
            TripGoApi.fetchAPI(purchasedTickets![0]!.ticketURL, {
                method: 'get',
                headers: {
                    'Accept': 'text/html'
                }
            })
                .then(result => setTicketHTML(result))                
                .catch(() => onRequestClose?.())
        }, []);
        return (
            <TKUICard
                title={"Ticket"}
                onRequestClose={onRequestClose}
                presentation={CardPresentation.MODAL}
            >
                {ticketHTML ?
                    <div
                        className={classes.main}
                        dangerouslySetInnerHTML={{
                            __html: ticketHTML
                        }}
                    /> :
                    <div className={classes.loadingPanel}>
                        <TKLoading />
                    </div>
                }
            </TKUICard>
        );
    }

export default withStyles(TKUIHTMLTicketView, tKUIHTMLTicketViewPropsDefaultStyle);