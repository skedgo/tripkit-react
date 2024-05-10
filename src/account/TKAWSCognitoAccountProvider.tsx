import React, { useState, useEffect, useContext } from 'react';
import { User as Auth0User, useAuth0 } from "@auth0/auth0-react";
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

// Doing this with useState have problems when component is re-constructed.
let finishInitLoadingPromise: Promise<SignInStatus.signedIn | SignInStatus.signedOut>;
let finishInitLoadingResolver: (value: SignInStatus.signedIn | SignInStatus.signedOut) => void;

const AWSCognitoToTKAccount: React.FunctionComponent<{
    clientId: string;
    domain: string;
    redirectURI: string;
    scopes: string;
    requestUserToken?: (auth0AccessToken: string) => Promise<TKAuth0AuthResponse>;
    requestUserProfile?: (auth0user: Auth0User) => Promise<TKUserAccount>;
    children: (context: IAccountContext) => React.ReactNode,
    withPopup?: boolean
}> = (props) => {
    const { clientId, domain, redirectURI, scopes, requestUserToken, requestUserProfile, withPopup } = props;
    const awsCognitoAccessToken = new URLSearchParams(window.location.hash.substring(1)).get('access_token');
    const [userToken, setUserToken] = useState<string | undefined>(AuthStorage.instance.get().userToken);
    const initStatus = userToken ? SignInStatus.signedIn : awsCognitoAccessToken ? SignInStatus.loading : SignInStatus.signedOut;
    const [status, setStatus] = useState<SignInStatus>(initStatus);
    const [userAccount, setUserAccount] = useState<TKUserAccount | undefined>(undefined);
    const { onWaitingStateLoad } = useContext(RoutingResultsContext);
    const { onUserProfileChange } = useContext(OptionsContext);
    const requestUserTokenFc = requestUserToken ?? ((cognitoAccessToken: string) =>
        TripGoApi.apiCallT("/data/user/auth/cognito/" + cognitoAccessToken, "POST", TKAuth0AuthResponse));
    const requestUserProfileFc: ((auth0user: Auth0User) => Promise<TKUserAccount>) = requestUserProfile ?? (() =>
        TripGoApi.apiCallT("/data/user/", "GET", TKUserAccount));
    useEffect(() => {
        // Authenticated in Auth0 but not on our BE (no userToken), e.g. when returning from loginWithRedirect or
        // on login pupup closed, so login to our BE.
        if (awsCognitoAccessToken && !userToken) {
            requestUserTokenFc(awsCognitoAccessToken)
                .then((result: TKAuth0AuthResponse) => {
                    AuthStorage.instance.save(result);
                    setUserToken(result.userToken);
                })
                .catch((error) => {
                    console.log(error);
                    setStatus(SignInStatus.signedOut);
                });
        }
    }, [awsCognitoAccessToken, userToken]);
    function refreshUserProfile(): Promise<TKUserAccount> {
        if (userToken) {
            return requestUserProfileFc({})
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
        // Request user profile
        if (userToken) {
            requestUserProfileFc({})
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
        onWaitingStateLoad(true);
        const searchParams = new URLSearchParams({
            client_id: clientId,
            response_type: 'token',
            scope: scopes,
            redirect_uri: redirectURI,
        });
        const loginUrl = `https://${domain}/oauth2/authorize?${searchParams.toString()}`;
        window.location.href = loginUrl;
    };
    const logoutHandler = () => {
        // logout({
        //     localOnly: true // skips the request to the logout endpoint on the authorization server, and the redirect.
        // });
        AuthStorage.instance.save(new TKAuth0AuthResponse());
        setStatus(SignInStatus.signedOut);  // Not necessary given the logout call will trigger the first useEffect.
        finishInitLoadingPromise = Promise.resolve(SignInStatus.signedOut);
        setUserToken(undefined);
        setUserAccount(undefined);
    };
    // if (!finishInitLoadingPromise) {
    //     finishInitLoadingPromise = initStatus === SignInStatus.signedOut ? Promise.resolve(SignInStatus.signedOut) :
    //         new Promise(resolve => {
    //             finishInitLoadingResolver = resolve;
    //         });
    // }
    // useEffect(() => {
    //     onUserProfileChange(userProfile => Util.iAssign(userProfile, { finishSignInStatusP: finishInitLoadingPromise }));
    // }, [finishInitLoadingPromise]);
    // useEffect(() => {
    //     if (status !== SignInStatus.loading) {
    //         finishInitLoadingResolver?.(status);
    //     }
    // }, [status]);
    const resetUserToken = () => {
        if (TripGoApi.userToken) {
            TripGoApi.userToken = undefined;
            AuthStorage.instance.save(new TKAuth0AuthResponse());
            setUserToken(undefined);
            setUserAccount(undefined);
            setStatus(SignInStatus.loading);
            finishInitLoadingPromise = new Promise(resolve => {
                finishInitLoadingResolver = resolve;
            });
            onUserProfileChange(userProfile => Util.iAssign(userProfile, { finishSignInStatusP: finishInitLoadingPromise }));
            // getAccessTokenSilently()
            //     .then(requestUserTokenFc)
            //     .then((result: TKAuth0AuthResponse) => {
            //         AuthStorage.instance.save(result);
            //         setUserToken(result.userToken);
            //     })
            //     .catch((error) => {
            //         console.log(error);
            //         setStatus(SignInStatus.signedOut);
            //     });
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
    clientId: string;
    domain: string;
    redirectURI: string;
    scopes: string;

    // exclusiveModes?: boolean;
    requestUserToken?: (auth0AccessToken: string) => Promise<TKAuth0AuthResponse>;
    requestUserProfile?: (auth0user: Auth0User) => Promise<TKUserAccount>;
    children: ((account: IAccountContext) => React.ReactNode) | React.ReactNode;
}

const TKAWSCognitoAccountProvider: React.FunctionComponent<IProps> = (props: IProps) => {
    const { children, ...restProps } = props;
    const [returnToAfterLogin, setReturnToAfterLogin] = useState<string | undefined>(undefined);
    // const onRedirectCallback = (appState) => {
    //     const returnTo = appState?.returnTo;
    //     if (returnTo) {
    //         setReturnToAfterLogin(returnTo);
    //     }
    // };
    // const { onUserProfileChange } = useContext(OptionsContext);
    // useEffect(() => {
    //     props.exclusiveModes && onUserProfileChange(userProfile => Util.iAssign(userProfile, { exclusiveModes: true }));
    // }, []);
    return (
        <AWSCognitoToTKAccount {...restProps}>
            {(context: IAccountContext) =>
                <TKAccountContext.Provider
                    value={{ ...context, returnToAfterLogin }}>
                    {children}
                </TKAccountContext.Provider>}
        </AWSCognitoToTKAccount>
    )
};

export default TKAWSCognitoAccountProvider;