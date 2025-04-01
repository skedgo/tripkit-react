import React from 'react'
import Polyglot from 'node-polyglot'
import I18nContext from './i18n-context'

function I18n({
  locale,
  messages,

  allowMissing = false,
  onMissingKey = undefined,
  interpolation = undefined,
  pluralRules = undefined,

  children,
}) {
  const translate = React.useMemo(() => {
    const polyglot = new Polyglot({
      locale,
      phrases: messages,

      allowMissing,
      onMissingKey,
      interpolation,
      pluralRules,
    })
    const boundTranslate = polyglot.t.bind(polyglot)

    boundTranslate._polyglot = polyglot

    return boundTranslate
  }, [locale, messages, allowMissing, onMissingKey, interpolation, pluralRules])

  return (
    <I18nContext.Provider value={translate}>
      {React.Children.only(children)}
    </I18nContext.Provider>
  )
}

export default I18n;
