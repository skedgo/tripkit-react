import React, {useContext} from 'react';
import {SignInStatus, TKAccountContext} from "./TKAccountProvider";
import {ReactComponent as IconLoading} from "../images/ic-spin-bar.svg";
import TKUISettingSection from "../options/TKUISettingSection";
import TKUISettingLink from "../options/TKUISettingLink";

const TKUISignInFromSettings: React.SFC<{}> = () => {
    const {status, login, logout} = useContext(TKAccountContext);
    return (
        <TKUISettingSection>
            <TKUISettingLink
                text={status === SignInStatus.signedIn ? 'Logout' : 'Login'}
                onClick={() => {
                    if (status === SignInStatus.signedOut) {
                        login();
                    } else if (status === SignInStatus.signedIn) {
                        logout();
                    }
                }}
                rightIcon={status === SignInStatus.loading ? () => <IconLoading/> : undefined}
            />
        </TKUISettingSection>
    )
};

export default TKUISignInFromSettings;