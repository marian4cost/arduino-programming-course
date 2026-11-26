'use client';

import { useEffect, useRef } from 'react';

const traces = {
  pwm: [
    [[270, 141], [316, 141], [316, 234], [381, 234]],
    [[270, 185], [292, 185], [292, 252], [381, 252]],
    [[270, 203], [280, 203], [280, 270], [381, 270]],
    [[270, 109], [336, 109], [336, 79], [383, 79]],
    [[433, 79], [535, 79], [535, 270], [381, 270]],
  ],
  button: [
    [[270, 102], [336, 102], [336, 79], [383, 79]],
    [[433, 79], [550, 79], [550, 276], [291, 276], [291, 203], [270, 203]],
    [[270, 141], [322, 141], [322, 196], [421, 196]],
    [[270, 203], [299, 203], [299, 245], [421, 245]],
  ],
  arrays: [
    [[270, 85], [298, 85], [298, 68], [385, 68]],
    [[270, 109], [317, 109], [317, 130], [385, 130]],
    [[270, 132], [290, 132], [290, 190], [385, 190]],
    [[435, 68], [510, 68], [510, 232], [309, 232], [309, 203], [270, 203]],
    [[435, 130], [510, 130]],
    [[435, 190], [510, 190]],
    [[270, 163], [280, 163], [280, 269], [421, 269]],
    [[480, 269], [510, 269], [510, 232]],
  ],
  blink: [
    [[270, 102], [336, 102], [336, 127], [383, 127]],
    [[433, 127], [517, 127], [517, 230], [294, 230], [294, 203], [270, 203]],
  ],
};
const traceColors = {
  pwm: ['#a5a1ff', '#f9828c', '#66879b', '#4ed6f0', '#66879b'],
  button: ['#f9a995', '#66879b', '#a5a1ff', '#66879b'],
  arrays: ['#f78d9b', '#eeb65e', '#63dfae', '#66879b', '#66879b', '#66879b', '#a5a1ff', '#66879b'],
  blink: ['#f9a995', '#66879b'],
};
const pinPositions = {
  pwm: [[109, 'D9'], [141, 'A0'], [185, '5 V'], [203, 'GND']],
  button: [[102, 'D8'], [141, 'D2'], [203, 'GND']],
  arrays: [[85, 'D8'], [109, 'D9'], [132, 'D10'], [163, 'D2'], [203, 'GND']],
  blink: [[102, 'D8'], [203, 'GND']],
};

function Wires({ lesson }) {
  const canvas = useRef(null);
  useEffect(() => {
    const ctx = canvas.current.getContext('2d');
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    ctx.clearRect(0, 0, 600, 320);
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    traces[lesson].forEach((points, i) => {
      ctx.strokeStyle = traceColors[lesson][i];
      ctx.beginPath();
      points.forEach(([x, y], j) => j === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
      ctx.stroke();
    });
  }, [lesson]);
  return <canvas ref={canvas} width="1200" height="640" aria-hidden="true" />;
}

function Led({ x, y, color, level, label }) {
  return <div className="external-led" style={{ '--x': x, '--y': y, '--lamp': color, '--level': level }}>
    <span className="resistor" /><span className="lamp" /><span className="part-name">{label}</span>
  </div>;
}

export default function Diagram({ lesson, adc, pwm, ledOn, pressed, activePin, running }) {
  const state = lesson === 'pwm' ? `LED amarelo em D9 com PWM ${pwm} de 255`
    : lesson === 'arrays' ? (running ? `LED ativo no pino D${activePin}` : `LED do passo no pino D${activePin}`)
    : `LED externo em D8 ${ledOn ? 'aceso' : 'apagado'}`;
  return <figure className="diagram" aria-label={state}>
    <div className="schematic">
      <Wires lesson={lesson} />
      <div className="board" aria-hidden="true">
        <div className="usb" /><div className="barrel" /><div className="header top" /><div className="header bottom" />
        <div className="board-logo">UNO<span>ARDUINO</span></div>
        <div className="chip" /><div className="board-cap" /><div className="board-cap second" />
      </div>
      {pinPositions[lesson].map(([y, label]) => <span key={label} className="pin" style={{ '--y': y }} aria-hidden="true">{label}</span>)}
      {lesson === 'pwm' && <>
        <Led x={383} y={79} color="#ffd575" level={pwm / 255} label="LED AMARELO" />
        <div className="pot-part" aria-hidden="true">
          <div className="dial" style={{ '--angle': `${-135 + adc / 1023 * 270}deg` }}><i /></div>
          <span>POTENCIÔMETRO</span>
        </div>
      </>}
      {(lesson === 'blink' || lesson === 'button') && <Led x={383} y={lesson === 'blink' ? 127 : 79} color="#ff9b75" level={Number(ledOn)} label="LED EXTERNO" />}
      {lesson === 'button' && <div className={`switch-part ${pressed ? 'held' : ''}`} aria-hidden="true"><i /><span>BOTÃO D2</span></div>}
      {lesson === 'arrays' && <>
        <Led x={385} y={68} color="#fc7c89" level={Number(activePin === 8)} label="D8" />
        <Led x={385} y={130} color="#ffd575" level={Number(activePin === 9)} label="D9" />
        <Led x={385} y={190} color="#61e7af" level={Number(activePin === 10)} label="D10" />
        <div className={`switch-part mini ${pressed ? 'held' : ''}`} aria-hidden="true"><i /><span>BOTÃO D2</span></div>
      </>}
    </div>
  </figure>;
}
