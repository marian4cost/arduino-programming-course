export const lessons = [
  {
    id: 'blink', icon: 'led', label: 'Primeiro LED', concept: 'Saída digital',
    title: 'Primeiro LED',
    description: 'Altere o intervalo e acompanhe os estados HIGH e LOW no LED L da placa.',
    file: 'blink.ino',
    everyday: 'Um indicador de máquina em funcionamento pode piscar para chamar a atenção.',
    wiring: 'O LED L já faz parte do Uno. O sketch usa LED_BUILTIN, que referencia o pino digital 13.',
    challenge: 'Preveja quanto dura um ciclo com 200 ms. Ajuste o controle e verifique se cada ciclo tem duas esperas.',
  },
  {
    id: 'button', icon: 'button', label: 'Botão digital', concept: 'Entrada digital',
    title: 'Botão digital',
    description: 'Pressione o botão virtual e compare a leitura do pino D2 com o estado do LED L.',
    file: 'botao.ino',
    everyday: 'O botão de um elevador informa um pedido. Uma lâmpada separada confirma que o pedido foi registrado.',
    wiring: 'Ligue o botão entre D2 e GND, usando terminais de lados opostos do botão. O pull-up interno mantém D2 em HIGH quando o botão está solto.',
    challenge: 'Preveja o que acontece ao inverter LOW e HIGH na comparação. Explique por que pressionar o botão pode apagar o LED nessa versão.',
  },
  {
    id: 'pwm', icon: 'knob', label: 'Potenciômetro e PWM', concept: 'Entrada analógica',
    title: 'Potenciômetro e PWM',
    description: 'Gire o potenciômetro e observe como a leitura analógica muda o brilho de um LED.',
    file: 'potenciometro_pwm.ino',
    everyday: 'O controle giratório de um abajur com dimmer ajusta o brilho conforme sua posição.',
    wiring: 'Ligue as extremidades do potenciômetro a 5 V e GND e o terminal central ao A0. Ligue D9 ao ânodo do LED por um resistor de 220 a 330 Ω e o cátodo ao GND.',
    challenge: 'Teste o mínimo, o meio e o máximo do potenciômetro. Compare a leitura de A0 com o valor enviado ao PWM de D9.',
  },
  {
    id: 'arrays', icon: 'layers', label: 'Sequência com vetores', concept: 'Vetores e repetição',
    title: 'Sequência com vetores',
    description: 'Mude a ordem dos pinos e acompanhe o índice do vetor que acende cada LED.',
    file: 'sequencia.ino',
    everyday: 'Num painel de avisos, uma sequência de lâmpadas pode indicar a ordem das etapas de um processo.',
    wiring: 'Ligue D8, D9 e D10 aos três LEDs. Coloque um resistor de 220 a 330 Ω em série por LED com os cátodos no GND. Ligue o botão de ritmo entre D2 e GND.',
    challenge: 'Inverta o vetor e explique por que o primeiro LED muda. Pressione o botão para testar o ritmo de 150 ms.',
  },
];

const ledNames = { 8: 'ledVermelho', 9: 'ledAmarelo', 10: 'ledVerde' };
export const defaultPins = [8, 9, 10];
export const pwmFromAdc = (adc) => Math.trunc(adc * 255 / 1023);

export function sketch(id, milliseconds, pins, inverted = false) {
  if (id === 'blink') return `const int led = LED_BUILTIN;
const int tempoMs = ${milliseconds};

void setup() {
  // Configura o LED L como saída.
  pinMode(led, OUTPUT);
}

void loop() {
  // HIGH acende o LED durante tempoMs.
  digitalWrite(led, HIGH);
  delay(tempoMs);

  // LOW apaga o LED pelo mesmo tempo.
  digitalWrite(led, LOW);
  delay(tempoMs);
}`;

  if (id === 'button') return `const int botao = 2;
const int led = LED_BUILTIN;

void setup() {
  // Com o botão solto, D2 lê HIGH.
  pinMode(botao, INPUT_PULLUP);
  pinMode(led, OUTPUT);
}

void loop() {
  // Ao pressionar, D2 é ligado ao GND.
  bool acender = digitalRead(botao) == ${inverted ? 'HIGH' : 'LOW'};
  if (acender) {
    digitalWrite(led, HIGH);
  } else {
    digitalWrite(led, LOW);
  }
}`;

  if (id === 'pwm') return `const int potenciometro = A0;
const int led = 9;  // LED amarelo em um pino PWM do Uno.
const unsigned long taxaSerial = 9600;
const unsigned long intervaloMs = 50;

void setup() {
  pinMode(led, OUTPUT);
  Serial.begin(taxaSerial);
}

void loop() {
  // Leitura analógica de 0 a 1023.
  int leitura = analogRead(potenciometro);
  // Converte a faixa da entrada para 0 a 255.
  int pwm = map(leitura, 0, 1023, 0, 255);
  // Ajusta a fração do tempo em HIGH.
  analogWrite(led, pwm);
  Serial.println(leitura);
  delay(intervaloMs);
}`;

  return `const int ledVermelho = 8;
const int ledAmarelo = 9;
const int ledVerde = 10;
const int leds[] = {${pins.map(pin => ledNames[pin]).join(', ')}};
// Bytes do vetor divididos pelos bytes de um elemento.
const size_t quantidade = sizeof(leds) / sizeof(leds[0]);
const int botao = 2;
const int tempoNormalMs = 400;
const int tempoRapidoMs = 150;

void piscarLed(int pino, int tempoMs) {
  digitalWrite(pino, HIGH);
  delay(tempoMs);
  digitalWrite(pino, LOW);
}

void setup() {
  pinMode(botao, INPUT_PULLUP);
  // Configura cada pino guardado no vetor.
  for (size_t i = 0; i < quantidade; i++) {
    pinMode(leds[i], OUTPUT);
  }
}

void loop() {
  // i percorre os índices de 0 até quantidade - 1.
  for (size_t i = 0; i < quantidade; i++) {
    // Lê o botão no início de cada passo.
    int tempoMs = tempoNormalMs;
    if (digitalRead(botao) == LOW) {
      tempoMs = tempoRapidoMs;
    }
    piscarLed(leds[i], tempoMs);
  }
}`;
}
