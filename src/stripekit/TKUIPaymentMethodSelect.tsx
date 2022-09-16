import { PaymentMethod } from '@stripe/stripe-js/types/api/payment-methods';
import React, { useState } from 'react';
import genStyles from '../css/GenStyle.css';
import { TKUIWithClasses, withStyles } from '../jss/StyleHelper';
import { TKUITheme } from '../jss/TKUITheme';
import Util from '../util/Util';
import { ReactComponent as IconVisa } from "../images/payment/ic-visa.svg";
import { ReactComponent as IconMaster } from "../images/payment/ic-mastercard.svg";
import { ReactComponent as IconAmex } from "../images/payment/ic-amex.svg";
import { ReactComponent as IconCard } from "../images/payment/ic-creditcard.svg";
import { ReactComponent as IconRemove } from "../images/ic-clear-circle.svg";
import Radio from '@material-ui/core/Radio';
import { withStyles as muiWithStyles } from '@material-ui/core/styles';
import TKUIButton, { TKUIButtonType } from '../buttons/TKUIButton';
import { resetStyles } from '../css/ResetStyle.css';

const tKUIPaymentMethodSelectDefaultStyle = (theme: TKUITheme) => ({
    main: {
        ...genStyles.flex,
        ...genStyles.column
    },
    cardNRemove: {
        ...genStyles.flex,
        ...genStyles.alignCenter
    },
    card: {
        ...genStyles.flex,
        ...genStyles.alignCenter,
        ...genStyles.grow,
        cursor: 'pointer',
        '& span': {
            ...theme.textWeightBold,
            marginLeft: '5px'
        },
        '& svg': {
            marginRight: '10px',
            width: '36px'
        },
        '&:hover': {
            // background: '#e2733833'
            background: '#80808033'
        }
    },
    btnContainer: {
        ...genStyles.alignSelfStart,
        margin: '10px 0 0 18px'
    },
    btnRemove: {
        ...resetStyles.button,
        ...genStyles.noShrink,
        height: '40px',
        width: '40px',
        padding: '6px',
        cursor: 'pointer',
        marginLeft: '10px'
    }
});

type IStyle = ReturnType<typeof tKUIPaymentMethodSelectDefaultStyle>

interface IProps extends TKUIWithClasses<IStyle, IProps> {
    value: PaymentMethod;
    options: PaymentMethod[];
    onChange: (value: PaymentMethod) => void;
    onRemove: (value: PaymentMethod) => void;
}

function iconFromBrand(brand: string) {
    switch (brand) {
        case "visa": return <IconVisa />;
        case "mastercard": return <IconMaster />;
        case "amex": return <IconAmex />;
        default: return <IconCard />;
    }
}

const TKUIPaymentMethodSelect: React.FunctionComponent<IProps> =
    ({ value, options, onChange, onRemove, classes, theme }) => {
        const [StyledRadio] = useState<React.ComponentType<any>>(muiWithStyles({
            root: {
                marginLeft: '0',
                width: '50px',
                '&$checked': {
                    color: theme.colorPrimary
                }
            },
            checked: {},
        })(Radio));
        const [editing, setEditing] = useState<boolean>(false);
        return (
            <div className={classes.main}>
                {options.map(paymentMethod => {
                    const { card } = paymentMethod;
                    if (!card) {
                        return null;
                    }
                    const { brand, last4 } = card;
                    return (
                        <div className={classes.cardNRemove}>
                            <div className={classes.card} onClick={() => onChange(paymentMethod)}>
                                <StyledRadio checked={value === paymentMethod} />
                                {iconFromBrand(brand)}
                                <span>{Util.toFirstUpperCase(brand)}</span>
                                <span>ending in</span>
                                <span>{last4}</span>
                            </div>
                            {editing &&
                                <button
                                    onClick={e => {
                                        e.preventDefault();
                                        onRemove(paymentMethod);
                                    }}
                                    className={classes.btnRemove}
                                >
                                    <IconRemove />
                                </button>}
                        </div>
                    );
                })}
                <div className={classes.btnContainer}>
                    <TKUIButton
                        type={TKUIButtonType.PRIMARY_LINK}
                        text={editing ? "Editing done" : "Edit"}
                        onClick={e => {
                            e.preventDefault();
                            setEditing(!editing);
                        }}
                    />
                </div>
            </div>
        );
    }

export default withStyles(TKUIPaymentMethodSelect, tKUIPaymentMethodSelectDefaultStyle);