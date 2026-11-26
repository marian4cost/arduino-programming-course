'use client';

import { useId, useRef, useState } from 'react';

export default function SketchCode({ file, source, activeLine, liveLabel }) {
  const panelId = useId();
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
    link.download = file;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <section className="card code-card" aria-labelledby={`${panelId}-code-heading`}>
    <div className="card-head"><h2 id={`${panelId}-code-heading`}><span className="symbol" aria-hidden="true">‹/›</span> Código do Arduino</h2><div className="code-actions"><button className="small-button" onClick={copy}>{copyStatus}</button><button className="small-button" onClick={download} aria-label="Baixar sketch .ino">Baixar .ino</button></div></div>
    <div className="editor">
      <div className="editor-file"><span className="symbol" aria-hidden="true">▧</span> <span>{file}</span><span className="language">C++</span></div>
      <pre ref={editor} tabIndex="0" aria-label="Sketch Arduino comentado"><code>{source.split('\n').map((line, i) => <span key={i} className={`code-line ${line.trim().startsWith('//') ? 'comment' : ''} ${activeLine && line.includes(activeLine) ? 'highlight' : ''}`}><span className="line-no" aria-hidden="true">{i + 1}</span><span>{line || ' '}</span></span>)}</code></pre>
      {liveLabel && <button className="editor-status" onClick={() => editor.current.querySelector('.highlight')?.scrollIntoView({ block: 'nearest', inline: 'nearest' })} aria-label={`Mostrar linha em destaque: ${liveLabel}`}><span className="status-dot" /><span>{liveLabel}</span></button>}
    </div>
  </section>;
}
