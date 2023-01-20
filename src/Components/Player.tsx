import { createRef, useState, useEffect } from 'react'
import { AudioBible } from '../types'
import '../style.scss'

export function Player ({ meta }: { meta: AudioBible }) {

  const [activeBook, setActiveBook] = useState(meta.books[0])
  const [activeChapter, setActiveChapter] = useState(activeBook.chapters[0])
  const [expanded, setExpanded] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioPlayer = createRef<HTMLAudioElement>()
  const [started, setStarted] = useState(false)
  const canvas = createRef<HTMLCanvasElement>()

  const togglePlaying = (audioPlayer: HTMLAudioElement) => {
    console.log('woops')
    audioPlayer.paused ? audioPlayer.play() : audioPlayer.pause()

    if (!started) {
      if (audioPlayer) {
        audioPlayer.addEventListener('play', () => {
          setIsPlaying(true)
        })
  
        audioPlayer.addEventListener('pause', () => {
          setIsPlaying(false)
        })
  
        const context = new AudioContext()
        const src = context.createMediaElementSource(audioPlayer)
        const analyser = context.createAnalyser()
        const ctx = canvas.current!.getContext("2d")!
  
        src.connect(analyser)
        analyser.connect(context.destination)
    
        analyser.fftSize = 256
    
        const bufferLength = analyser.frequencyBinCount
    
        const dataArray = new Uint8Array(bufferLength)
  
        var WIDTH = canvas.current!.width;
        var HEIGHT = canvas.current!.height;
    
        var barWidth = (WIDTH / bufferLength) * 2.5;
        var barHeight;
        var x = 0;
  
   
        function renderFrame() {
          requestAnimationFrame(renderFrame);
    
          x = 0;
    
          analyser.getByteFrequencyData(dataArray);
    
          ctx.fillStyle = "#fff";
          ctx.fillRect(0, 0, WIDTH, HEIGHT);
    
          for (var i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i];
              ctx.fillStyle = "rgb(33, 139, 180)";
            ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);
    
            x += barWidth + 1;
          }
        }

        console.log('test')
  
        renderFrame()
        setStarted(true)
      }
    }
  }

  useEffect(() => {

  }, [])

  return (
    <div className={`inner ${isPlaying ? 'is-playing' : ''} ${expanded ? 'expanded' : ''}`}>

      {activeBook && activeChapter ? (
        <div className='player'>
          <button className='play-pause' onClick={() => togglePlaying(audioPlayer.current!)}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-play-fill" viewBox="0 0 16 16">
              <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-pause-fill" viewBox="0 0 16 16">
              <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"/>
            </svg>

            <canvas width='100px' height='100px' ref={canvas} className='waves'></canvas>
          </button>

          <audio crossOrigin='anonymous' ref={audioPlayer} controls src={`https://cors.deno.dev/${activeChapter.file}`}></audio>
        </div>
      ) : null}

      <div className='right'>
        <h1 className='bible-title'>
          <a href={meta.link} target='_blank'>{meta.label}</a>
        </h1>

        <span className='currently-playing' onClick={() => {
          setExpanded(!expanded)
        }}>
          {activeBook.label} {activeChapter.number}

          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-caret-down-fill" viewBox="0 0 16 16">
            <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
          </svg>
        </span>

        <div className={`books`}>
          <div className='inner'>
          {meta.books.map(book => (
            <details open={book === activeBook} key={book.id} className='book'>
              <summary>{book.label}</summary>

              <div className='chapters'>
                {book.chapters.map(chapter => (
                    <button key={chapter.number} className={`chapter ${chapter === activeChapter ? 'active' : ''}`} onClick={(event) => {
                      setActiveBook(book)                          
                      setActiveChapter(chapter)
                      setExpanded(true)
                      setTimeout(() => setExpanded(false), 40)
                    }}>
                      {chapter.number}
                    </button>
                ))}
                <div className='chapter empty'></div>
                <div className='chapter empty'></div>
                <div className='chapter empty'></div>
                <div className='chapter empty'></div>
                <div className='chapter empty'></div>
                <div className='chapter empty'></div>
                <div className='chapter empty'></div>

              </div>
            </details>
          ))}
          </div>
        </div>
      </div>

    </div>
  )
}