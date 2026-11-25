'use client';

import { useEffect, useEffectEvent, useState } from 'react';
import Diagram from './diagram';
import { defaultPins, lessons, pwmFromAdc, sketch } from './lessons';

const symbols = {
  chip: '▦', led: '◇', button: '⏻', knob: '◉', layers: '▤',
  quiz: '?', file: '▧', code: '‹/›', circuit: '⌁', play: '▶', pause: 'Ⅱ',
};

function Icon({ type }) {
  return <span className={`symbol symbol-${type}`} aria-hidden="true">{symbols[type]}</span>;
}

function Quiz({ answers, setAnswers }) {
  const total = lessons.reduce((sum, item) => sum + item.questions.length, 0);
  const score = lessons.reduce((sum, item) => sum + item.questions.filter((q, i) => answers[`${item.id}-${i}`] === q[2]).length, 0);
  return <section className="quiz-page" aria-labelledby="quiz-title">
    <div className="page-title"><h1 id="quiz-title">Questionários</h1><p>Revise os conceitos dos experimentos e confira a explicação de cada resposta.</p></div>
    <div className="quiz-score"><span><strong>{score}/{total}</strong> corretas · {Object.keys(answers).length} respondidas</span><button className="secondary" onClick={() => setAnswers({})} disabled={!Object.keys(answers).length}>Refazer</button></div>
    <div className="quiz-grid">{lessons.map(item => <section className="quiz-card" key={item.id}>
      <h2>{item.label}</h2>
      {item.questions.map(([prompt, options, correct, explanation], i) => {
        const key = `${item.id}-${i}`;
        const selected = answers[key];
        return <fieldset key={prompt}>
          <legend>{prompt}</legend>
          {options.map((option, optionIndex) => <label key={option} className={`quiz-option ${selected !== undefined && optionIndex === correct ? 'right' : ''} ${selected === optionIndex && selected !== correct ? 'wrong' : ''}`}>
            <input type="radio" name={key} checked={selected === optionIndex} onChange={() => setAnswers({ ...answers, [key]: optionIndex })} disabled={selected !== undefined} />{option}
          </label>)}
          {selected !== undefined && <p className="feedback" role="status"><strong>{selected === correct ? 'Correto.' : 'Revise.'}</strong> {explanation}</p>}
        </fieldset>;
      })}
    </section>)}</div>
  </section>;
}

function LiveCode({ lesson, source, activeLine, liveLabel }) {
  const [copyStatus, setCopyStatus] = useState('');
  async function copy() {
    try {
      await navigator.clipboard.writeText(source);
      setCopyStatus('Copiado');
    } catch {
      setCopyStatus('Selecione o código para copiar');
    }
  }
  function download() {
    const url = URL.createObjectURL(new Blob([source + '\n'], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = lesson.file;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <section className="card code-card" aria-labelledby="code-heading">
    <div className="card-head"><h2 id="code-heading"><Icon type="code" /> Código do Arduino</h2><div className="code-actions"><button className="small-button" onClick={copy}>{copyStatus || 'Copiar'}</button><button className="small-button" onClick={download} aria-label="Baixar sketch .ino">Baixar .ino</button></div></div>
    <div className="editor">
      <div className="editor-file"><Icon type="file" /> <span>{lesson.file}</span><span className="language">C++</span></div>
      <pre tabIndex="0" aria-label="Sketch Arduino comentado"><code>{source.split('\n').map((line, i) => <span key={i} className={`code-line ${line.trim().startsWith('//') ? 'comment' : ''} ${line.trim() && line.includes(activeLine) ? 'highlight' : ''}`}><span className="line-no" aria-hidden="true">{i + 1}</span><span>{line || ' '}</span>{'\n'}</span>)}</code></pre>
      <div className="editor-status"><span className="status-dot" /><span>{liveLabel}</span></div>
    </div>
  </section>;
}

function Experiment({ lesson }) {
  const [adc, setAdc] = useState(640);
  const [milliseconds, setMilliseconds] = useState(500);
  const [pins, setPins] = useState(defaultPins);
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [period, setPeriod] = useState(400);
  const { id } = lesson;
  const isBlink = id === 'blink';
  const isButton = id === 'button';
  const isPwm = id === 'pwm';
  const isArray = id === 'arrays';
  const timed = isBlink || isArray;

  const advance = useEffectEvent(() => {
    setStep((current) => current + 1);
    if (isArray) setPeriod(pressed ? 150 : 400);
  });

  useEffect(() => {
    if (!timed || !running) return;
    const timer = window.setTimeout(() => advance(), isBlink ? milliseconds : period);
    return () => window.clearTimeout(timer);
  }, [isBlink, milliseconds, period, running, step, timed]);

  function changeButton() {
    // Resetar o temporizador a cada troca mudaria o passo em andamento.
    setPressed(!pressed);
    if (!running) setPeriod(!pressed ? 150 : 400);
  }

  function reset() {
    setRunning(false);
    setStep(0);
    setMilliseconds(500);
    setAdc(640);
    setPressed(false);
    setPins(defaultPins);
    setPeriod(400);
  }

  const pwm = pwmFromAdc(adc);
  const duty = Math.round(pwm * 100 / 255);
  const selectedIndex = step % pins.length;
  const activePin = pins[selectedIndex];
  const builtin = (isBlink && step % 2 === 0) || (isButton && pressed);
  const activeLine = isPwm ? 'analogWrite(led, pwm)' : isArray ? 'piscarLed(leds[i], tempoMs)' : `digitalWrite(led, ${builtin ? 'HIGH' : 'LOW'})`;
  const liveLabel = isPwm ? `analogWrite(9, ${pwm})` : isArray ? `leds[${selectedIndex}] = ${activePin}` : `digitalWrite(led, ${builtin ? 'HIGH' : 'LOW'})`;

  return <>
    <div className="page-title">
      <div className="breadcrumb">Bancada <span>/</span> {lesson.concept}</div>
      <h1>{lesson.title}</h1><p>{lesson.description}</p>
    </div>
    <div className="workbench">
      <section className="card circuit-card" aria-labelledby="circuit-heading">
        <div className="card-head"><h2 id="circuit-heading"><Icon type="circuit" /> Circuito interativo</h2><span className="board-name">Arduino Uno</span></div>
        <Diagram lesson={id} adc={adc} pwm={pwm} builtin={builtin} pressed={pressed} activePin={activePin} running={running} />
        <div className="controls">
          {isPwm && <>
            <div className="control-label"><label htmlFor="pot">Potenciômetro</label><output htmlFor="pot">{(adc / 1023 * 5).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} V</output></div>
            <input id="pot" type="range" min="0" max="1023" value={adc} onChange={event => setAdc(Number(event.target.value))} style={{ '--fill': `${adc / 1023 * 100}%` }} />
            <div className="range-labels"><span>0 V</span><span>5 V</span></div>
            <dl className="measurements"><div><dt>Leitura A0</dt><dd>{adc}<span> / 1023</span></dd></div><div><dt>PWM D9</dt><dd>{pwm}<span> / 255</span></dd></div><div><dt>Tempo em HIGH</dt><dd>{duty}<span>%</span></dd></div></dl>
          </>}
          {isBlink && <>
            <div className="control-label"><label htmlFor="interval">Intervalo do Blink</label><output htmlFor="interval">{milliseconds} ms</output></div>
            <input id="interval" type="range" min="150" max="1200" step="50" value={milliseconds} onChange={event => setMilliseconds(Number(event.target.value))} style={{ '--fill': `${(milliseconds - 150) / 1050 * 100}%` }} />
            <dl className="measurements"><div><dt>Saída D13</dt><dd>{builtin ? 'HIGH' : 'LOW'}</dd></div><div><dt>Ciclo completo</dt><dd>{2 * milliseconds}<span> ms</span></dd></div></dl>
          </>}
          {(isButton || isArray) && <div className="actions">
            <button className="primary" aria-pressed={pressed} onClick={changeButton}>{pressed ? 'Soltar botão D2' : 'Pressionar botão D2'}</button>
            {isArray && <button className="secondary" onClick={() => { setPins([...pins].reverse()); setStep(0); }}>Inverter vetor</button>}
          </div>}
          {isButton && <dl className="measurements" aria-live="polite"><div><dt>Entrada D2</dt><dd>{pressed ? 'LOW' : 'HIGH'}</dd></div><div><dt>LED L</dt><dd>{pressed ? 'Aceso' : 'Apagado'}</dd></div></dl>}
          {isArray && <><div className="array-values" aria-label="Vetor de pinos">{pins.map((pin, i) => <div className={i === selectedIndex ? 'selected' : ''} key={pin}><span>índice {i}</span><strong>D{pin}</strong></div>)}</div><p className="period">Passo atual de {period} ms</p></>}
          {timed && <div className="actions transport">
            <button className="primary" onClick={() => setRunning(!running)}><Icon type={running ? 'pause' : 'play'} />{running ? 'Pausar' : 'Executar'}</button>
            <button className="secondary" disabled={running} onClick={() => setStep(step + 1)}>Próximo passo</button>
            <button className="text-button" onClick={reset}>Reiniciar</button>
          </div>}
        </div>
      </section>
      <LiveCode lesson={lesson} source={sketch(id, milliseconds, pins)} activeLine={activeLine} liveLabel={liveLabel} />
    </div>
    <section className="card practice" aria-labelledby="practice-title">
      <div><h2 id="practice-title">Teste em aula</h2><p>{lesson.challenge}</p></div>
      <details><summary>Montagem na bancada</summary><p>{lesson.wiring}</p></details>
    </section>
  </>;
}

export default function Lab() {
  const [selected, setSelected] = useState('pwm');
  const [answers, setAnswers] = useState({});
  const [fullscreen, setFullscreen] = useState(false);
  const lesson = lessons.find(item => item.id === selected);
  useEffect(() => {
    const update = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', update);
    return () => document.removeEventListener('fullscreenchange', update);
  }, []);
  function toggleFullscreen() {
    const operation = document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.();
    operation?.catch(() => {});
  }
  return <>
    <a className="skip" href="#main-content">Ir para o conteúdo</a>
    <header className="topbar">
      <a className="brand" href="#main-content" onClick={() => setSelected('pwm')}><span className="brand-icon"><Icon type="chip" /></span><span>Arduino<span className="brand-accent">Lab</span></span></a>
      <span className="header-title">Minicurso de programação</span>
      <button className="presentation-mode" onClick={toggleFullscreen} aria-pressed={fullscreen}>⛶ <span>{fullscreen ? 'Sair da tela cheia' : 'Tela cheia'}</span></button>
    </header>
    <div className="shell">
      <aside className="sidebar">
        <nav aria-label="Seções do minicurso">
          <p className="nav-label">EXPERIMENTOS</p>
          {lessons.map(item => <button key={item.id} className={`nav-item ${selected === item.id ? 'active' : ''}`} aria-current={selected === item.id ? 'page' : undefined} onClick={() => setSelected(item.id)}><span className="nav-icon"><Icon type={item.icon} /></span><span>{item.label}</span></button>)}
          <div className="nav-divider" />
          <p className="nav-label">APOIO À AULA</p>
          <button className={`nav-item ${selected === 'quiz' ? 'active' : ''}`} aria-current={selected === 'quiz' ? 'page' : undefined} onClick={() => setSelected('quiz')}><span className="nav-icon"><Icon type="quiz" /></span>Questionários</button>
          <button className={`nav-item ${selected === 'materials' ? 'active' : ''}`} aria-current={selected === 'materials' ? 'page' : undefined} onClick={() => setSelected('materials')}><span className="nav-icon"><Icon type="file" /></span>Materiais da aula</button>
        </nav>
        <p className="sidebar-note"><span className="status-dot" /> Simulação didática</p>
      </aside>
      <main id="main-content" className="main">
        {lesson && <Experiment key={lesson.id} lesson={lesson} />}
        {selected === 'quiz' && <Quiz answers={answers} setAnswers={setAnswers} />}
        {selected === 'materials' && <section>
          <div className="page-title"><h1>Materiais da aula</h1><p>Use o roteiro, os slides e os códigos para preparar a oficina e acompanhar as práticas.</p></div>
          <div className="card resources">
            <a href="./materiais/plano_de_ensino_arduino.docx" download>Plano de ensino e atividades <span>DOCX</span></a>
            <a href="./materiais/programacao_para_arduino.pptx" download>Slides de programação para Arduino <span>PPTX</span></a>
            <a href="./materiais/sketches_minicurso_arduino.zip" download>Sketches do minicurso <span>ZIP</span></a>
            <a href="https://www.youtube.com/playlist?list=PLMAnnvw9y2UD3oDPTSq37kykjlOsob0pP">Playlist base do EngEasier <span>YOUTUBE</span></a>
          </div>
        </section>}
      </main>
    </div>
  </>;
}
