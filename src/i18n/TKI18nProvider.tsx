import React, { ReactNode } from "react";
import { I18n, translate } from '../ext_lib/react-polyglot/src/index';
import Environment from "../env/Environment";
import messages_en from "./i18n_en.json";
import untranslated from "./untranslated.json";
import { i18n } from "./TKI18nConstants";

export type I18nKeys = keyof typeof messages_en | keyof typeof untranslated;

export type TKI18nMessages = Record<I18nKeys, string>;

export type TranslationFunction = (
    /** The key of the phrase to translate. */
    phrase: I18nKeys,
    /** The options accepted by `polyglot.t`. */
    options?: any
) => string

export interface TKI18nContextProps {
    locale: string;
    t: TranslationFunction;
    // So components can know i18n promise resolved and transaltions were overridden, and
    // explicitly update string that are not (re)translated on (re)render (e.g. those translations
    // performed on component construction).
    i18nOverridden: boolean;
}

export const TKI18nContext = React.createContext<TKI18nContextProps>({
    t: (key: string, params?: any) => "",
    locale: 'en',
    i18nOverridden: false
});

const WithTranslate = translate()(
    (props: { t: TranslationFunction, children: any }) => {
        i18n.t = props.t;
        return props.children({ t: props.t });
    }
);

interface IProps {
    dataPromise?: { locale: string, translations: Partial<TKI18nMessages> } | Promise<{ locale: string, translations: Partial<TKI18nMessages> }>;
    children?: ReactNode;
}

interface IState {
    locale: string,
    messages: TKI18nMessages,
    overridden: boolean
}

class TKI18nProvider extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);
        const data = (!props.dataPromise || props.dataPromise instanceof Promise) ? undefined : props.dataPromise;
        // Compose messages by overriding untranslated with messages_en and then with config translations 
        // (if it's not a promise, address the promise case after component mounted).
        const configTranslations = data?.translations ?? {};
        const messages = Object.assign({}, untranslated, messages_en, configTranslations);
        this.state = {
            locale: data?.locale ?? 'en',
            messages: messages,
            overridden: false
        }
    }

    public render(): React.ReactNode {
        i18n.locale = this.state.locale;
        return (
            <I18n
                locale={this.state.locale}
                messages={this.state.messages}
                allowMissing={Environment.isDev()}
            // onMissingKey={Environment.isDev() ?
            //     (key: string, options?: any, locale?: string) =>
            //         // If a used key is missing.
            //         // Notice messages are completed as much as possible by overriding sources. See componentDidMount.
            //         key + " (hey, you missed this key)" :
            //     undefined
            // }
            >
                <WithTranslate>
                    {(props: { t: TranslationFunction }) =>
                        <TKI18nContext.Provider
                            value={{ locale: this.state.locale, i18nOverridden: this.state.overridden, ...props }}
                        >
                            {this.props.children}
                        </TKI18nContext.Provider>
                    }
                </WithTranslate>
            </I18n>
        );
    }

    public componentDidMount() {
        if (this.props.dataPromise && this.props.dataPromise instanceof Promise) {
            this.props.dataPromise
                .then((data: { locale: string, translations: Partial<TKI18nMessages> }) => {
                    // Compose messages by overriding untranslated, with messages_en, and then with data.translations
                    // TODO: maybe it makes sense to compose also language-only resource when language+country is
                    // available (e.g. es when es-AR is available), so missing terms on language+country first fallback
                    // to language-only, and then to english. Maybe data.translations can be an array of messages
                    // resources, e.g. [messages es-AR, messages_es].
                    const messages = Object.assign({}, untranslated, messages_en, data.translations);
                    this.setState({
                        locale: data.locale,
                        messages: messages,
                        overridden: true
                    });
                })
                .catch((error: Error) => {
                    // console.log(error.message);
                });
        }
    }

}

export default TKI18nProvider;
