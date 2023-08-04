import React, { useContext, useEffect, useState } from 'react';
import { TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { connect, mapperFromFunction } from "../config/TKConfigHelper";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import TKUIRow from "../options/TKUIRow";
import { ReactComponent as IconSubscription } from "../images/ic-subscription.svg";
import { ReactComponent as IconSunClock } from "../images/ic-clocksand.svg";
import { tKUISubscriptionDefaultStyle } from "./TKUISubscription.css";
import { TKAccountContext } from '../account/TKAccountContext';
import FormatUtil from '../util/FormatUtil';
import { ReactComponent as IconRightArrow } from "../images/ic-angle-right.svg";
import FutureBundle from '../model/user/FutureBundle';
import CurrentBundle from '../model/user/CurrentBundle';
import DateTimeUtil from '../util/DateTimeUtil';
import TKUISubscriptionView from './TKUISubscriptionView';

interface IClientProps extends TKUIWithStyle<IStyle, IProps> { }

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> { }

type IStyle = ReturnType<typeof tKUISubscriptionDefaultStyle>

export type TKUISubscriptionProps = IProps;
export type TKUISubscriptionStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUISubscription {...props} />,
    styles: tKUISubscriptionDefaultStyle,
    classNamePrefix: "TKUISubscription"
};

let veryFirstTime = true;

const TKUISubscription: React.FunctionComponent<IProps> = (props: IProps) => {
    const { t, classes } = props;
    const { userAccount: currentUserAccount, refreshUserProfile } = useContext(TKAccountContext);
    // Undefine userAccount while refreshing user.
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const userAccount = !refreshing ? currentUserAccount : undefined;    
    const currentBundle = !userAccount ? undefined : userAccount.currentBundle ?? null; // Use undefined for waiting, and null for user without bundle.
    const futureBundle = !userAccount ? undefined : userAccount.futureBundle ?? null;
    const [showDetailOf, setShowDetailOf] = useState<CurrentBundle | FutureBundle | undefined>();
    useEffect(() => {
        // Refresh user on component mount, except the very first time.
        if (veryFirstTime) {
            veryFirstTime = false;
            return;
        }
        setRefreshing(true);
        refreshUserProfile()
            .finally(() => {
                setRefreshing(false);
            });
    }, [])
    function renderBundle(bundle: CurrentBundle | FutureBundle) {
        return (
            <button className={classes.subscription} onClick={() => setShowDetailOf(bundle)}>
                <div className={classes.icon}>
                    <IconSubscription />
                </div>
                <div className={classes.rightPanel}>
                    <div className={classes.balance}>
                        {bundle instanceof CurrentBundle ?
                            (bundle.balance.id === "" ? null : FormatUtil.toMoney(bundle.balance.userBalance, { currency: currentBundle?.currency, nInCents: true, zeroAsFree: false })) :
                            t("Effective.from.X", { 0: DateTimeUtil.isoFormat(bundle.futureBillingCycle.toBeAppliedTimestamp, "DD MMM YYYY") })}
                    </div>
                    <div className={classes.subscriptionName}>
                        {bundle.name}
                    </div>
                </div>
                <IconRightArrow className={classes.iconArrow} />
            </button>
        );
    }
    let content;
    if (currentBundle || futureBundle) {
        content =
            <div className={classes.bundles}>
                {currentBundle && renderBundle(currentBundle)}
                {futureBundle && renderBundle(futureBundle)}
            </div>;
    } else {
        const icon = <IconSunClock />;
        const title = t("Getting.subscription");
        const subtitle = t("Please.wait.while.we.look.for.your.subscription..This.could.take.a.few.moments");
        content =
            <div className={classes.info}>
                <div className={classes.icon}>
                    {icon}
                </div>
                <TKUIRow
                    title={title}
                    subtitle={subtitle}
                />
            </div>;
    }
    return (
        <>
            <div className={classes.main}>
                <div className={classes.header}>
                    <div className={classes.title}>
                        Current balance
                        {/* {t("Current.balance")} */}
                    </div>
                </div>
                {content}
            </div>
            {showDetailOf &&
                <TKUISubscriptionView subscription={showDetailOf} onRequestClose={() => setShowDetailOf(undefined)} />}
        </>
    );
};

export default connect((config: TKUIConfig) => config.TKUISubscription, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));