import React from "react";
export declare type TKI18nMessages = {
    [key: string]: string;
};
export declare type TranslationFunction = (
/** The key of the phrase to translate. */
phrase: string, 
/** The options accepted by `polyglot.t`. */
options?: any) => string;
export interface TKI18nContextProps {
    locale: string;
    t: TranslationFunction;
}
export declare const TKI18nContext: React.Context<TKI18nContextProps>;
interface IProps {
    dataPromise?: Promise<{
        locale: string;
        translations: TKI18nMessages;
    }>;
}
interface IState {
    locale: string;
    messages: TKI18nMessages;
}
declare class TKI18nProvider extends React.Component<IProps, IState> {
    constructor(props: IProps);
    render(): React.ReactNode;
    componentDidMount(): void;
}
export default TKI18nProvider;
