import React from "react";
import { I18n, translate } from 'react-polyglot';
import Environment from "../env/Environment";

export type TKI18nMessages = { [key: string]: string; };

export type TranslationFunction = (
    /** The key of the phrase to translate. */
    phrase: string,
    /** The options accepted by `polyglot.t`. */
    options?: any
) => string

export interface TKI18nContextProps {
    locale: string;
    t: TranslationFunction;
}

export const TKI18nContext = React.createContext<TKI18nContextProps> ({
    t: (key: string, params?: any) => "",
    locale: 'en'
});

const WithTranslate = translate()(
    (props: {t: TranslationFunction, children: any}) => {
        return props.children({t: props.t});
    }
);

const messages_en = require("./i18n_en.json");
const untranslated = require("./untranslated.json");

interface IProps {
    dataPromise?: Promise<{locale: string, translations: TKI18nMessages}>
}

interface IState {
    locale: string,
    messages: TKI18nMessages
}

class TKI18nProvider extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);
        // Compose messages by overriding untranslated with messages_en.
        const messages = Object.assign({}, untranslated, messages_en);
        this.state = {
            locale: 'en',
            messages: messages
        }
    }

    public render(): React.ReactNode {
        return (
            <I18n locale={this.state.locale}
                  messages={this.state.messages}
                  allowMissing={Environment.isDev()}
                  onMissingKey={Environment.isDev() ?
                      (key: string, options?: any, locale?: string) =>
                      // If a used key is missing.
                      // Notice messages are completed as much as possible by overriding sources. See componentDidMount.
                      key + " (hey, you missed this key)" :
                      undefined
                  }
            >
                <WithTranslate>
                    {(props: { t: TranslationFunction }) =>
                        <TKI18nContext.Provider
                            value={{locale: this.state.locale, ...props}}
                        >
                            {this.props.children}
                        </TKI18nContext.Provider>
                    }
                </WithTranslate>
            </I18n>
        );
    }

    public componentDidMount() {
        if (this.props.dataPromise) {
            this.props.dataPromise
                .then((data: {locale: string, translations: TKI18nMessages}) => {
                    // Compose messages by overriding untranslated, with messages_en, and then with data.translations
                    // TODO: maybe it makes sense to compose also language-only resource when language+country is
                    // available (e.g. es when es-AR is available), so missing terms on language+country first fallback
                    // to language-only, and then to english. Maybe data.translations can be an array of messages
                    // resources, e.g. [messages es-AR, messages_es].
                    const messages = Object.assign({}, untranslated, messages_en, data.translations);
                    this.setState({
                        locale: data.locale,
                        messages: messages
                    })
                })
                .catch((error: Error) => {
                    // console.log(error.message);
                });
        }
    }

}

export default TKI18nProvider;
