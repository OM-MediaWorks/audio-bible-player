import { ResolverInterface } from './ResolverInterface'
import type { AudioBible } from '../types'

const FCBH_URL = 'https://4.dbt.io/api/bibles/'

type fcbhChapter = {
    book_id: string
    book_name: string
    chapter_end: null
    chapter_start: number
    duration: number
    filesize_in_bytes: number
    path: string
    thumbnail: null
    timestamp: null
    verse_end: null
    verse_start: number
    youtube_url: null
}

/**
 * FCBH online widget
 */
export class Fcbh implements ResolverInterface {
    
    #input: string
    #attributes: NamedNodeMap
    #key: string

    constructor (input: string, attributes: NamedNodeMap) {
        this.#input = input
        this.#attributes = attributes
        this.#key = this.#attributes.getNamedItem('fcbh-key')?.textContent!
    }

    applies () {
        return !!this.#key && this.#input.startsWith('fcbh:')
    }

    async getMeta () {
        const chaptersResponse = await fetch(`${FCBH_URL}filesets/${this.#input.substring(5)}?key=${this.#key}&v=4`)
        const chaptersData = await chaptersResponse.json()
        const bibleResponse = await fetch(`${FCBH_URL}${this.#input.substring(5)}?key=${this.#key}&v=4`)
        const bibleData = await bibleResponse.json()
        const bookIds: Set<string> = new Set(chaptersData.data.map((chapter: fcbhChapter) => chapter.book_id))

        return {
            label: bibleData.data.name,
            id: bibleData.data.abbr,
            link: `https://live.bible.is/bible/${this.#input.substring(5)}`,
            books: [...bookIds.values()].map((bookId: string) => {
                const chapters = chaptersData.data.filter((chapter: fcbhChapter) => chapter.book_id === bookId)
                return {
                    label: chapters[0].book_name,
                    id: chapters[0].book_id,
                    chapters: chapters.map((chapter: fcbhChapter) => {
                        return {
                            file: chapter.path,
                            number: chapter.chapter_start
                        }
                    })
                }
            })
        }

    }
}