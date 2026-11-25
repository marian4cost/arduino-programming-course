import { lessons } from './lessons';

const theory = {
  blink: {
    title: 'O primeiro sketch',
    lead: 'O Arduino executa setup() uma vez após ligar ou reiniciar. Depois, repete loop() enquanto estiver ligado.',
    details: [
      ['Configuração', 'pinMode(LED_BUILTIN, OUTPUT) prepara o pino do LED L para escrever estados digitais.'],
      ['Estado e tempo', 'digitalWrite() acende ou apaga o LED. delay() mantém o programa em espera pelo número de milissegundos informado.'],
    ],
    example: 'void setup() {\n  pinMode(LED_BUILTIN, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(LED_BUILTIN, HIGH);\n  delay(500);\n  digitalWrite(LED_BUILTIN, LOW);\n  delay(500);\n}',
    caption: 'O ciclo leva 1 segundo. Ele inclui as duas esperas de 500 ms.',
  },
  button: {
    title: 'Entrada digital e decisão',
    lead: 'Com INPUT_PULLUP, o pino D2 lê HIGH quando o botão está solto e LOW quando o botão o conecta ao GND.',
    details: [
      ['Leitura', 'digitalRead(2) consulta o estado do pino. O operador == compara o resultado com LOW.'],
      ['Condição', 'O if escolhe o que fazer quando a comparação é verdadeira. O else cobre o outro estado.'],
    ],
    example: 'pinMode(2, INPUT_PULLUP);\n\n// Dentro de loop()\nbool pressionado = digitalRead(2) == LOW;\nif (pressionado) {\n  digitalWrite(LED_BUILTIN, HIGH);\n} else {\n  digitalWrite(LED_BUILTIN, LOW);\n}',
    caption: 'Antecipe o que muda no LED se a comparação usar HIGH.',
  },
  pwm: {
    title: 'Leitura analógica e PWM',
    lead: 'O potenciômetro divide a tensão entre GND e 5 V. No Uno, analogRead(A0) representa essa leitura com um número de 0 a 1023.',
    details: [
      ['Conversão', 'map() converte a leitura de A0 para a faixa de 0 a 255 usada por analogWrite() no Uno.'],
      ['Brilho', 'No pino D9, o PWM varia a fração do tempo em HIGH. Quanto maior essa fração, maior o brilho percebido.'],
    ],
    example: '// Dentro de loop()\nint leitura = analogRead(A0);\nint pwm = map(leitura, 0, 1023, 0, 255);\nanalogWrite(9, pwm);',
    caption: 'PWM próximo de 128 mantém o pino em HIGH por cerca de metade do tempo.',
  },
  arrays: {
    title: 'Índices, vetores e for',
    lead: 'Um vetor guarda vários valores do mesmo tipo. O índice começa em zero. Neste exemplo, a posição 0 guarda o pino 8.',
    details: [
      ['Percurso', 'O for começa com i = 0, avança com i++ e para quando i chega à quantidade de elementos.'],
      ['Aplicação', 'A mesma função controla cada LED. O pino vem de leds[i] e o botão determina o tempo de cada passo.'],
    ],
    example: 'const int leds[] = {8, 9, 10};\nconst int n = sizeof(leds) / sizeof(leds[0]);\n\n// Dentro de loop()\nfor (int i = 0; i < n; i++) {\n  piscarLed(leds[i], 400);\n}',
    caption: 'Se a ordem mudar para {10, 9, 8}, o primeiro LED será o do pino D10.',
  },
};

export const slides = [
  { id: 'inicio', kind: 'cover', title: 'Programação para Arduino' },
  ...lessons.flatMap(lesson => [
    { id: lesson.id, kind: 'theory', title: theory[lesson.id].title, lesson, theory: theory[lesson.id] },
    { id: `${lesson.id}-pratica`, kind: 'practice', title: lesson.title, lesson },
    ...lesson.questions.flatMap((question, index) => {
      const questionId = `${lesson.id}-pergunta-${index + 1}`;
      return [
        { id: questionId, kind: 'question', title: `Questão ${index + 1}`, lesson, question, questionId },
        { id: `${questionId}-resposta`, kind: 'answer', title: `Resposta ${index + 1}`, lesson, question, questionId },
      ];
    }),
  ]),
  { id: 'materiais', kind: 'materials', title: 'Materiais da aula' },
];

export const chapters = lessons.map(lesson => ({
  ...lesson,
  slides: slides.filter(slide => slide.lesson?.id === lesson.id),
}));
