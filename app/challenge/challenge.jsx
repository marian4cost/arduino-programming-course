'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { circuitProblem, parts, starter, terminalLabel } from './circuit';
import { startSketch } from './sketch';

const wiresColors = ['#a2abff', '#ebbb76', '#7ad4ae', '#e990a9', '#88c9ef', '#d9a9fb'];
const emptyBoard = { uno: parts.uno.position };
const initial = { source: starter, placed: emptyBoard, wires: [] };
const storageKey = 'arduino-lab-desafio-v1';

function WireCanvas({ area, placed, wires }) {
  const canvas = useRef(null);
  useEffect(() => {
    const draw = () => {
      const surface = area.current;
      const layer = canvas.current;
      if (!surface || !layer) return;
      const bounds = surface.getBoundingClientRect();
      const width = surface.clientWidth;
      const height = surface.clientHeight;
      const ratio = window.devicePixelRatio || 1;
      const scaleX = bounds.width / width;
      const scaleY = bounds.height / height;
      layer.width = Math.round(width * ratio);
      layer.height = Math.round(height * ratio);
      const painter = layer.getContext('2d');
      painter.scale(ratio, ratio);
      painter.lineWidth = 3;
      const endpoints = new Map(Array.from(surface.querySelectorAll('[data-terminal]'), terminal => {
        const box = terminal.getBoundingClientRect();
        return [terminal.dataset.terminal, [
          (box.left + box.width / 2 - bounds.left) / scaleX,
          (box.top + box.height / 2 - bounds.top) / scaleY,
        ]];
      }));
      wires.forEach(([first, second], index) => {
        const [x1, y1] = endpoints.get(first);
        const [x2, y2] = endpoints.get(second);
        const center = (x1 + x2) / 2;
        painter.strokeStyle = wiresColors[index % wiresColors.length];
        painter.beginPath();
        painter.moveTo(x1, y1);
        painter.bezierCurveTo(center, y1, center, y2, x2, y2);
        painter.stroke();
      });
    };
    draw();
    const size = new ResizeObserver(draw);
    size.observe(area.current);
    return () => size.disconnect();
  }, [area, placed, wires]);
  return <canvas className="challenge-wires" ref={canvas} aria-hidden="true" />;
}

export default function Challenge({ active }) {
  const uid = useId();
  const [draft, setDraft] = useState(initial);
  const [restored, setRestored] = useState(false);
  const [tab, setTab] = useState('circuit');
  const [selected, setSelected] = useState(null);
  const [adc, setAdc] = useState(512);
  const [pressed, setPressed] = useState(false);
  const [outputs, setOutputs] = useState({});
  const [serial, setSerial] = useState('');
  const [baud, setBaud] = useState(null);
  const [running, setRunning] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const area = useRef(null);
  const timeout = useRef(null);
  const inputs = useRef({ adc, pressed });
  const { placed, wires, source } = draft;

  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(storageKey));
      if (saved && typeof saved.source === 'string' && saved.placed?.uno && Array.isArray(saved.wires)) setDraft(saved);
    } catch {
      // The challenge remains usable when storage is disabled.
    }
    setRestored(true);
    return () => window.clearTimeout(timeout.current);
  }, []);
  useEffect(() => {
    if (restored) {
      try { sessionStorage.setItem(storageKey, JSON.stringify(draft)); } catch {}
    }
  }, [draft, restored]);
  useEffect(() => {
    if (!active) {
      window.clearTimeout(timeout.current);
      setRunning(false);
    }
  }, [active]);

  function stop() {
    window.clearTimeout(timeout.current);
    setRunning(false);
  }
  function edit(patch) {
    stop();
    setOutputs({});
    setFeedback(null);
    setDraft(current => ({ ...current, ...patch }));
  }
  function place(part, position = parts[part].position) {
    edit({ placed: { ...placed, [part]: position } });
  }
  function dragPart(event, part) {
    event.dataTransfer.setData('application/arduino-part', part);
    event.dataTransfer.effectAllowed = 'move';
  }
  function dropPart(event) {
    event.preventDefault();
    const part = event.dataTransfer.getData('application/arduino-part');
    if (!Object.hasOwn(parts, part)) return;
    const box = area.current.getBoundingClientRect();
    const left = (event.clientX - box.left) / box.width * 100 - 9;
    const top = (event.clientY - box.top) / box.height * 100 - 6;
    const limit = part === 'uno' ? 38 : 64;
    place(part, [Math.max(1, Math.min(78, left)), Math.max(1, Math.min(limit, top))]);
  }
  function wire(terminal) {
    if (!selected || selected === terminal) {
      setSelected(selected === terminal ? null : terminal);
      return;
    }
    const exists = wires.some(pair => pair.includes(selected) && pair.includes(terminal));
    if (exists) setFeedback({ text: 'Esses terminais já estão ligados.', ok: false });
    else edit({ wires: [...wires, [selected, terminal]] });
    setSelected(null);
  }
  function check() {
    const error = circuitProblem(placed, wires);
    setFeedback({ text: error || 'Montagem conferida. Execute o sketch para testar o comportamento.', ok: !error });
    return !error;
  }
  function simulate() {
    stop();
    if (!check()) return;
    setOutputs({});
    setSerial('');
    setBaud(null);
    try {
      const tick = startSketch(source, {
        read: () => inputs.current,
        write: (pin, value) => setOutputs(current => ({ ...current, [pin]: value })),
        baud: setBaud,
        print: text => setSerial(current => (current + text).slice(-2500)),
      });
      setRunning(true);
      setFeedback({ text: 'Simulação em execução. Teste com o botão e o potenciômetro.', ok: true });
      function run() {
        try { timeout.current = window.setTimeout(run, tick()); }
        catch (error) {
          stop();
          setFeedback({ text: error.message, ok: false });
        }
      }
      run();
    } catch (error) {
      setFeedback({ text: error.message, ok: false });
    }
  }
  function download() {
    const url = URL.createObjectURL(new Blob([source], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'desafio_arduino.ino';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return <article className="challenge">
    <div className="page-title">
      <h1>Desafio final: painel de sinalização</h1>
      <p>Monte e programe um painel com dois LEDs externos, um botão e um potenciômetro.</p>
    </div>
    <details className="challenge-rules" open>
      <summary>Enunciado e critérios</summary>
      <ol>
        <li>Ligue o LED amarelo ao <strong>D9</strong> e o verde ao <strong>D10</strong>. Coloque um resistor em série em cada LED. Use o <strong>D2</strong> com <code>INPUT_PULLUP</code> no botão e o <strong>A0</strong> no terminal central do potenciômetro.</li>
        <li>Com o botão solto, mantenha os LEDs apagados. Ao pressionar, percorra um vetor com os dois pinos, acenda um LED por vez e use a leitura do potenciômetro para ajustar o brilho de 0 a 255.</li>
        <li>Mostre a leitura e o pino ativo no Monitor Serial a <strong>9600 baud</strong>. Teste os extremos do potenciômetro e solte o botão para verificar a saída.</li>
      </ol>
      <p><strong>No dia a dia:</strong> um painel de teste pode indicar a ordem das saídas e permitir ajustar a intensidade de cada sinal.</p>
    </details>
    <div className="challenge-toolbar">
      <div className="actions" role="group" aria-label="Área de trabalho">
        <button className={tab === 'circuit' ? 'primary' : 'secondary'} aria-pressed={tab === 'circuit'} onClick={() => setTab('circuit')}>Circuito</button>
        <button className={tab === 'code' ? 'primary' : 'secondary'} aria-pressed={tab === 'code'} onClick={() => setTab('code')}>Código Arduino</button>
      </div>
      <div className="actions">
        <button className="secondary" onClick={check}>Conferir montagem</button>
        <button className="primary" onClick={running ? () => {
          stop();
          setOutputs({});
          setFeedback({ text: 'Simulação parada.', ok: true });
        } : simulate}>{running ? 'Parar simulação' : 'Executar simulação'}</button>
      </div>
    </div>
    {feedback && <p role="status" className={`challenge-feedback ${feedback.ok ? 'ok' : 'problem'}`}>{feedback.text}</p>}
    {tab === 'circuit' ? <section aria-label="Montagem do circuito">
      <p className="challenge-help">Arraste as peças para a bancada ou clique para adicioná-las. Para passar um fio, clique nos dois terminais. Arraste pelo nome para mover uma peça já montada.</p>
      <div className="challenge-parts">
        {Object.entries(parts).filter(([id]) => !placed[id]).map(([id, part]) =>
          <button key={id} className="secondary" draggable onDragStart={event => dragPart(event, id)} onClick={() => place(id)}>{part.name}</button>
        )}
        <button className="text-button" onClick={() => { setSelected(null); edit({ placed: emptyBoard, wires: [] }); }}>Limpar montagem</button>
      </div>
      <div className="challenge-scroll">
        <div className="challenge-board" ref={area} onDragOver={event => { if (event.dataTransfer.types.includes('application/arduino-part')) event.preventDefault(); }} onDrop={dropPart}>
          <WireCanvas area={area} placed={placed} wires={wires} />
          {Object.entries(placed).map(([id, [left, top]]) => {
            const part = parts[id];
            const intensity = id === 'yellow' ? outputs[9] : id === 'green' ? outputs[10] : 0;
            return <section className={`challenge-part part-${id}`} key={id} style={{ left: left + '%', top: top + '%' }}>
              <div className="part-handle" draggable onDragStart={event => dragPart(event, id)}>
                {(id === 'yellow' || id === 'green') && <i className="challenge-lamp" aria-hidden="true" style={{ '--strength': (intensity || 0) / 255 }} />}
                {part.name}
              </div>
              <div className="challenge-terminals">
                {part.terminals.map(([pin, label]) => {
                  const terminal = id + '.' + pin;
                  return <button key={pin} data-terminal={terminal} aria-label={terminalLabel(terminal)} aria-pressed={selected === terminal} onClick={() => wire(terminal)}>{label}</button>;
                })}
              </div>
            </section>;
          })}
        </div>
      </div>
      <p className="challenge-help">{selected ? 'Primeiro terminal: ' + terminalLabel(selected) + '. Escolha o outro.' : 'Selecione um terminal para começar um fio.'}</p>
      {wires.length > 0 && <details className="challenge-wire-list"><summary>Fios conectados ({wires.length})</summary>
        <ul>{wires.map(([a, b], index) => <li key={a + b}><span>{terminalLabel(a)} ↔ {terminalLabel(b)}</span><button className="text-button" onClick={() => edit({ wires: wires.filter((_, i) => i !== index) })}>Remover fio {index + 1}</button></li>)}</ul>
      </details>}
    </section> : <section className="challenge-code" aria-label="Editor do sketch">
      <div className="challenge-toolbar"><label htmlFor={uid + '-code'}><strong>Sketch Arduino</strong></label><button className="secondary" onClick={download}>Baixar .ino</button></div>
      <textarea id={uid + '-code'} value={source} onChange={event => edit({ source: event.target.value })} spellCheck={false} maxLength={16000} rows={17} />
      <p className="challenge-help">O simulador executa o subconjunto usado em aula, com variáveis, vetores, <code>sizeof</code>, comparações, <code>if</code>, <code>for</code>, <code>while</code>, leituras, PWM e Serial. Para bibliotecas ou outros recursos do Arduino, use o arquivo <code>.ino</code> na IDE.</p>
    </section>}
    <div className="challenge-test">
      <section className="card controls" aria-label="Entradas e saídas do desafio">
        <div className="control-label"><label htmlFor={uid + '-pot'}>Potenciômetro A0</label><output>{adc}</output></div>
        <input id={uid + '-pot'} type="range" min="0" max="1023" value={adc} style={{ '--fill': adc / 1023 * 100 + '%' }} onChange={event => {
          const next = Number(event.target.value);
          inputs.current = { ...inputs.current, adc: next };
          setAdc(next);
        }} />
        <div className="actions"><button className="secondary" aria-pressed={pressed} onClick={() => {
          inputs.current = { ...inputs.current, pressed: !pressed };
          setPressed(!pressed);
        }}>{pressed ? 'Soltar botão D2' : 'Pressionar botão D2'}</button></div>
        <dl className="measurements"><div><dt>LED amarelo · D9</dt><dd>{outputs[9] ?? 0}<span> / 255</span></dd></div><div><dt>LED verde · D10</dt><dd>{outputs[10] ?? 0}<span> / 255</span></dd></div></dl>
      </section>
      <section className="card controls" aria-label="Monitor Serial do desafio">
        <div className="control-label"><strong>Monitor Serial</strong><span>{baud === null ? 'Aguardando' : baud + ' baud'}</span></div>
        <pre className="challenge-serial" tabIndex="0" aria-label="Saída do Monitor Serial">{serial || 'Sem mensagens'}</pre>
      </section>
    </div>
  </article>;
}
