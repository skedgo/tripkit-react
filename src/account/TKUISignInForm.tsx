import React, { ChangeEvent, useContext, useState } from 'react';
import { TKUIWithClasses, TKUIWithStyle } from '../jss/StyleHelper';
import { connect, mapperFromFunction } from '../config/TKConfigHelper';
import { TKComponentDefaultConfig } from '../config/TKComponentConfig';
import { tKUISignInFormDefaultStyle } from './TKUISignInForm.css';
import TKUIButton from '../buttons/TKUIButton';
import { SignInStatus, TKAccountContext } from './TKAccountContext';
import { ReactComponent as IconLoading } from "../images/ic-spin-bar.svg";

interface IClientProps extends TKUIWithStyle<IStyle, IProps> { }

type IStyle = ReturnType<typeof tKUISignInFormDefaultStyle>

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> { }

export type TKUIFromToStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUISignInForm {...props} />,
    styles: tKUISignInFormDefaultStyle,
    classNamePrefix: "TKUISignInForm"
};

const TKUISignInForm: React.FunctionComponent<IProps> = (props: IProps) => {
    const { t, classes } = props;
    const { status, login } = useContext(TKAccountContext);
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [errorMsg, setErrorMsg] = useState<string>('');

    function handleUserChange(event: ChangeEvent<HTMLInputElement>): void {
        setUsername(event.target.value);
    }

    function handlePasswordChange(event: ChangeEvent<HTMLInputElement>): void {
        setPassword(event.target.value);
    }

    async function handleSignInClick(): Promise<void> {
        try {
            setErrorMsg('');
            await login({ user: username, password: password });
        } catch (e) {
            setErrorMsg((e as any).message);
        }
    }

    return (
        <div className={classes.main}>
            <input type="text" placeholder="Username or email" value={username} onChange={handleUserChange} autoComplete="username" />
            <input type="password" placeholder="Password" value={password} onChange={handlePasswordChange} autoComplete="current-password" />
            <div className={classes.errorMessage}>
                {errorMsg}
            </div>
            <TKUIButton onClick={handleSignInClick} text={status === SignInStatus.loading ? <IconLoading className={classes.iconLoading} /> : t("Sign.in")} />
        </div>
    );
}

export default connect(() => undefined, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));
