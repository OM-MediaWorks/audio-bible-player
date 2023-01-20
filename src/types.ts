export type Chapter = {
    file: string,
    number: number | string
}

export type Book = {
    id: string,
    label: string,
    chapters: Array<Chapter>
}

export type AudioBible = {
    id: string,
    link: string,
    label: string,
    books: Array<Book>
}