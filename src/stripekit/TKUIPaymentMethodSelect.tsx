import { PaymentMethod } from '@stripe/stripe-js/types/api/payment-methods';
import React, { ReactNode, useState } from 'react';
import genStyles from '../css/GenStyle.css';
import { TKUIWithClasses, withStyles } from '../jss/StyleHelper';
import { TKUITheme, black } from '../jss/TKUITheme';
import Util from '../util/Util';
import { ReactComponent as IconVisa } from "../images/payment/ic-visa.svg";
import { ReactComponent as IconMaster } from "../images/payment/ic-mastercard.svg";
import { ReactComponent as IconAmex } from "../images/payment/ic-amex.svg";
import { ReactComponent as IconCard } from "../images/payment/ic-creditcard.svg";
import { ReactComponent as IconBalance } from "../images/ic-money-circle-small.svg";
import { ReactComponent as IconRemove } from "../images/ic-clear-circle.svg";
import TKUIButton, { TKUIButtonType } from '../buttons/TKUIButton';
import { resetStyles } from '../css/ResetStyle.css';
import FormatUtil from '../util/FormatUtil';
import classNames from 'classnames';
import TKUISelect, { SelectOption } from '../buttons/TKUISelect';
import PaymentOption from '../model/trip/PaymentOption';
import TKUIRadio from '../util_components/TKUIRadio';

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
            marginLeft: '5px'
        },
        '&:hover': {
            background: '#80808033'
        }
    },
    selected: {
        ...theme.textWeightBold
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
        marginLeft: '10px',
        '& path': {
            fill: black(0, theme.isDark)
        }
    },
    icon: {
        '& svg': {
            marginRight: '10px',
            width: '36px'
        },
        '& path': {
            fill: black(0, theme.isDark)
        }
    },
    iconBalance: {
        height: '26px',
        marginRight: '15px',
        '& svg': {
            width: '100%',
            height: '100%'
        }
    }
});

type IStyle = ReturnType<typeof tKUIPaymentMethodSelectDefaultStyle>

export type SGPaymentMethod = { paymentOption: PaymentOption, data?: { stripePaymentMethod?: PaymentMethod } };
interface IProps extends TKUIWithClasses<IStyle, IProps> {
    value: SGPaymentMethod;
    options: SGPaymentMethod[];
    onChange: (value: SGPaymentMethod) => void;
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
        const [editing, setEditing] = useState<boolean>(false);
        function renderPaymentMethod(paymentMethod: SGPaymentMethod, i: number): ReactNode {
            const paymentMethodClass = classNames(classes.card, value === paymentMethod && classes.selected);
            switch (paymentMethod.paymentOption.paymentMode) {
                case "INTERNAL":
                    const stripePaymentMethod = paymentMethod.data!.stripePaymentMethod!;
                    const { card } = stripePaymentMethod;
                    if (!card) {
                        return null;
                    }
                    const { brand, last4 } = card;
                    return (
                        <div className={classes.cardNRemove} key={i}>
                            <div className={paymentMethodClass} onClick={() => onChange(paymentMethod)}>
                                <TKUIRadio checked={value === paymentMethod} theme={theme} />
                                <div className={classes.icon}>
                                    {iconFromBrand(brand)}
                                </div>
                                <span>{Util.toFirstUpperCase(brand)}</span>
                                <span>ending in</span>
                                <span>{last4}</span>
                            </div>
                            {editing &&
                                <button
                                    onClick={e => {
                                        e.preventDefault();
                                        onRemove(stripePaymentMethod);
                                    }}
                                    className={classes.btnRemove}
                                >
                                    <IconRemove />
                                </button>}
                        </div>
                    );
                case "WALLET":
                    return (
                        <div className={paymentMethodClass} onClick={() => onChange(paymentMethod)} key={i}>
                            <TKUIRadio checked={value === paymentMethod} theme={theme} />
                            <div className={classNames(classes.icon, classes.iconBalance)}>
                                <IconBalance />
                            </div>
                            <div>{paymentMethod.paymentOption.description}</div>
                            {paymentMethod.paymentOption.currentBalance &&
                                <div style={{ marginLeft: '6px', color: black(1), fontStyle: 'italic' }}>
                                    {`(${paymentMethod.paymentOption.walletName ? paymentMethod.paymentOption.walletName + " ⋅ " : ""}${FormatUtil.toMoney(paymentMethod.paymentOption.currentBalance, { nInCents: true, currency: paymentMethod.paymentOption.currency })})`}
                                </div>}
                        </div>
                    );
                case "INVOICE":
                    return (
                        <div className={paymentMethodClass} onClick={() => onChange(paymentMethod)} key={i}>
                            <TKUIRadio checked={value === paymentMethod} theme={theme} />
                            <div className={classNames(classes.icon, classes.iconBalance)}>
                                <IconBalance />
                            </div>
                            <div>{paymentMethod.paymentOption.description} to department</div>
                        </div>
                    );
                default:
                    return null;
            }
        }

        return (
            <div className={classes.main}>
                {options.map((paymentMethod, i) => renderPaymentMethod(paymentMethod, i))}
                {options.find(paymentMethod => paymentMethod.paymentOption.paymentMode === "INTERNAL") &&
                    <div className={classes.btnContainer}>
                        <TKUIButton
                            type={TKUIButtonType.PRIMARY_LINK}
                            text={editing ? "Editing done" : "Edit Cards"}
                            onClick={e => {
                                e.preventDefault();
                                setEditing(!editing);
                            }}
                        />
                    </div>}
            </div>
        );
    }

export default withStyles(TKUIPaymentMethodSelect, tKUIPaymentMethodSelectDefaultStyle);