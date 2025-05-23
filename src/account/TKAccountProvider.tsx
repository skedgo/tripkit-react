import React, { useState, useEffect, useContext } from 'react';
import { Auth0Provider, User as Auth0User, useAuth0 } from "@auth0/auth0-react";
import TripGoApi from "../api/TripGoApi";
import TKAuthResponse from "./TKAuthResponse";
import TKUserAccount from "./TKUserAccount";
import LocalStorageItem from "../data/LocalStorageItem";
import { RoutingResultsContext } from "../trip-planner/RoutingResultsProvider";
import { IAccountContext, SignInStatus, TKAccountContext } from "./TKAccountContext";
import Util from '../util/Util';
import { OptionsContext } from '../options/OptionsProvider';

class AuthStorage extends LocalStorageItem<TKAuthResponse> {
    private static _instance: AuthStorage;

    public static get instance(): AuthStorage {
        if (!this._instance) {
            this._instance = new AuthStorage(TKAuthResponse, "AUTH");
        }
        return this._instance;
    }
}

// Doing this with useState have problems when component is re-constructed.
let finishInitLoadingPromise: Promise<SignInStatus.signedIn | SignInStatus.signedOut>;
let finishInitLoadingResolver: (value: SignInStatus.signedIn | SignInStatus.signedOut) => void;

const Auth0ToTKAccount: React.FunctionComponent<{
    requestUserToken?: (auth0AccessToken: string) => Promise<TKAuthResponse>,
    requestUserProfile?: (auth0User: Auth0User) => Promise<TKUserAccount>,
    children: (context: IAccountContext) => React.ReactNode,
    withPopup?: boolean
}> = (props) => {
    const { requestUserToken, requestUserProfile, withPopup } = props;
    const { loginWithRedirect, loginWithPopup, logout, getAccessTokenSilently, isLoading, isAuthenticated, user } = useAuth0();
    const [userToken, setUserToken] = useState<string | undefined>(AuthStorage.instance.get().userToken);
    const initStatus = (isLoading || isAuthenticated) ? SignInStatus.loading : SignInStatus.signedOut;
    const [status, setStatus] = useState<SignInStatus>(initStatus);
    const [userAccount, setUserAccount] = useState<TKUserAccount | undefined>(undefined);
    const { onWaitingStateLoad } = useContext(RoutingResultsContext);
    const { onUserProfileChange } = useContext(OptionsContext);
    const requestUserTokenFc = requestUserToken ?? ((auth0AccessToken: string) =>
        TripGoApi.apiCallT("/data/user/auth/auth0/" + auth0AccessToken, "POST", TKAuthResponse));
    const requestUserProfileFc: ((auth0user: Auth0User) => Promise<TKUserAccount>) = requestUserProfile ?? (() =>
        TripGoApi.apiCallT("/data/user/", "GET", TKUserAccount));
    useEffect(() => {
        // Authenticated in Auth0 but not on our BE (no userToken), e.g. when returning from loginWithRedirect or
        // on login pupup closed, so login to our BE.
        if (!isLoading && isAuthenticated && !AuthStorage.instance.get().userToken) {
            getAccessTokenSilently()
                .then(requestUserTokenFc)
                .then((result: TKAuthResponse) => {
                    AuthStorage.instance.save(result);
                    setUserToken(result.userToken);
                })
                .catch((error) => {
                    console.log(error);
                    setStatus(SignInStatus.signedOut);
                });
        }
        // Not Authenticated in Auth0, so cleanup our token + set status to SignInStatus.signedOut.
        if (!isLoading && !isAuthenticated) {
            setStatus(SignInStatus.signedOut);
            AuthStorage.instance.save(new TKAuthResponse());
            setUserToken(undefined);
            setUserAccount(undefined);
            // logoutHandler(); // Calling this (which calls Auth0 logout()) instead of the previous 4 lines causes an infinite redirection loop.
        }
    }, [isLoading, isAuthenticated]);
    function refreshUserProfile(): Promise<TKUserAccount> {
        if (userToken && !isLoading && isAuthenticated) {
            return requestUserProfileFc(user ?? {})
                .then((result) => {
                    setUserAccount(result);
                    return result;
                });
        } else {
            return Promise.reject("Still signing in");
        }
    }
    useEffect(() => {
        // Set userToken to be used by SDK
        TripGoApi.userToken = userToken;
        // Request user profile, just if Auth0 determined the user is authenticated.
        if (userToken && !isLoading && isAuthenticated) {
            requestUserProfileFc(user ?? {})
                .then((result) => {
                    setUserAccount(result);
                    setStatus(SignInStatus.signedIn);
                })
                .catch((error) => {
                    // E.g. {"usererror":true,"errorCode":447,"title":"Invalid userToken","error":"You need to sign in first"}
                    console.log(error);
                    logoutHandler();
                });
        }
    }, [userToken, isLoading]);
    const login = () => {
        setStatus(SignInStatus.loading);
        if (!withPopup) { // Blocking spinner, just if login with redirect.
            onWaitingStateLoad(true);
        }
        // prompt 'login' to always show login dialog to user if logged out.
        return (withPopup ? loginWithPopup({ prompt: 'login' }, { timeoutInSeconds: 600 }) :
            loginWithRedirect({
                prompt: 'login',
                appState: { returnTo: window.location.href }
            }))
            .catch((error) => console.log(error))
            .finally(() => setTimeout(() => {
                // Stop spinning after (2 secs of) the redirect, in case the user goes back (cancel login).
                // On Chrome this is not necessary, since when going back the entire page is reloaded, but on Safari
                // it's not (except dev tools open).
                onWaitingStateLoad(false);
                setStatus(SignInStatus.signedOut)
            }, 2000));
    };
    const logoutHandler = () => {
        logout({
            localOnly: true // skips the request to the logout endpoint on the authorization server, and the redirect.
        });
        AuthStorage.instance.save(new TKAuthResponse());
        setStatus(SignInStatus.signedOut);  // Not necessary given the logout call will trigger the first useEffect.
        finishInitLoadingPromise = Promise.resolve(SignInStatus.signedOut);
        setUserToken(undefined);
        setUserAccount(undefined);
    };
    if (!finishInitLoadingPromise) {
        finishInitLoadingPromise = initStatus === SignInStatus.signedOut ? Promise.resolve(SignInStatus.signedOut) :
            new Promise(resolve => {
                finishInitLoadingResolver = resolve;
            });
    }
    useEffect(() => {
        onUserProfileChange(userProfile => Util.iAssign(userProfile, { finishSignInStatusP: finishInitLoadingPromise }));
    }, [finishInitLoadingPromise]);
    useEffect(() => {
        if (status !== SignInStatus.loading) {
            finishInitLoadingResolver?.(status);
        }
    }, [status]);
    const resetUserToken = () => {
        if (TripGoApi.userToken) {
            TripGoApi.userToken = undefined;
            AuthStorage.instance.save(new TKAuthResponse);
            setUserToken(undefined);
            setUserAccount(undefined);
            setStatus(SignInStatus.loading);
            finishInitLoadingPromise = new Promise(resolve => {
                finishInitLoadingResolver = resolve;
            });
            onUserProfileChange(userProfile => Util.iAssign(userProfile, { finishSignInStatusP: finishInitLoadingPromise }));
            getAccessTokenSilently()
                .then(requestUserTokenFc)
                .then((result: TKAuthResponse) => {
                    AuthStorage.instance.save(result);
                    setUserToken(result.userToken);
                })
                .catch((error) => {
                    console.log(error);
                    setStatus(SignInStatus.signedOut);
                });
        }
    }
    TripGoApi.resetUserToken = resetUserToken;
    return (
        <>
            {props.children({
                status: status,
                userAccount,
                login,
                logout: logoutHandler,
                accountsSupported: true,
                finishInitLoadingPromise,
                resetUserToken,
                refreshUserProfile
            })}
        </>
    );
};

interface IProps {
    auth0Domain: string;
    auth0ClientId: string;
    exclusiveModes?: boolean;
    requestUserToken?: (auth0AccessToken: string) => Promise<TKAuthResponse>;
    requestUserProfile?: (auth0user: Auth0User) => Promise<TKUserAccount>;
    children: React.ReactNode;
}

const TKAccountProvider: React.FunctionComponent<IProps> = (props: IProps) => {
    const { requestUserProfile, requestUserToken } = props;
    const [returnToAfterLogin, setReturnToAfterLogin] = useState<string | undefined>(undefined);
    const onRedirectCallback = (appState) => {
        const returnTo = appState?.returnTo;
        if (returnTo) {
            setReturnToAfterLogin(returnTo);
        }
    };
    const { onUserProfileChange } = useContext(OptionsContext);
    useEffect(() => {
        props.exclusiveModes && onUserProfileChange(userProfile => Util.iAssign(userProfile, { exclusiveModes: true }));
    }, []);
    return (
        <Auth0Provider
            domain={props.auth0Domain}
            clientId={props.auth0ClientId}
            redirectUri={window.location.origin}
            // audience="https://tripgo.au.auth0.com/api/v2/"
            // scope="openid profile"
            onRedirectCallback={onRedirectCallback}
        >
            <Auth0ToTKAccount requestUserToken={requestUserToken} requestUserProfile={requestUserProfile}>
                {(context: IAccountContext) =>
                    <TKAccountContext.Provider
                        value={{ ...context, returnToAfterLogin }}>
                        {props.children}
                    </TKAccountContext.Provider>}
            </Auth0ToTKAccount>
        </Auth0Provider>
    )
};

export default TKAccountProvider;