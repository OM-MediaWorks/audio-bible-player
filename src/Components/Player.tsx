import { useState } from 'react'
import { AudioBible } from '../types'

export function Player ({ meta }: { meta: AudioBible }) {

  const [activeBook, setActiveBook] = useState(meta.books[0])
  const [activeChapter, setActiveChapter] = useState(activeBook.chapters[0])
  const [expanded, setExpanded] = useState(false)

  console.log(expanded)

    return (
      <div>
        <h1>{meta.label}</h1>

        <details open={expanded ? true : undefined} className='books'>
          <summary>{activeBook.label} {activeChapter.number}</summary>

          {meta.books.map(book => (
            <details open={book === activeBook} key={book.id} className='book'>
              <summary>{book.label}</summary>

              <div className='chapters btn-group d-flex flex-wrap'>
                {book.chapters.map(chapter => (
                    <button key={chapter.number} className={`btn btn-secondary ${chapter === activeChapter ? 'active' : ''}`} onClick={(event) => {
                      setActiveBook(book)                          
                      setActiveChapter(chapter)
                      setExpanded(true)
                      setTimeout(() => setExpanded(false), 40)
                    }}>
                      {chapter.number}
                    </button>
                ))}
              </div>
            </details>
          ))}
          
        </details>

        {activeBook && activeChapter ? (<audio autoPlay controls src={activeChapter.file}></audio>) : null}

      </div>
    )
}