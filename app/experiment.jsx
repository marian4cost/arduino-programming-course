'use client';

import { useEffect, useEffectEvent, useRef, useState } from 'react';
import Diagram from './diagram';
import { defaultPins, pwmFromAdc, sketch } from './lessons';

const symbols = {
  chip: '▦', led: '◇', button: '⏻', knob: '◉', layers: '▤',
  quiz: '?', file: '▧', code: '‹/›', circuit: '⌁', play: '▶', pause: 'Ⅱ',
};

function Icon({ type }) {
  return <span className={`symbol symbol-${type}`} aria-hidden="true">{symbols[type]}</span>;
}

function LiveCode({ lesson, source, activeLine, liveLabel }) {
  const [copiedSource, setCopiedSource] = useState(null);
  const [copyFailed, setCopyFailed] = useState(false);
  const editor = useRef(null);
  const copyStatus = copiedSource === source ? 'Copiado' : copyFailed ? 'Selecione o código' : 'Copiar';
  async function copy() {
    try {
      await navigator.clipboard.writeText(source);
      setCopiedSource(source);
      setCopyFailed(false);
    } catch {
      setCopyFailed(true);
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
    <div className="card-head"><h2 id="code-heading"><Icon type="code" /> Código do Arduino</h2><div className="code-actions"><button className="small-button" onClick={copy}>{copyStatus}</button><button className="small-button" onClick={download} aria-label="Baixar sketch .ino">Baixar .ino</button></div></div>
    <div className="editor">
      <div className="editor-file"><Icon type="file" /> <span>{lesson.file}</span><span className="language">C++</span></div>
      <pre ref={editor} tabIndex="0" aria-label="Sketch Arduino comentado"><code>{source.split('\n').map((line, i) => <span key={i} className={`code-line ${line.trim().startsWith('//') ? 'comment' : ''} ${line.trim() && line.includes(activeLine) ? 'highlight' : ''}`}><span className="line-no" aria-hidden="true">{i + 1}</span><span>{line || ' '}</span></span>)}</code></pre>
      <button className="editor-status" onClick={() => editor.current.querySelector('.highlight')?.scrollIntoView({ block: 'nearest', inline: 'nearest' })} aria-label={`Mostrar linha em destaque: ${liveLabel}`}><span className="status-dot" /><span>{liveLabel}</span></button>
    </div>
  </section>;
}

export default function Experiment({ lesson }) {
  const [adc, setAdc] = useState(640);
  const [milliseconds, setMilliseconds] = useState(500);
  const [pins, setPins] = useState(defaultPins);
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [inverted, setInverted] = useState(false);
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
    setInverted(false);
    setPins(defaultPins);
    setPeriod(400);
  }

  const pwm = pwmFromAdc(adc);
  const duty = Math.round(pwm * 100 / 255);
  const selectedIndex = step % pins.length;
  const activePin = pins[selectedIndex];
  const builtin = (isBlink && step % 2 === 0) || (isButton && pressed !== inverted);
  const activeLine = isPwm ? 'analogWrite(led, pwm)' : isArray ? 'piscarLed(leds[i], tempoMs)' : `digitalWrite(led, ${builtin ? 'HIGH' : 'LOW'})`;
  const liveLabel = isPwm ? `analogWrite(9, ${pwm})` : isArray ? `leds[${selectedIndex}] = ${activePin}` : `digitalWrite(led, ${builtin ? 'HIGH' : 'LOW'})`;

  return <>
    <div className="page-title">
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
            {isButton && <button className="secondary" aria-pressed={inverted} onClick={() => setInverted(!inverted)}>{inverted ? 'Restaurar comparação' : 'Inverter comparação'}</button>}
            {isArray && <button className="secondary" onClick={() => { setPins([...pins].reverse()); setStep(0); }}>Inverter vetor</button>}
          </div>}
          {isButton && <dl className="measurements" aria-live="polite"><div><dt>Entrada D2</dt><dd>{pressed ? 'LOW' : 'HIGH'}</dd></div><div><dt>LED L</dt><dd>{builtin ? 'Aceso' : 'Apagado'}</dd></div></dl>}
          {isArray && <><div className="array-values" aria-label="Vetor de pinos">{pins.map((pin, i) => <div className={i === selectedIndex ? 'selected' : ''} key={pin}><span>índice {i}</span><strong>D{pin}</strong></div>)}</div><p className="period">Passo atual de {period} ms</p></>}
          {timed && <div className="actions transport">
            <button className="primary" onClick={() => setRunning(!running)}><Icon type={running ? 'pause' : 'play'} />{running ? 'Pausar' : 'Executar'}</button>
            <button className="secondary" disabled={running} onClick={() => setStep(step + 1)}>Próximo passo</button>
            <button className="text-button" onClick={reset}>Reiniciar</button>
          </div>}
        </div>
      </section>
      <LiveCode lesson={lesson} source={sketch(id, milliseconds, pins, inverted)} activeLine={activeLine} liveLabel={liveLabel} />
    </div>
    <section className="card practice" aria-labelledby="practice-title">
      <div><h2 id="practice-title">Teste em aula</h2><p>{lesson.challenge}</p></div>
      <details><summary>Montagem na bancada</summary><p>{lesson.wiring}</p></details>
    </section>
  </>;
}
