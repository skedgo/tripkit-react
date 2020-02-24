import React from "react";
import { I18n, translate } from 'react-polyglot';

// SEGUIR ACÁ:
// Implement browser language detection (use some library) on html of client web-app. Maybe pass locale to config, similar
// to userLocationPromise? Maybe if there's a promise passed, then don't show strings (instead of showing in english and
// then switch). Pass detected locale + messages to TKI18nProvider as props (instead of state)? So, if no localePromise,
// then pass locale: en and messages: require(i18n_en.json), and if there's a promise, pass nothing (meaning not show anything,
// or show placeholders) and on promise resolution pass locale and messages. Warn: it makes sense to require default
// locale messages (for en) inside I18nProvider, so maybe don't pass messages in that case.

export type TranslationFunction = (
    /** The key of the phrase to translate. */
    phrase: string,
    /** The options accepted by `polyglot.t`. */
    options?: any
) => string

export interface TKI18nContextProps {
    t: TranslationFunction;
}

export const TKI18nContext = React.createContext<TKI18nContextProps> ({
    t: (key: string, params?: any) => ""
});

const WithTranslate = translate()(
    (props: {t: TranslationFunction, children: any}) => {
        return props.children(props);
    }
);

const messages_en = require("./i18n_en.json");

interface IState {
    locale: string,
    messages: any
}

class TKI18nProvider extends React.Component<{}, IState> {

    constructor(props: {}) {
        super(props);
        this.state = {
            locale: 'en',
            messages: messages_en
        }
    }

    public render(): React.ReactNode {
        // const locale = 'en';
        // const messages = {
        //     "where_do_you_want_to_go": "Where do you want to go?",
        //     "where_do_you_want_to_go_X": "Where do you want to go, %{name}?"
        // };
        return (
            <I18n locale={this.state.locale}
                  messages={this.state.messages}
                  allowMissing={true}
                  onMissingKey={(key: string, options?: any, locale?: string) =>
                      // TODO: Implement fallback to english messages
                      key + " (hey, you missed this key)"
                  }
            >
                <WithTranslate>
                    {(props: { t: TranslationFunction }) =>
                        <TKI18nContext.Provider
                            value={props}
                        >
                            {this.props.children}
                        </TKI18nContext.Provider>
                    }
                </WithTranslate>
            </I18n>
        );
    }

}

export default TKI18nProvider;
