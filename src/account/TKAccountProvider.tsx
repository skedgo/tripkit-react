import React, { useState, useEffect, useRef, useContext } from 'react';
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import TripGoApi from "../api/TripGoApi";
import TKAuth0AuthResponse from "./TKAuth0AuthResponse";
import TKUserAccount from "./TKUserAccount";
import LocalStorageItem from "../data/LocalStorageItem";
import { RoutingResultsContext } from "../trip-planner/RoutingResultsProvider";
import { IAccountContext, SignInStatus, TKAccountContext } from "./TKAccountContext";
import Util from '../util/Util';
import { OptionsContext } from '../options/OptionsProvider';

class AuthStorage extends LocalStorageItem<TKAuth0AuthResponse> {
    private static _instance: AuthStorage;

    public static get instance(): AuthStorage {
        if (!this._instance) {
            this._instance = new AuthStorage(TKAuth0AuthResponse, "AUTH");
        }
        return this._instance;
    }
}

function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}

// Doing this with useState have problems when component is re-constructed.
let finishInitLoadingPromise: Promise<SignInStatus.signedIn | SignInStatus.signedOut>;
let finishInitLoadingResolver: (value: SignInStatus.signedIn | SignInStatus.signedOut) => void;

const Auth0ToTKAccount: React.FunctionComponent<{ children: (context: IAccountContext) => React.ReactNode, withPopup?: boolean }> = (props) => {
    const { loginWithRedirect, loginWithPopup, logout, getAccessTokenSilently, isLoading, isAuthenticated, user } = useAuth0();
    const [userToken, setUserToken] = useState<string | undefined>(AuthStorage.instance.get().userToken);
    const initStatus = (isLoading || isAuthenticated || userToken) ? SignInStatus.loading :
        SignInStatus.signedOut;
    const [status, setStatus] = useState<SignInStatus>(initStatus);
    const [userAccount, setUserAccount] = useState<TKUserAccount | undefined>(undefined);
    const prevIsLoading = usePrevious(isLoading);
    const prevIsAuthenticated = usePrevious(isAuthenticated);
    const { onWaitingStateLoad } = useContext(RoutingResultsContext);
    const { userProfile, onUserProfileChange } = useContext(OptionsContext);
    const requestUserToken = (auth0AccessToken: string) => {
        TripGoApi.apiCallT("/data/user/auth/auth0/" + auth0AccessToken, "POST", TKAuth0AuthResponse)
            .then((result: TKAuth0AuthResponse) => {
                AuthStorage.instance.save(result);
                setUserToken(result.userToken);
            })
            .catch((error) => {
                console.log(error);
                setStatus(SignInStatus.signedOut)
            });
    };
    useEffect(() => {
        // Authenticated in Auth0 but not on our BE (no userToken), e.g. when returning from loginWithRedirect or
        // on login pupup closed, so login to our BE.
        if (isAuthenticated !== prevIsAuthenticated && isAuthenticated && !AuthStorage.instance.get().userToken) {
            getAccessTokenSilently()
                .then(requestUserToken)
                .catch((error) => console.log(error));
        }
        if (!isLoading && !isAuthenticated && (isLoading !== prevIsLoading || prevIsAuthenticated !== isAuthenticated)) {
            setStatus(SignInStatus.signedOut)
        }
    });
    useEffect(() => {
        // Set userToken to be used by SDK
        TripGoApi.userToken = userToken;
        // Request user profile
        if (userToken) {
            TripGoApi.apiCallT("/data/user/", "GET", TKUserAccount)
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
    }, [userToken]);
    const login = () => {
        setStatus(SignInStatus.loading);
        if (!props.withPopup) { // Blocking spinner, just if login with redirect.
            onWaitingStateLoad(true);
        }
        // prompt 'login' to always show login dialog to user if logged out.
        (props.withPopup ? loginWithPopup({ prompt: 'login' }, { timeoutInSeconds: 600 }) :
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
        AuthStorage.instance.save(new TKAuth0AuthResponse);
        setStatus(SignInStatus.signedOut);  // Not necessary given the logout call will trigger the first useEffect.
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
        onUserProfileChange(Util.iAssign(userProfile, { finishSignInStatusP: finishInitLoadingPromise }));
    }, [finishInitLoadingPromise]);
    useEffect(() => {
        console.log(status);
        if (status !== SignInStatus.loading) {
            finishInitLoadingResolver?.(status);
        }
    }, [status]);
    return (
        <React.Fragment>
            {props.children({
                status: status,
                userAccount,
                login,
                logout: logoutHandler,
                accountsSupported: true,
                finishInitLoadingPromise
            })}
        </React.Fragment>
    );
};

interface IProps {
    auth0Domain: string;
    auth0ClientId: string;
    children: ((account: IAccountContext) => React.ReactNode) | React.ReactNode;
}

const TKAccountProvider: React.FunctionComponent<IProps> = (props: IProps) => {
    const [returnToAfterLogin, setReturnToAfterLogin] = useState<string | undefined>(undefined);
    const onRedirectCallback = (appState) => {
        const returnTo = appState?.returnTo;
        if (returnTo) {
            setReturnToAfterLogin(returnTo);
        }
    };
    return (
        <Auth0Provider
            domain={props.auth0Domain}
            clientId={props.auth0ClientId}
            redirectUri={window.location.origin}
            // audience="https://tripgo.au.auth0.com/api/v2/"
            // scope="openid profile"
            onRedirectCallback={onRedirectCallback}
        >
            <Auth0ToTKAccount>
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