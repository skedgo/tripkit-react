import React from "react";
import TKUserAccount from "./TKUserAccount";

export enum SignInStatus {
    signedIn, signedOut, loading
}

export type LoginResult = { signInStep: 'CONFIRM_SIGN_IN_WITH_EMAIL_CODE' | 'CONFIRM_SIGN_IN_WITH_SMS_CODE', destination: string } | void;

export interface IAccountContext {
    status: SignInStatus;
    userAccount?: TKUserAccount;
    userToken?: string;
    onUserChange?: (account: TKUserAccount) => Promise<TKUserAccount>;
    getUserAccountRef: () => TKUserAccount | undefined;
    returnToAfterLogin?: string;
    login: (props?: { user: string, password: string }) => Promise<LoginResult>;
    confirmLogin(props?: { code: string, remember?: boolean }): Promise<void>;
    logout: () => void;
    finishInitLoadingPromise: Promise<SignInStatus.signedIn | SignInStatus.signedOut>;
    accountsSupported?: boolean;
    resetUserToken: () => void;
    refreshUserProfile: () => Promise<TKUserAccount>;
}

export const TKAccountContext = React.createContext<IAccountContext>({
    status: SignInStatus.loading,
    login: () => Promise.resolve(),
    confirmLogin: () => Promise.resolve(),
    logout: () => { },
    getUserAccountRef: () => undefined,
    finishInitLoadingPromise: Promise.resolve(SignInStatus.signedOut),
    resetUserToken: () => { },
    refreshUserProfile: () => Promise.resolve(new TKUserAccount())
});

const statusChangeListeners: Set<(status: SignInStatus) => void> = new Set();

export const staticAccountContext: { value: IAccountContext, isSignedInP: () => Promise<boolean>, addStatusChangeListener: (listener: (status: SignInStatus) => void) => { remove: () => void }, notifyStatusChange: (status: SignInStatus) => void } = {
    value: {
        status: SignInStatus.loading,
        login: () => Promise.resolve(),
        confirmLogin: () => Promise.resolve(),
        logout: () => { },
        getUserAccountRef: () => undefined,
        finishInitLoadingPromise: Promise.resolve(SignInStatus.signedOut),
        resetUserToken: () => { },
        refreshUserProfile: () => Promise.resolve(new TKUserAccount())
    },
    isSignedInP: () => {
        return new Promise<boolean>((resolve) => {
            if (!staticAccountContext.value.accountsSupported) {
                resolve(false);
                return;
            }
            if (staticAccountContext.value.status !== SignInStatus.loading) {
                resolve(staticAccountContext.value.status === SignInStatus.signedIn);
                return;
            }
            const registration = staticAccountContext.addStatusChangeListener((status) => {
                resolve(status === SignInStatus.signedIn);
                registration.remove();
            });
        });
    },
    addStatusChangeListener: (listener: (status: SignInStatus) => void) => {
        statusChangeListeners.add(listener);
        const registration = { remove: () => statusChangeListeners.delete(listener) };
        return registration
    },
    notifyStatusChange: (status: SignInStatus) => {
        statusChangeListeners.forEach(listener => listener(status));
    }
};
