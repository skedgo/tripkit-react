import React, { useState, useEffect, useContext, useMemo } from 'react';
import { User as Auth0User } from "@auth0/auth0-react";
import TripGoApi from "../api/TripGoApi";
import TKAuthResponse from "./TKAuthResponse";
import TKUserAccount from "./TKUserAccount";
import LocalStorageItem from "../data/LocalStorageItem";
import { RoutingResultsContext } from "../trip-planner/RoutingResultsProvider";
import { IAccountContext, LoginResult, SignInStatus, staticAccountContext, TKAccountContext } from "./TKAccountContext";
import { Amplify, ResourcesConfig } from 'aws-amplify';
import { signIn, SignInInput, fetchUserAttributes, FetchUserAttributesOutput, fetchAuthSession, signInWithRedirect, signOut, SignOutInput, confirmSignIn, SignInOutput, rememberDevice } from 'aws-amplify/auth';
import UIUtil from '../util/UIUtil';

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

export async function getUserAttributes(): Promise<FetchUserAttributesOutput> {
    const attributes = await fetchUserAttributes();
    console.log(attributes);
    return attributes;
}

interface AuthTokens {
    accessToken: string;
    idToken?: string;
    refreshToken?: string;
}

function useAWSCognito(amplifyConfig: ResourcesConfig): { isLoading: boolean, isAuthenticated: boolean, authTokens: AuthTokens | undefined, loginWithUserPass: (input: SignInInput) => Promise<SignInOutput>, confirmLoginWithUserPass: (input: { challengeResponse: string, remember?: boolean }) => Promise<void>, loginWithRedirect: () => void, logout: (input?: SignOutInput) => Promise<void> } {
    const [isLoading, setIsLoading] = useState(true);
    const [authTokens, setAuthTokens] = useState<AuthTokens | undefined>(undefined);
    const isAuthenticated = !!authTokens;

    /**
     * External web login - Hosted UI flow.
     */

    async function loginWithRedirect() {
        setIsLoading(true);
        const defaultIdentityProvider = amplifyConfig.Auth?.Cognito?.loginWith?.oauth?.providers?.[0];
        await signInWithRedirect(defaultIdentityProvider ? { provider: defaultIdentityProvider } : undefined);
        return await fetchSession();
    };

    /**
     * In app login - User and password are collected in the app.     
     */
    async function loginWithUserPass({ username, password }: SignInInput): Promise<SignInOutput> {
        try {
            const signInResult = await signIn({ username, password });
            const { isSignedIn, nextStep } = signInResult;
            if (isSignedIn) {
                await fetchSession();
                return signInResult;
            } else if (nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_EMAIL_CODE') {
                return signInResult;
            }
            throw new Error("Unsupported sign in step " + nextStep.signInStep);
        } finally {
            // Notice the finally block will be executed even if returning with return signInResult.
            setIsLoading(false);
        }
    }

    async function confirmLoginWithUserPass({ challengeResponse, remember }: { challengeResponse: string, remember?: boolean }): Promise<void> {
        try {
            const { isSignedIn, nextStep } = await confirmSignIn({ challengeResponse });
            console.log('isSignedIn', isSignedIn);
            console.log('nextStep', nextStep);
            if (isSignedIn) {
                console.log('signed in');
                // Remember this device to skip MFA next time
                if (remember) {
                    await rememberDevice();
                }
                return await fetchSession();
            }
        } finally {
            setIsLoading(false);
        }
    }

    async function fetchSession(): Promise<void> {
        try {
            const session = await fetchAuthSession()
            const accessToken = session.tokens?.accessToken.toString();
            const idToken = session.tokens?.idToken?.toString();
            // Need to get the refresh token from LS since, as per amplify v6 docs ([here](https://docs.amplify.aws/gen1/javascript/build-a-backend/auth/auth-migration-guide/#authcurrentsession)),
            // it is not returned in the session anymore.
            let refreshToken: string | undefined;
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key?.startsWith("CognitoIdentityServiceProvider") && key.endsWith(".refreshToken")) {
                    refreshToken = localStorage.getItem(key) ?? undefined;
                    break;
                }
            }
            setAuthTokens(accessToken ? { accessToken: accessToken, idToken, refreshToken } : undefined);
        } finally {
            setIsLoading(false);
        }
    }

    function logout(): Promise<void> {
        setAuthTokens(undefined);
        return signOut();
    }

    useEffect(() => {
        if (!authTokens) {
            fetchSession();
        }
    }, []);
    return { isLoading, isAuthenticated, authTokens, loginWithUserPass, confirmLoginWithUserPass, loginWithRedirect, logout };
}

const AWSCognitoToTKAccount: React.FunctionComponent<{
    amplifyConfig: ResourcesConfig;
    requestUserToken?: (input: RequestUserTokenInput) => Promise<TKAuthResponse>;
    requestUserProfile?: (auth0user: Auth0User) => Promise<TKUserAccount>;
    children: (context: IAccountContext) => React.ReactNode,
    withPopup?: boolean
}> = (props) => {
    const { amplifyConfig, requestUserToken, requestUserProfile, withPopup } = props;
    useMemo(() => Amplify.configure(amplifyConfig), []);

    const { isLoading, isAuthenticated, authTokens, loginWithUserPass, confirmLoginWithUserPass, loginWithRedirect, logout } = useAWSCognito(amplifyConfig);
    const [userToken, setUserToken] = useState<string | undefined>(AuthStorage.instance.get().userToken);
    // const [userToken, setUserToken] = useState<string | undefined>(undefined);  // FOR testing
    const initStatus = (isLoading || isAuthenticated) ? SignInStatus.loading : SignInStatus.signedOut;
    const [status, setStatus] = useState<SignInStatus>(initStatus);
    const [userAccount, setUserAccount] = useState<TKUserAccount | undefined>(undefined);
    // TODO: this won't work anymore since TKAccountContext.Provider is not below TKRoot anymore.
    // Indicate waiting other way, or provide a method setWaitingStateLoadHandler that RoutingResultsProviders sets.
    const { onWaitingStateLoad } = useContext(RoutingResultsContext);
    const requestUserTokenFc = requestUserToken ?? (({ accessToken }) =>
        TripGoApi.apiCallT("/data/user/auth/cognito/" + accessToken, "POST", TKAuthResponse));
    const requestUserProfileFc: ((auth0user: Auth0User) => Promise<TKUserAccount>) = requestUserProfile ?? (() =>
        TripGoApi.apiCallT("/data/user/", "GET", TKUserAccount));
    useEffect(() => {
        // Not Authenticated in Cognito, so cleanup our token + set status to SignInStatus.signedOut.
        if (!isLoading && !isAuthenticated) {
            AuthStorage.instance.save(new TKAuthResponse());
            setStatus(SignInStatus.signedOut);
            setUserToken(undefined);
            setUserAccount(undefined);
        }
    }, [isLoading, isAuthenticated]);
    useEffect(() => {
        // Authenticated in Cognito but not on our BE (no userToken), so login to our BE.        
        if (authTokens && !userToken) { // Maybe group in a single object / filed *tokens*
            requestUserTokenFc({ ...authTokens, fetchUserAttributes })
                .then((result: TKAuthResponse) => {
                    AuthStorage.instance.save(result);
                    setUserToken(result.userToken);
                })
                .catch((error) => {
                    console.log(error);
                    UIUtil.errorMsg(error, { onClose: () => logoutHandler() });
                });
        }
    }, [authTokens, userToken]);
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
    async function onUserChange(update: TKUserAccount): Promise<TKUserAccount> {
        setUserAccount(update);
        const updateResult = await TripGoApi.apiCallT<TKUserAccount>("/data/user/", "PUT", TKUserAccount, update);
        setUserAccount(updateResult);
        return updateResult;
    }
    useEffect(() => {
        // Set userToken to be used by SDK
        TripGoApi.userToken = userToken;
        // Request user profile
        if (userToken && !isLoading && isAuthenticated) {
            requestUserProfileFc({})
                .then((result) => {
                    setUserAccount(result);
                    setStatus(SignInStatus.signedIn);
                })
                .catch((error) => {
                    // E.g. {"usererror":true,"errorCode":447,"title":"Invalid userToken","error":"You need to sign in first"}
                    console.log(error);
                    UIUtil.errorMsg(error);
                    logoutHandler();
                });
        }
    }, [userToken, isLoading]);

    // async function handleFetchUserAttributes() {
    //     try {
    //         const userAttributes = await fetchUserAttributes();
    //         console.log(userAttributes);
    //         userAttributes.sub && requestUserTokenFc(userAttributes.sub)
    //             .then((result: TKAuthResponse) => {
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

    useEffect(() => {
        staticAccountContext.notifyStatusChange(status);
    }, [status]);

    const logoutHandler = () => {
        logout();
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
        if (status !== SignInStatus.loading) {
            finishInitLoadingResolver?.(status);
        }
    }, [status]);
    const resetUserToken = () => {
        if (TripGoApi.userToken) {
            TripGoApi.userToken = undefined;
            AuthStorage.instance.save(new TKAuthResponse());
            setUserToken(undefined);
            setUserAccount(undefined);
            setStatus(SignInStatus.loading);
            finishInitLoadingPromise = new Promise(resolve => {
                finishInitLoadingResolver = resolve;
            });
            // getAccessTokenSilently()
            //     .then(requestUserTokenFc)
            //     .then((result: TKAuthResponse) => {
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
    async function login(props?: { user: string, password: string }): Promise<LoginResult> {
        setStatus(SignInStatus.loading);
        if (props) {
            try {
                const { nextStep } = await loginWithUserPass({ username: props.user, password: props.password });
                const { signInStep } = nextStep;
                if (signInStep === 'CONFIRM_SIGN_IN_WITH_EMAIL_CODE' && nextStep.codeDeliveryDetails?.destination) {
                    return { signInStep, destination: nextStep.codeDeliveryDetails.destination };
                }
                // Otherwise, it successfully signed in, so we return void.
            } catch (error) {
                setStatus(SignInStatus.signedOut);
                throw error;
            }
        } else {
            loginWithRedirect();
            onWaitingStateLoad(true);    // Just if login with redirect.
            return Promise.resolve();
        }
    };

    async function confirmLogin({ code, remember = false }: { code: string, remember?: boolean }): Promise<void> {
        try {
            return await confirmLoginWithUserPass({ challengeResponse: code, remember });
        } catch (error) {
            setStatus(SignInStatus.signedOut);
            throw error;
        }
    }

    (window as any).loginWithRedirect = loginWithRedirect;

    return (
        <>
            {props.children({
                status: status,
                userAccount,
                userToken,
                onUserChange,
                login,
                confirmLogin,
                logout: logoutHandler,
                accountsSupported: true,
                finishInitLoadingPromise,
                resetUserToken,
                refreshUserProfile
            })}
        </>
    );
};

export interface RequestUserTokenInput extends AuthTokens {
    fetchUserAttributes: () => Promise<FetchUserAttributesOutput>;
}

interface IProps {
    amplifyConfig: ResourcesConfig;
    // exclusiveModes?: boolean;
    requestUserToken?: (input: RequestUserTokenInput) => Promise<TKAuthResponse>;
    requestUserProfile?: (auth0user: Auth0User) => Promise<TKUserAccount>;
    children: React.ReactNode;
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
            {(context: IAccountContext) => {
                staticAccountContext.value = { ...context, returnToAfterLogin };
                return (
                    <TKAccountContext.Provider
                        value={{ ...context, returnToAfterLogin }}>
                        {children}
                    </TKAccountContext.Provider>
                );
            }}
        </AWSCognitoToTKAccount>
    )
};

export default TKAWSCognitoAccountProvider;
export type AWSAmplifyConfig = ResourcesConfig;