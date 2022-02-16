import React, { useContext } from 'react';
import { SignInStatus, TKAccountContext } from "./TKAccountContext";
import { ReactComponent as IconLoading } from "../images/ic-spin-bar.svg";
import TKUIButton, { TKUIButtonType } from "../buttons/TKUIButton";
import { TKI18nContext } from '../i18n/TKI18nProvider';

const TKUISignInBtn: React.SFC<{}> = () => {
    const { status, login, logout } = useContext(TKAccountContext);
    const { t } = useContext(TKI18nContext);
    return (
        <TKUIButton
            type={status === SignInStatus.signedOut ? TKUIButtonType.PRIMARY : TKUIButtonType.SECONDARY}
            text={status === SignInStatus.loading ? <IconLoading style={{ width: '30px', height: '18px' }} /> : status === SignInStatus.signedIn ? t("Sign.out") : t("Sign.in")}
            onClick={() => {
                if (status === SignInStatus.signedOut) {
                    login();
                } else if (status === SignInStatus.signedIn) {
                    logout();
                }
            }}
            disabled={status === SignInStatus.loading}
        />
    )
};

export default TKUISignInBtn;