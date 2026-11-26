'use client';

import { useEffect, useEffectEvent, useRef, useState, useSyncExternalStore } from 'react';
import Diagram from './diagram';
import Experiment from './experiment';
import SerialBench from './serial-bench';
import SketchCode from './sketch-code';
import { chapters, slides } from './slides';

const slideNumber = (index) => String(index + 1).padStart(2, '0');
const kindLabels = { theory: 'Conceito', practice: 'Bancada interativa', serial: 'Bancada interativa', repetition: 'Bancada interativa', question: 'Questão', answer: 'Resposta' };

function subscribeToHash(update) {
  window.addEventListener('hashchange', update);
  return () => window.removeEventListener('hashchange', update);
}

function getSlideIndex() {
  const index = slides.findIndex(slide => slide.id === window.location.hash.slice(1));
  return Math.max(0, index);
}

function Theory({ slide }) {
  const { title, lead, details, code, file, caption, table, everyday } = slide;
  return <article className="theory-slide">
    <h1>{title}</h1>
    <p className="slide-lead">{lead}</p>
    <div className="theory-columns">
      <div>
        <dl>{details.map(([label, text]) => <div key={label}><dt>{label}</dt><dd>{text}</dd></div>)}</dl>
        <aside className="everyday"><strong>No dia a dia</strong><p>{everyday}</p></aside>
      </div>
      {code && <figure className="theory-example">
        <SketchCode file={file} source={code} />
        <figcaption>{caption}</figcaption>
      </figure>}
      {table && <div className="theory-table-wrap">
        <table className="theory-table" aria-label={title}>
          <thead><tr>{table.headers.map(header => <th key={header} scope="col">{header}</th>)}</tr></thead>
          <tbody>{table.rows.map(([label, ...cells]) => <tr key={label}><th scope="row">{label}</th>{cells.map(cell => <td key={cell}>{cell}</td>)}</tr>)}</tbody>
        </table>
      </div>}
    </div>
  </article>;
}

function Question({ slide, selected, onAnswer }) {
  const { prompt, options } = slide.question;
  return <article className="assessment-slide">
    <form>
      <fieldset>
        <legend>{prompt}</legend>
        <div className="assessment-options">{options.map(([option], index) => {
          const letter = String.fromCharCode(65 + index);
          return <label key={option} className={`assessment-option ${selected === index ? 'chosen' : ''}`}>
            <input type="radio" name={slide.id} checked={selected === index} onChange={() => onAnswer(index)} />
            <span className="option-letter" aria-hidden="true">{letter}</span><span>{option}</span>
          </label>;
        })}</div>
      </fieldset>
    </form>
    <p className="assessment-hint">A resposta comentada está no próximo slide.</p>
  </article>;
}

function Answer({ slide, selected }) {
  const { prompt, options, correct } = slide.question;
  const isWrong = selected !== undefined && selected !== correct;
  const [correctLabel, correctReason] = options[correct];
  return <article className="assessment-slide answer-slide">
    <h1>{prompt}</h1>
    <div className={`answer-grid ${isWrong ? 'compare' : ''}`}>
      {isWrong && <section className="answer-option wrong-selection">
        <p className="answer-label">Opção marcada</p>
        <h2>{String.fromCharCode(65 + selected)}. {options[selected][0]}</h2>
        <p>{options[selected][1]}</p>
      </section>}
      <section className="answer-option correct-selection">
        <p className="answer-label">Resposta correta{selected === correct && ' · Você acertou'}</p>
        <h2>{String.fromCharCode(65 + correct)}. {correctLabel}</h2>
        <p>{correctReason}</p>
      </section>
    </div>
  </article>;
}

function Summary({ onSelect }) {
  return <article className="summary-slide">
    <h1>Sumário da aula</h1>
    <p className="slide-lead">Siga a ordem da apresentação ou abra um tema para revisar.</p>
    <ol className="summary-list">
      {chapters.map(chapter => <li key={chapter.id}>
        <button onClick={() => onSelect(slides.indexOf(chapter.slides[0]))}>
          <strong>{chapter.title}</strong><span>{chapter.summary}</span>
        </button>
      </li>)}
    </ol>
  </article>;
}

function Closing() {
  return <article className="closing-slide">
    <p>Minicurso com Arduino Uno</p>
    <h1>Obrigada pela atenção!</h1>
    <p className="presenter-name">Mariana da Costa Lisboa</p>
    <p>Para encerrar, que tarefa do dia a dia você automatizaria com uma entrada e uma saída?</p>
  </article>;
}

function Cover({ onStart }) {
  return <article className="cover-slide">
    <div>
      <p className="cover-label">Minicurso com Arduino Uno</p>
      <h1>Programação<br />para Arduino</h1>
      <p className="presenter-name">Mariana da Costa Lisboa</p>
      <button className="cover-start" onClick={onStart}>Começar apresentação</button>
    </div>
    <Diagram lesson="arrays" activePin={9} pressed={false} running={false} builtin={false} />
  </article>;
}

function Materials() {
  return <article className="material-slide">
    <h1>Materiais da aula</h1>
    <p className="slide-lead">Plano, slides e sketches para acompanhar as práticas com Arduino Uno.</p>
    <div className="card resources">
      <a href="./materiais/plano_de_ensino_arduino.docx" download>Plano de ensino e atividades <span>DOCX</span></a>
      <a href="./materiais/programacao_para_arduino.pptx" download>Slides de programação para Arduino <span>PPTX</span></a>
      <a href="./materiais/sketches_minicurso_arduino.zip" download>Sketches do minicurso <span>ZIP</span></a>
      <a href="https://www.youtube.com/playlist?list=PLMAnnvw9y2UD3oDPTSq37kykjlOsob0pP">Playlist base do EngEasier <span>YOUTUBE</span></a>
      <a href="https://docs.arduino.cc/learn/microcontrollers/digital-pins/">Arduino · Entradas e saídas digitais <span>DOCS</span></a>
      <a href="https://docs.arduino.cc/language-reference/en/functions/communication/serial/">Arduino · Comunicação serial <span>DOCS</span></a>
      <a href="https://docs.arduino.cc/language-reference/en/variables/utilities/sizeof/">Arduino · Operador sizeof <span>DOCS</span></a>
    </div>
  </article>;
}

export default function Presentation() {
  const index = useSyncExternalStore(subscribeToHash, getSlideIndex, () => 0);
  const slide = slides[index];
  const [answers, setAnswers] = useState({});
  const [fullscreen, setFullscreen] = useState(false);
  const [fullscreenMessage, setFullscreenMessage] = useState('');
  const stage = useRef(null);
  const menu = useRef(null);
  const previousSlide = useRef(slide.id);
  const [turn, setTurn] = useState({ to: index, from: null });
  if (turn.to !== index) {
    setTurn({ to: index, from: turn.to });
  }
  const direction = turn.from === null ? undefined : index > turn.from ? 'forward' : 'back';
  const lastIndex = slides.length - 1;

  function goTo(target) {
    if (target < 0 || target > lastIndex || target === index) return;
    menu.current.open = false;
    window.location.hash = slides[target].id;
  }

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
      setFullscreenMessage('');
    } catch {
      setFullscreenMessage('O navegador não conseguiu abrir a tela cheia.');
    }
  }

  const handleKey = useEffectEvent(event => {
    if (event.defaultPrevented || event.altKey || event.metaKey || event.ctrlKey || event.shiftKey) return;
    if (event.target.closest?.('input, textarea, select, [contenteditable], pre, .deck-menu')) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      goTo(index + (event.key === 'ArrowLeft' ? -1 : 1));
    }
  });

  useEffect(() => {
    function updateFullscreen() { setFullscreen(Boolean(document.fullscreenElement)); }
    function onKeydown(event) { handleKey(event); }
    document.addEventListener('fullscreenchange', updateFullscreen);
    document.addEventListener('keydown', onKeydown);
    return () => {
      document.removeEventListener('fullscreenchange', updateFullscreen);
      document.removeEventListener('keydown', onKeydown);
    };
  }, []);

  useEffect(() => {
    if (previousSlide.current === slide.id) return;
    previousSlide.current = slide.id;
    window.scrollTo({ top: 0, behavior: 'instant' });
    stage.current.focus({ preventScroll: true });
  }, [slide.id]);

  useEffect(() => {
    if (turn.from === null) return;
    const fallback = window.setTimeout(() => setTurn(current =>
      current === turn ? { to: turn.to, from: null } : current
    ), 700);
    return () => window.clearTimeout(fallback);
  }, [turn]);

  function finishTurn(event) {
    if (event.target !== event.currentTarget || turn.from === null) return;
    setTurn({ to: index, from: null });
  }

  function slideLink(item, target) {
    return <a href={`#${item.id}`} key={item.id} aria-current={index === target ? 'page' : undefined} onClick={event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      menu.current.open = false;
      goTo(target);
    }}>{item.kind === 'theory' ? item.title : item.kind === 'practice' ? 'Bancada' : item.title}</a>;
  }

  return <div className="presentation">
    <a className="skip" href="#main-content" onClick={event => { event.preventDefault(); stage.current.focus(); }}>Ir para o slide</a>
    <header className="deck-toolbar">
      <a className="brand" href="#inicio"><span className="brand-icon" aria-hidden="true">▦</span><span>Arduino<span className="brand-accent">Lab</span></span></a>
      <div className="toolbar-actions">
        <details className="deck-menu" ref={menu}>
          <summary>Roteiro</summary>
          <nav aria-label="Roteiro dos slides">
            {slides.slice(0, 2).map((item, target) => slideLink(item, target))}
            {chapters.map(chapter => <section key={chapter.id}>
              <h2>{chapter.title}</h2>
              {chapter.slides.map(item => slideLink(item, slides.indexOf(item)))}
            </section>)}
            {slides.slice(-2).map((item, offset) => slideLink(item, lastIndex - 1 + offset))}
          </nav>
        </details>
        <button className="presentation-mode" onClick={toggleFullscreen} aria-pressed={fullscreen}>⛶ <span>{fullscreen ? 'Sair da tela cheia' : 'Tela cheia'}</span></button>
      </div>
      {fullscreenMessage && <p className="fullscreen-message" role="status">{fullscreenMessage}</p>}
    </header>
    <main id="main-content" className="deck-stage" ref={stage} tabIndex={-1} aria-label={`Slide ${index + 1} de ${slides.length}`}>
      <div className="slide-viewport" data-direction={direction}>
        {(turn.from === null ? [index] : [turn.from, index]).map(panelIndex => {
          const panel = slides[panelIndex];
          const leaving = panelIndex !== index;
          const selected = answers[panel.questionId];
          return <div
            className={`slide-content deck-${panel.kind}`}
            key={panel.id}
            data-phase={leaving ? 'outgoing' : 'current'}
            inert={leaving || undefined}
            aria-hidden={leaving || undefined}
            onAnimationEnd={leaving ? undefined : finishTurn}
          >
            {panel.topic && <p className="slide-context"><span>{panel.topic}</span><span>{kindLabels[panel.kind]}</span></p>}
            {panel.kind === 'cover' && <Cover onStart={() => goTo(1)} />}
            {panel.kind === 'summary' && <Summary onSelect={goTo} />}
            {panel.kind === 'theory' && <Theory slide={panel} />}
            {panel.kind === 'serial' && <SerialBench timedExample />}
            {panel.kind === 'repetition' && <SerialBench />}
            {panel.kind === 'practice' && <Experiment lesson={panel.lesson} />}
            {panel.kind === 'question' && <Question slide={panel} selected={selected} onAnswer={value => setAnswers(current => ({ ...current, [panel.questionId]: value }))} />}
            {panel.kind === 'answer' && <Answer slide={panel} selected={selected} />}
            {panel.kind === 'materials' && <Materials />}
            {panel.kind === 'closing' && <Closing />}
          </div>;
        })}
      </div>
    </main>
    <footer className="deck-footer">
      <div className="deck-position">
        <output aria-live="polite" aria-label="Posição na apresentação">{slideNumber(index)} <span>/ {slides.length}</span></output>
        <progress max={slides.length} value={index + 1} aria-label="Progresso da apresentação" />
      </div>
      <nav aria-label="Navegação da apresentação">
        <button className="secondary" disabled={index === 0} onClick={() => goTo(index - 1)}>Anterior</button>
        {index < lastIndex
          ? <button className="primary" onClick={() => goTo(index + 1)}>{slide.kind === 'question' ? 'Ver resposta' : 'Próximo slide'}</button>
          : <button className="primary" onClick={() => { setAnswers({}); goTo(0); }}>Voltar ao início</button>}
      </nav>
    </footer>
  </div>;
}
