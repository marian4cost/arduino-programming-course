export const parts = {
  uno: { name: 'Arduino Uno', terminals: [['d2', 'D2'], ['d9', 'D9 (PWM)'], ['d10', 'D10 (PWM)'], ['a0', 'A0'], ['vcc', '5 V'], ['gnd', 'GND']], position: [3, 15] },
  button: { name: 'Botão', terminals: [['a', '1'], ['b', '2']], position: [72, 66] },
  pot: { name: 'Potenciômetro', terminals: [['a', 'Extremo 1'], ['wiper', 'Centro'], ['b', 'Extremo 2']], position: [41, 62] },
  yellow: { name: 'LED amarelo', terminals: [['anode', 'Ânodo +'], ['cathode', 'Cátodo −']], position: [72, 5] },
  green: { name: 'LED verde', terminals: [['anode', 'Ânodo +'], ['cathode', 'Cátodo −']], position: [72, 35] },
  r1: { name: 'Resistor 220 Ω ①', terminals: [['a', '1'], ['b', '2']], position: [41, 5] },
  r2: { name: 'Resistor 220 Ω ②', terminals: [['a', '1'], ['b', '2']], position: [41, 35] },
};

export function terminalLabel(id) {
  const [part, pin] = id.split('.');
  return parts[part].name + ' · ' + parts[part].terminals.find(([terminal]) => terminal === pin)[1];
}

export function circuitProblem(placed, wires) {
  const missing = Object.keys(parts).filter(part => !placed[part]);
  if (missing.length) return 'Adicione à bancada: ' + missing.map(part => parts[part].name).join(', ') + '.';

  const adjacency = new Map();
  for (const [a, b] of wires) {
    adjacency.set(a, [...(adjacency.get(a) ?? []), b]);
    adjacency.set(b, [...(adjacency.get(b) ?? []), a]);
  }
  function net(terminal) {
    const visited = new Set([terminal]);
    for (const link of visited) {
      for (const next of adjacency.get(link) ?? []) visited.add(next);
    }
    return visited;
  }
  function connected(...terminals) {
    const group = net(terminals[0]);
    return group.size === terminals.length && terminals.every(terminal => group.has(terminal));
  }
  function ledBranch(pin, led) {
    return ['r1', 'r2'].find(resistor => (
      connected(pin, resistor + '.a') && connected(resistor + '.b', led + '.anode')
    ) || (
      connected(pin, resistor + '.b') && connected(resistor + '.a', led + '.anode')
    ));
  }
  if (net('uno.vcc').has('uno.gnd')) return '5 V e GND estão em curto. Remova a ligação entre eles.';
  const yellow = ledBranch('uno.d9', 'yellow');
  const green = ledBranch('uno.d10', 'green');
  if (!yellow || !green || yellow === green) return 'Ligue D9 ao ânodo amarelo e D10 ao ânodo verde, com um resistor diferente em série em cada ramo. Confira a polaridade e fios extras.';
  if (!connected('uno.a0', 'pot.wiper')) return 'Ligue o terminal central do potenciômetro somente ao A0.';
  const groundPot = connected('uno.vcc', 'pot.a') ? 'pot.b' : 'pot.a';
  const positivePot = groundPot === 'pot.a' ? 'pot.b' : 'pot.a';
  if (!connected('uno.vcc', positivePot)) return 'Ligue um dos terminais externos do potenciômetro somente ao 5 V.';
  const groundButton = connected('uno.d2', 'button.a') ? 'button.b' : 'button.a';
  const signalButton = groundButton === 'button.a' ? 'button.b' : 'button.a';
  if (!connected('uno.d2', signalButton)) return 'Ligue um terminal do botão somente ao D2.';
  if (!connected('uno.gnd', groundPot, groundButton, 'yellow.cathode', 'green.cathode')) {
    return 'Confira o GND comum: cátodos dos dois LEDs, terminal livre do botão e extremo livre do potenciômetro.';
  }
  return '';
}

export const starter = `const int botao = 2;
const int potenciometro = A0;
// Declare os pinos D9 e D10 em um vetor.

void setup() {
  // Configure os pinos e inicie a comunicação serial.
}

void loop() {
  // Leia as entradas, percorra o vetor e atualize os LEDs.
}`;
