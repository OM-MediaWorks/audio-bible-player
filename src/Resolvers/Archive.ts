import { ResolverInterface } from './ResolverInterface'
import fetchJsonp from 'fetch-jsonp'

type ArchiveFile = {
    crc32: string
    format: string
    length: string
    md5: string
    mtime: string
    sha1: string
    size: string
    source: string
    track: string
}

type Book = { 
    name: string
    chapters: Array<string>, 
    template: (chapter: string) => string 
}

/**
 * I think this is a standard of SIL
 * SORTER_BOOK_CHAPTER_BCP47_ORG_UNKNOWN
 */
export class Archive implements ResolverInterface {
    
    #input: string
    #attributes: NamedNodeMap

    constructor (input: string, attributes: NamedNodeMap) {
        this.#input = input
        this.#attributes = attributes
    }

    applies () {
        return this.#input.startsWith('archive:')
    }

    async getMeta () {
        const response = await fetchJsonp(`https://archive.org/details/${this.#input.substring(8)}&output=json`)
        const archiveData = await response.json()

        const mp3s = Object.entries(archiveData.files as { [key: string]: ArchiveFile })
        .filter(([file]: [string, ArchiveFile]) => file.endsWith('.mp3'))

        const books: Map<string, Book> = new Map()
        for (const [filename] of mp3s) {
            const [sorter, book, chapter, bcp47, org, unknown] = filename.split('_')

            const bookMeta = (books.has(book) ? books.get(book) : books.set(book, { name: book, template: (chapter: string) => `${sorter}_${book}_${chapter}_${bcp47}_${org}_${unknown}`, chapters: [] }) && books.get(book))!
            bookMeta.chapters.push(chapter)
        }

        const id = archiveData.metadata.identifier.pop() as string
        const label = archiveData.metadata.title.pop() as string

        return {
            label,
            id,
            link: `https://archive.org/details/${this.#input.substring(8)}`,
            books: [...books.values()].map((book: Book) => {
                return {
                    label: book.name,
                    id: book.name,
                    chapters: book.chapters.map((chapter: string) => {
                        const cleanedChapter = parseInt(chapter) !== Number.NaN ? parseInt(chapter) : chapter
                        
                        return {
                            file: `https://archive.org/download/${id}${book.template(chapter)}`,
                            number: cleanedChapter
                        }
                    })
                }
            })
        }
    }

}