import 'intl-polyfill'
import ReactDOM from 'react-dom/client'
import { Fcbh } from './Resolvers/Fcbh'
import { Archive } from './Resolvers/Archive'
import { ResolverInterface } from './Resolvers/ResolverInterface'
import { negotiateLanguages } from '@fluent/langneg'
import { FluentBundle, FluentResource } from '@fluent/bundle'
import { LocalizationProvider, ReactLocalization, Localized } from '@fluent/react'
import { AudioBible, Book, Chapter } from './types'
import { Player } from './Components/Player'

const RESOURCES: { [key: string]: FluentResource } = {
    'fr': new FluentResource('hello = Salut le monde !'),
    'en-US': new FluentResource('hello = Hello, world!'),
    'pl': new FluentResource('hello = Witaj świecie!'),
}

function* generateBundles(userLocales: Array<string>) {
    const currentLocales = negotiateLanguages(
        userLocales,
        ['fr', 'en-US', 'pl'],
        { defaultLocale: 'en-US' }
    )

    for (const locale of currentLocales) {
        const bundle = new FluentBundle(locale)
        bundle.addResource(RESOURCES[locale])
        yield bundle;
    }
}

const l10n = new ReactLocalization(generateBundles(navigator.languages as Array<string>))

class AudioBiblePlayer extends HTMLElement {

  #resolvers = [Fcbh, Archive]
  #resolver: ResolverInterface
  #meta: AudioBible | undefined

  constructor () {
    super()

    const identifier = this.getAttribute('identifier')
    if (!identifier) throw new Error('Needs an identifier attribute')

    const matchedResolver = this.#resolvers.find((Resolver) => {
      const resolver = new Resolver(identifier, this.attributes)
      return resolver.applies()
    })

    if (!matchedResolver) throw new Error(`Could not find a resolver for: ${identifier}`)

    this.#resolver = new matchedResolver(identifier, this.attributes)
  }

  async connectedCallback() {
    this.#meta = await this.#resolver.getMeta()

    const root = ReactDOM.createRoot(this)
    root.render(
      <LocalizationProvider l10n={l10n}>
        <Player meta={this.#meta} />
      </LocalizationProvider>
    )
  }
}

customElements.define('audio-bible-player', AudioBiblePlayer);