import React from "react";
import TKUserAccount from "./TKUserAccount";

export enum SignInStatus {
    signedIn, signedOut, loading
}

export interface IAccountContext {
    status: SignInStatus;
    userAccount?: TKUserAccount;
    returnToAfterLogin?: string;
    login: (props?: { user: string, password: string }) => Promise<void>;
    logout: () => void;
    finishInitLoadingPromise: Promise<SignInStatus.signedIn | SignInStatus.signedOut>;
    accountsSupported?: boolean;
    resetUserToken: () => void;
    refreshUserProfile: () => Promise<TKUserAccount>;
}

export const TKAccountContext = React.createContext<IAccountContext>({
    status: SignInStatus.loading,
    login: () => Promise.resolve(),
    logout: () => { },
    finishInitLoadingPromise: Promise.resolve(SignInStatus.signedOut),
    resetUserToken: () => { },
    refreshUserProfile: () => Promise.resolve(new TKUserAccount())
});