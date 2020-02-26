import React from "react";
import { I18n, translate } from 'react-polyglot';

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
        this.state = {
            locale: 'en',
            messages: messages_en
        }
    }

    public render(): React.ReactNode {
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
                    this.setState({
                        locale: data.locale,
                        messages: data.translations
                    })
                });
        }
    }

}

export default TKI18nProvider;
