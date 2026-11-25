export const lessons = [
  {
    id: 'blink', icon: 'led', label: 'Primeiro LED', concept: 'Saída digital',
    title: 'Primeiro LED',
    description: 'Altere o intervalo e acompanhe os estados HIGH e LOW no LED L da placa.',
    file: 'blink.ino',
    wiring: 'O LED L já faz parte do Uno. O sketch usa LED_BUILTIN, que referencia o pino digital 13.',
    challenge: 'Preveja quanto dura um ciclo com 200 ms. Ajuste o controle e verifique se cada ciclo tem duas esperas.',
    questions: [
      ['Qual função executa uma vez quando o Arduino é reiniciado?', ['loop()', 'setup()', 'delay()'], 1, 'setup() configura a placa uma vez a cada inicialização.'],
      ['Se cada espera dura 200 ms, quanto dura um ciclo completo?', ['200 ms', '400 ms', '800 ms'], 1, 'Há uma espera enquanto o LED está aceso e outra enquanto está apagado.'],
    ],
  },
  {
    id: 'button', icon: 'button', label: 'Botão digital', concept: 'Entrada digital',
    title: 'Botão digital',
    description: 'Pressione o botão virtual e compare a leitura do pino D2 com o estado do LED L.',
    file: 'botao.ino',
    wiring: 'Ligue o botão entre D2 e GND, usando terminais de lados opostos do botão. O pull-up interno mantém D2 em HIGH quando o botão está solto.',
    challenge: 'Preveja o que acontece ao inverter LOW e HIGH na comparação. Explique por que pressionar o botão pode apagar o LED nessa versão.',
    questions: [
      ['Qual é o valor lido em D2 com o botão solto e INPUT_PULLUP?', ['HIGH', 'LOW', 'Depende do LED'], 0, 'O resistor interno de pull-up mantém a entrada em HIGH.'],
      ['Qual operador compara dois valores no sketch?', ['=', '==', '++'], 1, '== compara dois valores. = atribui um valor a uma variável.'],
    ],
  },
  {
    id: 'pwm', icon: 'knob', label: 'Potenciômetro e PWM', concept: 'Entrada analógica',
    title: 'Potenciômetro e PWM',
    description: 'Gire o potenciômetro e observe como a leitura analógica muda o brilho de um LED.',
    file: 'potenciometro_pwm.ino',
    wiring: 'Ligue as extremidades do potenciômetro a 5 V e GND e o terminal central ao A0. Ligue D9 ao ânodo do LED por um resistor de 220 a 330 Ω e o cátodo ao GND.',
    challenge: 'Teste o mínimo, o meio e o máximo do potenciômetro. Compare a leitura de A0 com o valor enviado ao PWM de D9.',
    questions: [
      ['Qual é a faixa de leituras de analogRead() no Uno?', ['0 a 255', '0 a 1023', '0 a 5'], 1, 'O conversor analógico do Uno tem 10 bits, o que resulta em 1024 valores.'],
      ['O que aumenta quando o valor de PWM vai de 64 a 192?', ['A tensão de pico de D9', 'O tempo relativo em HIGH', 'O valor da resistência'], 1, 'PWM mantém a amplitude e altera a fração do tempo em que o pino fica em HIGH.'],
    ],
  },
  {
    id: 'arrays', icon: 'layers', label: 'Sequência com vetores', concept: 'Vetores e repetição',
    title: 'Sequência com vetores',
    description: 'Mude a ordem dos pinos e acompanhe o índice do vetor que acende cada LED.',
    file: 'sequencia.ino',
    wiring: 'Ligue D8, D9 e D10 aos três LEDs. Coloque um resistor de 220 a 330 Ω em série por LED com os cátodos no GND. Ligue o botão de ritmo entre D2 e GND.',
    challenge: 'Inverta o vetor e explique por que o primeiro LED muda. Pressione o botão para testar o ritmo de 150 ms.',
    questions: [
      ['Em {8, 9, 10}, qual expressão retorna 10?', ['leds[3]', 'leds[2]', 'leds[10]'], 1, 'Os índices começam em zero. O terceiro elemento fica no índice 2.'],
      ['Qual condição percorre um vetor de n elementos a partir de i = 0?', ['i <= n', 'i > n', 'i < n'], 2, 'O último índice válido é n − 1. Quando i chega a n, o laço termina.'],
    ],
  },
];

export const defaultPins = [8, 9, 10];
export const pwmFromAdc = (adc) => Math.trunc(adc * 255 / 1023);

export function sketch(id, milliseconds, pins) {
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
  bool pressionado = digitalRead(botao) == LOW;
  if (pressionado) {
    digitalWrite(led, HIGH);
  } else {
    digitalWrite(led, LOW);
  }
}`;

  if (id === 'pwm') return `const int potenciometro = A0;
const int led = 9;  // Pino com PWM no Uno.

void setup() {
  pinMode(led, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  // Leitura analógica de 0 a 1023.
  int leitura = analogRead(potenciometro);
  // Converte a faixa da entrada para 0 a 255.
  int pwm = map(leitura, 0, 1023, 0, 255);
  // Ajusta a fração do tempo em HIGH.
  analogWrite(led, pwm);
  Serial.println(leitura);
  delay(50);
}`;

  return `const int leds[] = {${pins.join(', ')}};
const int n = sizeof(leds) / sizeof(leds[0]);
const int botao = 2;

void piscarLed(int pino, int tempoMs) {
  digitalWrite(pino, HIGH);
  delay(tempoMs);
  digitalWrite(pino, LOW);
}

void setup() {
  pinMode(botao, INPUT_PULLUP);
  // Configura cada pino guardado no vetor.
  for (int i = 0; i < n; i++) {
    pinMode(leds[i], OUTPUT);
  }
}

void loop() {
  // i percorre os índices de 0 a n - 1.
  for (int i = 0; i < n; i++) {
    // Lê o botão no início de cada passo.
    int tempoMs = 400;
    if (digitalRead(botao) == LOW) {
      tempoMs = 150;
    }
    piscarLed(leds[i], tempoMs);
  }
}`;
}
