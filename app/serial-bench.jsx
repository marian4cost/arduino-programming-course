'use client';

import { useId, useState } from 'react';
import SketchCode from './sketch-code';
import { repetitionSketch, serialSketch } from './teaching-sketches';

export default function SerialBench({ timedExample = false }) {
  const panelId = useId();
  const [structure, setStructure] = useState('for');
  const [limit, setLimit] = useState(3);
  const [step, setStep] = useState(0);
  const finished = !timedExample && step >= limit;
  const firstVisible = Math.max(0, step - 8);
  const lines = Array.from({ length: step - firstVisible }, (_, offset) => firstVisible + offset);
  const file = timedExample ? 'monitor_serial.ino' : `repeticao_${structure}.ino`;
  const source = timedExample ? serialSketch : repetitionSketch(structure, limit);

  function changeStructure(event) {
    setStructure(event.target.value);
    setStep(0);
  }

  function changeLimit(event) {
    setLimit(Number(event.target.value));
    setStep(0);
  }

  return <article>
    <div className="page-title">
      <h1>{timedExample ? 'Leituras no Monitor Serial' : 'Passo a passo com for e while'}</h1>
      <p>{timedExample ? 'Cada clique mostra uma amostra. No Arduino, o sketch imprime sozinho a cada 500 ms.' : 'Preveja a última linha. Compare a saída das duas estruturas, inclusive quando limite é zero.'}</p>
    </div>
    <div className="workbench serial-workbench">
      <section className="card serial-card" aria-labelledby={`${panelId}-serial-heading`}>
        <div className="card-head"><h2 id={`${panelId}-serial-heading`}>Monitor Serial simulado</h2><span className="board-name">9600 baud</span></div>
        <ol className="serial-output" aria-label="Linhas recebidas">
          {lines.length === 0 && <li className="serial-empty">Aguardando dados</li>}
          {lines.map(value => <li key={value}>{timedExample ? `Leitura: ${value}` : value}</li>)}
        </ol>
        <div className="controls">
          {!timedExample && <div className="loop-settings">
            <label>Estrutura<select value={structure} onChange={changeStructure}><option value="for">for</option><option value="while">while</option></select></label>
            <label>Limite<select value={limit} onChange={changeLimit}>{Array.from({ length: 9 }, (_, value) => <option key={value}>{value}</option>)}</select></label>
          </div>}
          <p className="serial-status" role="status">{timedExample
            ? step === 0 ? 'Nenhuma linha recebida.' : `Última amostra recebida: ${step - 1}.`
            : `Teste: ${step} < ${limit} é ${finished ? 'falso. A contagem terminou.' : 'verdadeiro. O corpo pode executar.'}`}</p>
          <div className="actions">
            <button className="primary" disabled={finished} onClick={() => setStep(current => current + 1)}>{timedExample ? 'Receber próxima leitura' : 'Executar uma volta'}</button>
            {!timedExample && <button className="secondary" disabled={finished} onClick={() => setStep(limit)}>Executar até o fim</button>}
            <button className="text-button" disabled={!step} onClick={() => setStep(0)}>Reiniciar</button>
          </div>
        </div>
      </section>
      <SketchCode file={file} source={source} activeLine={timedExample ? 'Serial.println(leitura)' : 'i < limite'} liveLabel={timedExample ? 'Serial.println(leitura)' : `i = ${step}, limite = ${limit}`} />
    </div>
    <aside className="everyday"><strong>No dia a dia</strong><p>{timedExample ? 'Como um histórico de entregas, cada linha registra o próximo evento na ordem em que ocorreu.' : 'Um contador de vagas avança uma vez a cada carro e para quando atinge a lotação.'}</p></aside>
  </article>;
}
