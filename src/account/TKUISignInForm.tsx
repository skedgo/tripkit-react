import React, { ChangeEvent, useState } from 'react';
import { TKUIWithClasses, TKUIWithStyle } from '../jss/StyleHelper';
import { connect, mapperFromFunction } from '../config/TKConfigHelper';
import { TKComponentDefaultConfig } from '../config/TKComponentConfig';
import { tKUISignInFormDefaultStyle } from './TKUISignInForm.css';

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    onSignIn: (props: { user: string, password: string }) => void;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> { }

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
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    function handleUserChange(event: ChangeEvent<HTMLInputElement>): void {
        setUsername(event.target.value);
    }

    function handlePasswordChange(event: ChangeEvent<HTMLInputElement>): void {
        setPassword(event.target.value);
    }

    function handleSignInClick(): void {
        props.onSignIn({ user: username, password: password });
    }

    return (
        <div className={classes.main}>
            <input type="text" placeholder="Username" value={username} onChange={handleUserChange} />
            <input type="password" placeholder="Password" value={password} onChange={handlePasswordChange} />
            <button onClick={handleSignInClick}>{t("Sign.in")}</button>
        </div>
    );
}

export default connect(() => undefined, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));

function setUsername(value: string) {
    throw new Error('Function not implemented.');
}
