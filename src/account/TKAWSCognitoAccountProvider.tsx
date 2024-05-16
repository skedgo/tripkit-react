import React, { useState, useEffect, useContext, useMemo } from 'react';
import { User as Auth0User } from "@auth0/auth0-react";
import TripGoApi from "../api/TripGoApi";
import TKAuth0AuthResponse from "./TKAuth0AuthResponse";
import TKUserAccount from "./TKUserAccount";
import LocalStorageItem from "../data/LocalStorageItem";
import { RoutingResultsContext } from "../trip-planner/RoutingResultsProvider";
import { IAccountContext, SignInStatus, TKAccountContext } from "./TKAccountContext";
import Util from '../util/Util';
import { OptionsContext } from '../options/OptionsProvider';
import { Amplify, ResourcesConfig } from 'aws-amplify';
import { signIn, SignInInput, fetchUserAttributes, getCurrentUser, fetchAuthSession, signInWithRedirect } from '@aws-amplify/auth';
// import { signIn, type SignInInput } from '@aws-amplify/auth';

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

async function handleFetchUserAttributes() {
    try {
        const attributes = await fetchUserAttributes()
        console.log(attributes);
    } catch (error) {
        console.log(error);
    }
}

function useAWSCognito(): { isLoading: boolean, isAuthenticated: boolean, accessToken: string | undefined, loginDA: (input: SignInInput) => void, loginWithRedirect: () => void } {
    const [isLoading, setIsLoading] = useState(true);
    const [accessToken, setAccessToken] = useState<string | undefined>(undefined);
    const isAuthenticated = !!accessToken;

    async function loginWithRedirect() {
        setIsLoading(true);
        await signInWithRedirect();
        fetchSession();
    };

    async function loginDA({ username, password }: SignInInput): Promise<void> {
        try {
            const { isSignedIn, nextStep } = await signIn({ username, password });
            console.log('isSignedIn', isSignedIn);
            console.log('nextStep', nextStep);
            if (nextStep.signInStep === 'DONE') {
                console.log('signed in');
                return await fetchSession();
            }
        } catch (error) {
            console.log('error signing in', error);
        } finally {
            setIsLoading(false);
        }
    }

    async function fetchSession() {
        try {
            const session = await fetchAuthSession()
            setAccessToken(session.tokens?.accessToken.toString());
            console.log(session);
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (!accessToken) {
            fetchSession();
        }
    }, []);
    return { isLoading, isAuthenticated, accessToken, loginDA, loginWithRedirect };
}

const AWSCognitoToTKAccount: React.FunctionComponent<{
    amplifyConfig: ResourcesConfig;
    requestUserToken?: (auth0AccessToken: string) => Promise<TKAuth0AuthResponse>;
    requestUserProfile?: (auth0user: Auth0User) => Promise<TKUserAccount>;
    children: (context: IAccountContext) => React.ReactNode,
    withPopup?: boolean
}> = (props) => {
    const { amplifyConfig, requestUserToken, requestUserProfile, withPopup } = props;
    useMemo(() => Amplify.configure(amplifyConfig), []);

    const { isLoading: isLoadingDA, isAuthenticated, accessToken: accessTokenDA, loginDA, loginWithRedirect } = useAWSCognito();
    const [userToken, setUserToken] = useState<string | undefined>(AuthStorage.instance.get().userToken);
    const initStatus = userToken ? SignInStatus.signedIn : SignInStatus.loading;
    const [status, setStatus] = useState<SignInStatus>(initStatus);
    const [userAccount, setUserAccount] = useState<TKUserAccount | undefined>(undefined);
    const { onWaitingStateLoad } = useContext(RoutingResultsContext);
    const { onUserProfileChange } = useContext(OptionsContext);
    const requestUserTokenFc = requestUserToken ?? ((cognitoAccessToken: string) =>
        TripGoApi.apiCallT("/data/user/auth/cognito/" + cognitoAccessToken, "POST", TKAuth0AuthResponse));
    const requestUserProfileFc: ((auth0user: Auth0User) => Promise<TKUserAccount>) = requestUserProfile ?? (() =>
        TripGoApi.apiCallT("/data/user/", "GET", TKUserAccount));
    useEffect(() => {
        if (!isLoadingDA && !accessTokenDA) {
            setStatus(SignInStatus.signedOut);
        }
    }, [isLoadingDA]);
    useEffect(() => {
        // Authenticated in Cognito but not on our BE (no userToken), so login to our BE.
        if (accessTokenDA && !userToken) {
            requestUserTokenFc(accessTokenDA!)
                .then((result: TKAuth0AuthResponse) => {
                    AuthStorage.instance.save(result);
                    setUserToken(result.userToken);
                })
                .catch((error) => {
                    console.log(error);
                    setStatus(SignInStatus.signedOut);
                });
        }
    }, [accessTokenDA, userToken]);
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

    // async function handleFetchUserAttributes() {
    //     try {
    //         const userAttributes = await fetchUserAttributes();
    //         console.log(userAttributes);
    //         userAttributes.sub && requestUserTokenFc(userAttributes.sub)
    //             .then((result: TKAuth0AuthResponse) => {
    //                 AuthStorage.instance.save(result);
    //                 setUserToken(result.userToken);
    //             })
    //             .catch((error) => {
    //                 console.log(error);
    //                 setStatus(SignInStatus.signedOut);
    //             });
    //     } catch (error) {
    //         console.log(error);
    //     }
    // }

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
    function login() {
        setStatus(SignInStatus.loading);
        // onWaitingStateLoad(true);    // Just if login with redirect.
        loginDA({ username: "mauro", password: "hit me.." });
    };

    (window as any).loginWithRedirect = loginWithRedirect;

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
    amplifyConfig: ResourcesConfig;
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
export type AWSAmplifyConfig = ResourcesConfig;