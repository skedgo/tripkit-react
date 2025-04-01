import React, { useContext } from 'react';
import { SignInStatus, TKAccountContext } from "./TKAccountContext";
import { ReactComponent as IconLoading } from "../images/ic-spin-bar.svg";
import TKUISettingSection from "../options/TKUISettingSection";
import TKUISettingLink from "../options/TKUISettingLink";
import { TKI18nContext } from '../i18n/TKI18nProvider';

interface IProps {
    onSignInClick?: () => void;
}

const TKUISignInFromSettings: React.FunctionComponent<IProps> = (props) => {
    const { status, login, logout } = useContext(TKAccountContext);
    const { onSignInClick = () => { login() } } = props;
    const { t } = useContext(TKI18nContext);
    return (
        <TKUISettingSection>
            <TKUISettingLink
                text={status === SignInStatus.signedIn ? t("Sign.out") : t("Sign.in")}
                onClick={() => {
                    if (status === SignInStatus.signedOut) {
                        onSignInClick();
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