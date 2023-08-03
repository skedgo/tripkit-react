import React from 'react';
import { TKUIWithClasses, TKUIWithStyle, overrideClass } from "../jss/StyleHelper";
import { connect, mapperFromFunction } from "../config/TKConfigHelper";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import { tKUISubscriptionViewDefaultStyle } from "./TKUISubscriptionView.css";
import TKUICard, { CardPresentation } from "../card/TKUICard";
import CurrentBundle from '../model/user/CurrentBundle';
import FutureBundle from '../model/user/FutureBundle';
import { useResponsiveUtil } from '../util/TKUIResponsiveUtil';
import TKUISettingSection from '../options/TKUISettingSection';
import DateTimeUtil from '../util/DateTimeUtil';
import TKUIRow from '../options/TKUIRow';
import TransportUtil from '../trip/TransportUtil';
import FormatUtil from '../util/FormatUtil';

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    subscription: CurrentBundle | FutureBundle;
    onRequestClose?: () => void;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> { }

type IStyle = ReturnType<typeof tKUISubscriptionViewDefaultStyle>

export type TKUISubscriptionViewProps = IProps;
export type TKUISubscriptionViewStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUISubscriptionView {...props} />,
    styles: tKUISubscriptionViewDefaultStyle,
    classNamePrefix: "TKUISubscriptionView"
};

const TKUISubscriptionView: React.FunctionComponent<IProps> = (props: IProps) => {
    const { subscription, onRequestClose, classes, t } = props;
    const { landscape } = useResponsiveUtil();
    const currentSubscription = subscription instanceof CurrentBundle ? subscription : undefined;
    const futureSubscription = subscription instanceof FutureBundle ? subscription : undefined;
    const sectionStyles = { sectionBody: overrideClass({ background: 'white' }) };
    return (
        <TKUICard
            title={subscription.name}
            presentation={landscape ? CardPresentation.MODAL : CardPresentation.SLIDE_UP}
            focusTrap={false}
            onRequestClose={onRequestClose}
        >
            <div className={classes.main}>
                <div className={classes.banner}>
                    {t("This.is.your.X.plan", { 0: currentSubscription ? t("Current") : t("Upcoming") })}
                </div>
                <TKUISettingSection styles={sectionStyles}>
                    <div className={classes.groupVertical}>
                        <div className={classes.label}>{t('Description')}</div>
                        <div className={classes.value}>{subscription.description}</div>
                    </div>
                </TKUISettingSection>
                <TKUISettingSection title={currentSubscription ? t("Current.billing.cycle") : t("Next.billing.cycle")} styles={sectionStyles}>
                    <div className={classes.group}>
                        <div className={classes.label}>{t('Effective.from')}</div>
                        <div className={classes.value}>{DateTimeUtil.isoFormat((currentSubscription?.currentBillingCycle?.appliedTimestamp ?? futureSubscription?.futureBillingCycle?.toBeAppliedTimestamp)!, "DD MMM YYYY")}</div>
                    </div>
                    {currentSubscription &&
                        <div className={classes.group}>
                            <div className={classes.label}>{t('Expires.on')}</div>
                            <div className={classes.value}>{DateTimeUtil.isoFormat(currentSubscription.currentBillingCycle.expirationTimestamp!, "DD MMM YYYY")}</div>
                        </div>}
                    <div className={classes.group}>
                        <div className={classes.label}>{t('Last.payment')}</div>
                        <div className={classes.value}>{DateTimeUtil.isoFormat((currentSubscription?.currentBillingCycle?.paymentTimestamp ?? futureSubscription?.futureBillingCycle?.paymentTimestamp)!, "DD MMM YYYY")}</div>
                    </div>
                    <div className={classes.groupVertical}>
                        <div className={classes.label}>{t('Reference.number')}</div>
                        <div className={classes.value}>{currentSubscription?.currentBillingCycle.externalPaymentID ?? futureSubscription?.futureBillingCycle.externalPaymentID}</div>
                    </div>
                </TKUISettingSection>
                <TKUISettingSection styles={sectionStyles}>
                    {subscription.transportModes.map(bundleMode => {
                        return (
                            <div className={classes.bundleMode}>
                                <div>
                                    {<img src={TransportUtil.getTransIcon(bundleMode.modeInfo)} />}
                                </div>
                                <TKUIRow
                                    title={bundleMode.modeInfo.alt}
                                    subtitle={bundleMode.pointsPerCost === 0 ? t("Unlimited") :
                                        t("Take.X.off.every.trip", { 0: FormatUtil.truncateToDecimals((1 - bundleMode.pointsPerCost) * 100, 0) + "%" })}
                                />
                            </div>
                        );
                    })}
                </TKUISettingSection>
                <div className={classes.disclaimer}>
                    {t("You.will.receive.discounted.rates.if.the.above.transport.modes.are.used..For.transport.modes.not.shown,.full.fares.apply")}
                </div>
            </div>
        </TKUICard>
    );
};

export default connect((config: TKUIConfig) => config.TKUISubscriptionView, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));