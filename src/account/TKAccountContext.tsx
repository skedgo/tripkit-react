import React from "react";
import TKUserAccount from "./TKUserAccount";

export enum SignInStatus {
    signedIn, signedOut, loading
}

export interface IAccountContext {
    status: SignInStatus;
    userAccount?: TKUserAccount;
    returnToAfterLogin?: string;
    login: () => void;
    logout: () => void;
}

export const TKAccountContext = React.createContext<IAccountContext>({
    status: SignInStatus.loading,
    login: () => {},
    logout: () => {}
});