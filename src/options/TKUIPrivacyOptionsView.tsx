import React, { useContext, useState } from "react";
import { overrideClass, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { TKUIViewportUtilProps, TKUIViewportUtil } from "../util/TKUIResponsiveUtil";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import { connect, PropsMapper } from "../config/TKConfigHelper";
import { Subtract } from "utility-types";
import { tKUIPrivacyOptionsViewDefaultStyle } from "./TKUIPrivacyOptionsView.css";
import { CardPresentation, default as TKUICard } from "../card/TKUICard";
import TKUserProfile from "../model/options/TKUserProfile";
import classNames from "classnames";
import { colorWithOpacity } from "../jss/TKUITheme";
import { withStyles } from '@material-ui/core/styles';
import Checkbox from '@material-ui/core/Checkbox';
import Util, { SKEDGO_PRIVACY_POLICY_URL } from "../util/Util";
import { TKUISlideUpOptions } from "../card/TKUISlideUp";
import TKUIButton, { TKUIButtonType } from "../buttons/TKUIButton";
import TKUISettingSection from "./TKUISettingSection";
import UIUtil from "../util/UIUtil";
import TripGoApi from "../api/TripGoApi";
import TKLoading from '../card/TKLoading';
import { SignInStatus, TKAccountContext } from "../account/TKAccountContext";
import { OptionsContext } from "./OptionsProvider";

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    value: TKUserProfile,
    onChange: (value: TKUserProfile) => void;
    onShowTransportOptions: () => void;
    onRequestClose?: () => void;
    slideUpOptions?: TKUISlideUpOptions;
    privacyPolicyUrl?: string;
}

interface IConsumedProps extends TKUIViewportUtilProps { }

type IStyle = ReturnType<typeof tKUIPrivacyOptionsViewDefaultStyle>

interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> { }

export type TKUIPrivacyOptionsViewProps = IProps;
export type TKUIPrivacyOptionsViewStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIPrivacyOptionsView {...props} />,
    styles: tKUIPrivacyOptionsViewDefaultStyle,
    classNamePrefix: "TKUIPrivacyOptionsView"
};

const TKUIPrivacyOptionsView: React.FunctionComponent<IProps> = (props: IProps) => {
    const { onRequestClose, theme, classes, t } = props;
    const [StyledCheckbox] = useState<React.ComponentType<any>>(withStyles({
        root: {
            color: colorWithOpacity(theme.colorPrimary, .5),
            '&$checked': {
                color: theme.colorPrimary
            }
        },
        checked: {},
    })(Checkbox));
    const [waiting, setWaiting] = useState<boolean>(false);
    const { accountsSupported, logout, status } = useContext(TKAccountContext);
    const { setShowUserProfile } = useContext(OptionsContext);
    return (
        <TKUICard
            title={t("My.Personal.Data")}
            presentation={props.landscape ? CardPresentation.MODAL : CardPresentation.SLIDE_UP}
            focusTrap={true}
            onRequestClose={onRequestClose}
            slideUpOptions={props.slideUpOptions}
        >
            <div className={classes.main}>
                {waiting &&
                    <div className={classes.loadingPanel}>
                        <TKLoading />
                    </div>}
                <TKUISettingSection>
                    <div tabIndex={0}>
                        <div className={classes.optionTitle}>
                            {t("Real-time.information.for.transport.options")}
                        </div>
                        <div className={classes.optionDescription}>
                            {t("To.show.transport.options,.we.may.share.per-query.information.of.start.location,.end.location,.and.query.time.with.transport.providers..You.can.disable.each.mode.individually,.where.you.dont.want.to.share.this.data.")}
                        </div>
                        <div style={{ display: 'flex', margin: '-10px 0 -15px 0' }}>
                            <TKUIButton text={t("Edit.transport.modes")}
                                type={TKUIButtonType.PRIMARY_LINK}
                                styles={{
                                    main: overrideClass(props.injectedStyles.optionLink)
                                }}
                                onClick={props.onShowTransportOptions}
                            />
                        </div>
                    </div>
                    <div className={classNames(classes.checkboxRow)} tabIndex={0}>
                        <div>
                            <div className={classes.optionTitle}>
                                {t("Trip.selections")}
                            </div>
                            <div className={classes.optionDescription}>
                                {t("Help.improve.transport.services.in.your.area.by.allowing.us.to.collect.information.about.which.trips.you.select.in.the.app.\nWe.aggregate.the.anonymised.data.and.provide.it.to.researchers,.regulators,.and.transport.providers.")}
                            </div>
                        </div>
                        <StyledCheckbox
                            checked={props.value.trackTripSelections}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                const checked = event.target.checked;
                                const update = Util.deepClone(props.value);
                                update.trackTripSelections = checked;
                                props.onChange(update);
                            }}
                            inputProps={{ 'aria-label': 'Trip selections' }}
                        />
                    </div>
                </TKUISettingSection>
                <div className={classes.sectionFooter} tabIndex={0}>
                    {t("We.keep.this.data.on.servers.in.Australia,.Europe,.or.the.US..We.retain.this.data.to.be.able.to.create.long-term.trends..For.more.details,.see.our.Privacy.Policy.")}
                </div>
                <TKUISettingSection>
                    <TKUIButton
                        text={t("Show.our.Privacy.Policy")}
                        type={TKUIButtonType.PRIMARY_LINK}
                        styles={{
                            main: overrideClass(props.injectedStyles.optionLink)
                        }}
                        onClick={() => window.open(props.privacyPolicyUrl ?? SKEDGO_PRIVACY_POLICY_URL, '_blank')}
                    />
                </TKUISettingSection>
                {accountsSupported && status === SignInStatus.signedIn &&
                    <TKUISettingSection>
                        <TKUIButton
                            text={t("Delete.my.account")}
                            type={TKUIButtonType.PRIMARY_LINK}
                            styles={{
                                main: overrideClass(props.injectedStyles.optionLink)
                            }}
                            onClick={() => UIUtil.confirmMsg({
                                title: t("Are.you.sure.you.want.to.delete.your.account?"),
                                message: t("This.will.delete.your.account.from.TripGos.servers..Continued.use.of.TripGo.will.create.a.new.empty.account.\n\nNote,.your.iCloud.data.will.not.be.deleted.by.this,.but.you.can.delete.this.in.the.Settings.app."),
                                confirmLabel: t("Delete"),
                                onConfirm: async () => {
                                    setWaiting(true);
                                    try {
                                        await TripGoApi.apiCall("/data/user", "DELETE");
                                        setShowUserProfile(false);
                                        logout();
                                    } catch (e) {
                                        UIUtil.errorMsg(e as Error);
                                    } finally {
                                        setWaiting(false);
                                    }
                                }
                            })}
                        />
                    </TKUISettingSection>}
            </div>
        </TKUICard>
    )
}

const Mapper: PropsMapper<IClientProps, Subtract<IProps, TKUIWithClasses<IStyle, IProps>>> =
    ({ inputProps, children }) =>
        <TKUIViewportUtil>
            {(viewportProps: TKUIViewportUtilProps) => children!({ ...inputProps, ...viewportProps })}
        </TKUIViewportUtil>;

export default connect((config: TKUIConfig) => config.TKUIPrivacyOptionsView, config, Mapper);