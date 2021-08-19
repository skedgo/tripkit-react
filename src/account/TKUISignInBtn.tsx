import React, {useContext} from 'react';
import {SignInStatus, TKAccountContext} from "./TKAccountProvider";
import {TKUIButton, TKUIButtonType} from '../index';
import {ReactComponent as IconLoading} from "../images/ic-spin-bar.svg";

const TKUISignInBtn: React.SFC<{}> = () => {
    const {status, login, logout} = useContext(TKAccountContext);
    return (
        <TKUIButton
            type={status === SignInStatus.signedOut ? TKUIButtonType.PRIMARY : TKUIButtonType.SECONDARY}
            text={status === SignInStatus.loading ? <IconLoading style={{width: '30px', height: '18px'}}/> : status === SignInStatus.signedIn ? 'Logout' : 'Login'}
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