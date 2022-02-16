import React, { useContext } from 'react';
import { SignInStatus, TKAccountContext } from "./TKAccountContext";
import { ReactComponent as IconLoading } from "../images/ic-spin-bar.svg";
import TKUISettingSection from "../options/TKUISettingSection";
import TKUISettingLink from "../options/TKUISettingLink";
import { TKI18nContext } from '../i18n/TKI18nProvider';

const TKUISignInFromSettings: React.SFC<{}> = () => {
    const { status, login, logout } = useContext(TKAccountContext);
    const { t } = useContext(TKI18nContext);
    return (
        <TKUISettingSection>
            <TKUISettingLink
                text={status === SignInStatus.signedIn ? t("Sign.out") : t("Sign.in")}
                onClick={() => {
                    if (status === SignInStatus.signedOut) {
                        login();
                    } else if (status === SignInStatus.signedIn) {
                        logout();
                    }
                }}
                rightIcon={status === SignInStatus.loading ? () => <IconLoading /> : undefined}
            />
        </TKUISettingSection>
    )
};

export default TKUISignInFromSettings;