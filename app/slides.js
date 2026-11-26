import { defaultPins, lessons, sketch } from './lessons';
import { questions } from './questions';
import { conditionSketch, repetitionSketch, reverseSketch, serialSketch, variablesSketch } from './teaching-sketches';

const experiments = Object.fromEntries(lessons.map(lesson => [lesson.id, lesson]));
const example = id => sketch(id, 500, defaultPins);

const course = [
  {
    id: 'basics',
    title: 'Como a placa percebe e reage',
    summary: 'Entradas, saídas e estados digitais antes do primeiro sketch. Revisão de variáveis.',
    slides: [
      {
        id: 'entradas-saidas',
        title: 'Entradas e saídas',
        lead: 'O Arduino recebe informações pelas entradas, aplica uma regra e comanda uma saída.',
        details: [
          ['Entrada', 'Um botão informa se alguém o apertou. Um sensor pode informar um valor, como a intensidade da luz.'],
          ['Saída', 'O programa pode acender um LED, ligar um buzzer ou enviar uma mensagem ao computador.'],
        ],
        table: {
          headers: ['Entrada', 'Regra', 'Saída'],
          rows: [['Botão apertado', 'Se apertar, tocar', 'Campainha toca']],
        },
        everyday: 'Uma campainha recebe o toque no botão e responde com som. Quem aperta o botão fornece a informação.',
      },
      {
        id: 'high-low',
        title: 'O que HIGH e LOW significam',
        lead: 'Um pino em modo digital reconhece dois níveis lógicos. Em um Uno clássico, ao escrever uma saída, HIGH fica perto de 5 V e LOW perto de 0 V em relação ao GND.',
        details: [
          ['Na entrada', 'A placa classifica a tensão medida como HIGH ou LOW. Tensões intermediárias próximas aos limites podem dar uma leitura indefinida.'],
          ['Na saída', 'O código escolhe o nível do pino. Com um LED externo ligado entre D8 e GND por um resistor, HIGH acende e LOW apaga. A ligação do circuito define o que cada nível faz.'],
        ],
        table: {
          headers: ['Nível', 'Saída digital no Uno', 'LED externo em D8'],
          rows: [['HIGH', 'Perto de 5 V', 'Aceso'], ['LOW', 'Perto de 0 V', 'Apagado']],
        },
        everyday: 'Uma placa de aberto ou fechado comunica dois estados. Você precisa saber qual estado está associado a cada posição da placa.',
      },
      {
        id: 'variaveis',
        title: 'Variáveis, constantes e tipos',
        lead: 'Uma variável guarda um valor que o programa pode atualizar. O tipo define que valor ela pode guardar. Use const para um valor que deve ficar fixo.',
        details: [
          ['Números', 'int guarda inteiros, como uma contagem. float guarda valores com parte decimal, como 0,5 segundo. No código, escrevemos 0.5f.'],
          ['Estados e caracteres', 'bool guarda true ou false. char guarda um caractere, como a letra A entre aspas simples.'],
        ],
        code: variablesSketch,
        file: 'variaveis.ino',
        caption: 'O sketch inteiro roda em um Uno sem componentes extras. O próximo assunto mostra como ver os valores no Monitor Serial.',
        everyday: 'Num painel de elevador, o andar pode ser um int, o tempo de espera um float, a porta aberta um bool e o bloco do prédio um char.',
      },
    ],
  },
  {
    id: 'serial',
    title: 'Monitor Serial',
    summary: 'Como acompanhar mensagens e valores enviados pelo Arduino ao computador.',
    slides: [
      {
        id: 'monitor-serial',
        title: 'Como usar o Monitor Serial',
        lead: 'O Monitor Serial da Arduino IDE mostra os dados que a placa envia ao computador. Ele ajuda a observar valores enquanto o programa roda.',
        details: [
          ['Conexão', 'Carregue o sketch, abra o Monitor Serial na Arduino IDE e configure 9600 baud, a mesma velocidade de Serial.begin(9600).'],
          ['Linhas', 'Serial.print mantém o cursor na mesma linha. Serial.println encerra a linha depois de escrever o valor.'],
        ],
        code: serialSketch,
        file: 'monitor_serial.ino',
        caption: 'A cada 500 ms, o Uno imprime Leitura: seguido do valor atual do contador.',
        everyday: 'É como o visor de uma máquina de lavar que informa a etapa atual. Você acompanha o que acontece sem abrir a máquina.',
      },
      { id: 'serial-pratica', kind: 'serial', title: 'Leituras no Monitor Serial' },
    ],
  },
  {
    id: 'blink',
    title: 'Primeiro LED',
    summary: 'Estrutura de um sketch, saída digital e tempo de pisca.',
    slides: [
      {
        id: 'blink',
        title: 'O primeiro sketch',
        lead: 'O Arduino executa setup() uma vez após ligar ou reiniciar. Depois repete loop() enquanto estiver ligado.',
        details: [
          ['Configuração', 'pinMode prepara o pino indicado pela constante led como saída. A constante led identifica D8, ligado ao LED externo por um resistor em série.'],
          ['Estado e tempo', 'digitalWrite altera o nível da saída. delay mantém o estado pelo número de milissegundos informado antes de ir à próxima instrução.'],
        ],
        code: example('blink'),
        file: experiments.blink.file,
        caption: 'Cada ciclo dura 1 segundo, com 500 ms aceso e 500 ms apagado.',
        everyday: 'Um sinalizador piscante na estrada alterna luz e pausa para chamar atenção com um ritmo constante.',
      },
      { id: 'blink-pratica', kind: 'practice', title: 'Primeiro LED', lesson: experiments.blink },
    ],
  },
  {
    id: 'button',
    title: 'Botão e condições',
    summary: 'Por que usar INPUT_PULLUP e como if, else if e else escolhem o que executar.',
    slides: [
      {
        id: 'button',
        title: 'INPUT ou INPUT_PULLUP?',
        lead: 'Os dois modos leem um pino. INPUT_PULLUP liga um resistor interno para definir a leitura quando o botão está solto.',
        details: [
          ['INPUT', 'A entrada fica em alta impedância e precisa de um sinal definido. Com um botão aberto e sem resistor de pull-up ou pull-down, pode ficar flutuando e sofrer interferência.'],
          ['INPUT_PULLUP', 'O resistor interno mantém o pino em HIGH com o botão aberto. Ao apertar um botão ligado entre D2 e GND, o pino vai a LOW. Usamos esse modo para dispensar o resistor externo nesse circuito.'],
        ],
        table: {
          headers: ['Montagem do botão entre D2 e GND', 'Solto', 'Pressionado'],
          rows: [['INPUT sem resistor externo', 'Indefinido', 'LOW'], ['INPUT_PULLUP', 'HIGH', 'LOW']],
        },
        everyday: 'Pense numa mola que devolve um interruptor à posição de repouso. O resistor define a posição padrão. O botão pressionado muda esse estado.',
      },
      {
        id: 'condicoes',
        title: 'Decisões com if, else if e else',
        lead: 'O if executa um bloco quando a condição é verdadeira. Cada else if testa outra condição se a anterior falhar. O else cobre o caso restante.',
        details: [
          ['Ordem dos testes', 'Com leitura 200, o primeiro bloco executa. Com 500, o primeiro falha e o segundo executa. Com 800, ambos falham e o else executa.'],
          ['Operadores', 'Use < para comparar limites, == para testar igualdade e = para guardar um valor. No botão da bancada, digitalRead(botao) == LOW é o teste de pressionado.'],
        ],
        code: conditionSketch,
        file: 'condicoes.ino',
        caption: 'Para testar os três casos, ligue um potenciômetro com o terminal central em A0 e as extremidades em 5 V e GND. Ligue D8 ao ânodo de um LED externo por um resistor de 220 a 330 Ω e o cátodo ao GND. O LED acende abaixo do limite de escuro.',
        everyday: 'Uma luminária automática pode acender no escuro, sinalizar meia-luz e ficar apagada de dia. O programa verifica as condições na ordem.',
      },
      { id: 'button-pratica', kind: 'practice', title: 'Botão digital', lesson: experiments.button },
    ],
  },
  {
    id: 'pwm',
    title: 'Potenciômetro e PWM',
    summary: 'Leitura analógica, conversão de faixa e brilho do LED amarelo.',
    slides: [
      {
        id: 'pwm',
        title: 'Leitura analógica e PWM',
        lead: 'O potenciômetro divide a tensão entre GND e 5 V. No Uno clássico, analogRead representa essa tensão com um inteiro de 0 a 1023.',
        details: [
          ['Conversão', 'map converte o intervalo da leitura para 0 a 255. A constante potenciometro aponta para A0 e led identifica a saída PWM D9.'],
          ['Brilho', 'analogWrite muda a fração do tempo em que D9 fica em HIGH. PWM próximo de 128 mantém HIGH por cerca de metade de cada período.'],
        ],
        code: example('pwm'),
        file: experiments.pwm.file,
        caption: 'O LED amarelo fica em D9 com resistor em série. O Monitor Serial mostra a leitura original de A0.',
        everyday: 'Um dimmer muda a intensidade percebida ao girar um controle. Aqui o giro vira uma leitura, e a leitura decide a duração dos pulsos.',
      },
      { id: 'pwm-pratica', kind: 'practice', title: 'Potenciômetro e PWM', lesson: experiments.pwm },
    ],
  },
  {
    id: 'loops',
    title: 'Repetições com for e while',
    summary: 'Quando repetir com contador ou condição e como acompanhar cada volta no Monitor Serial.',
    slides: [
      {
        id: 'repeticao-for',
        title: 'Repetição com for',
        lead: 'Use for quando você quer reunir o início, o teste e o avanço do contador na mesma linha. A cada volta, o programa testa a condição antes de executar o corpo.',
        details: [
          ['Primeiro teste', 'int i = 0 inicia a contagem. i < limite decide se o corpo pode imprimir i.'],
          ['Próxima volta', 'Depois de imprimir, i++ soma 1. Com limite 3, o teste falha quando i chega a 3.'],
        ],
        code: repetitionSketch('for'),
        file: 'repeticao_for.ino',
        caption: 'A saída é 0, 1 e 2. O laço está em setup para imprimir uma vez ao reiniciar.',
        everyday: 'Para etiquetar dez caixas numeradas, você pode começar pela primeira, verificar se ainda há caixas e avançar uma posição a cada etiqueta.',
      },
      {
        id: 'repeticao-while',
        title: 'Repetição com while',
        lead: 'Use while para repetir enquanto uma condição for verdadeira. O teste vem antes do corpo. Se a condição começar falsa, o corpo roda zero vezes.',
        details: [
          ['Contador separado', 'Neste exemplo, i começa antes do while e é incrementado dentro do corpo. A saída é a mesma do for.'],
          ['Condição de parada', 'Se a condição começou verdadeira e i não mudar, i < limite continua verdadeiro e o laço não termina. Em outro programa, a condição pode depender de uma nova leitura de sensor.'],
        ],
        code: repetitionSketch('while'),
        file: 'repeticao_while.ino',
        caption: 'Compare os dois sketches para localizar as mesmas três etapas, inicializar, testar e avançar.',
        everyday: 'Enquanto a roupa estiver molhada, deixe-a secando. Você repete a verificação até que a condição deixe de ser verdadeira.',
      },
      { id: 'repeticoes-pratica', kind: 'repetition', title: 'Passo a passo com for e while' },
    ],
  },
  {
    id: 'arrays',
    title: 'Vetores, sizeof e inversão',
    summary: 'Índice e tamanho do vetor, percurso por pino e troca da ordem dos LEDs.',
    slides: [
      {
        id: 'arrays',
        title: 'Índices, vetores e for',
        lead: 'Um vetor guarda valores do mesmo tipo. O índice começa em zero. Neste exemplo, a posição 0 guarda o número do pino do LED vermelho.',
        details: [
          ['Índice e valor', 'Em {8, 9, 10}, leds[0] vale 8. O zero seleciona a posição. O oito é o pino armazenado nela.'],
          ['Percurso', 'O for visita um pino por vez e chama piscarLed com o pino lido. O botão escolhe o intervalo de cada passo.'],
        ],
        code: example('arrays'),
        file: experiments.arrays.file,
        caption: 'Os nomes ledVermelho, ledAmarelo e ledVerde identificam os pinos antes de montar o vetor.',
        everyday: 'Numa fila de atendimento, a posição na fila e o número da senha são coisas diferentes. A posição zero guarda o primeiro número.',
      },
      {
        id: 'sizeof',
        title: 'O que sizeof mede?',
        lead: 'sizeof é um operador do C++. Ele informa quantos bytes um tipo ou objeto ocupa. Para saber quantos elementos há no vetor, divida os bytes do vetor pelos bytes de um elemento.',
        details: [
          ['Cálculo no Uno clássico', 'Cada int ocupa 2 bytes. Três posições ocupam 6 bytes. A expressão sizeof(leds) / sizeof(leds[0]) resulta em 6 ÷ 2 = 3.'],
          ['Onde calcular', 'Calcule onde leds ainda é o vetor completo. Em um parâmetro como int leds[], a função recebe um ponteiro. Passe junto a quantidade calculada fora dela.'],
        ],
        table: {
          headers: ['Expressão em um vetor int leds[3]', 'Resultado no Uno clássico', 'Significado'],
          rows: [['sizeof(leds)', '6 bytes', 'Tamanho do vetor'], ['sizeof(leds[0])', '2 bytes', 'Tamanho de um int'], ['sizeof(leds) / sizeof(leds[0])', '3', 'Quantidade de elementos']],
        },
        everyday: 'Se três caixas iguais enchem 6 litros e uma caixa ocupa 2 litros, divida o total pelo volume de uma caixa para saber quantas há.',
      },
      {
        id: 'inverter-vetor',
        title: 'Como o botão Inverter vetor funciona',
        lead: 'A bancada copia a ordem atual, inverte essa cópia e volta para o índice 0. Em {8, 9, 10}, ela passa a visitar {10, 9, 8}.',
        details: [
          ['No navegador', '[...pins].reverse() cria uma cópia e troca a ordem. setStep(0) faz a próxima leitura começar pelo primeiro pino da nova ordem.'],
          ['No Arduino', 'Para inverter um vetor modificável, troque cada posição i com quantidade − 1 − i. Guarde o valor antigo numa variável temporária e avance só até a metade. O elemento do meio fica no lugar.'],
        ],
        code: reverseSketch,
        file: 'inverter_vetor.ino',
        caption: 'Neste sketch, a função inverterVetor executa uma vez em setup. Na bancada, cada clique faz uma nova inversão e atualiza o sketch exibido.',
        everyday: 'Inverter a ordem de atendimento de uma fila muda quem é chamado primeiro. As pessoas continuam sendo as mesmas, assim como os pinos físicos dos LEDs.',
      },
      { id: 'arrays-pratica', kind: 'practice', title: 'Sequência com vetores', lesson: experiments.arrays },
    ],
  },
];

export const chapters = course.map(chapter => ({
  id: chapter.id,
  title: chapter.title,
  summary: chapter.summary,
  slides: [
    ...chapter.slides.map(slide => ({ kind: 'theory', ...slide, topic: chapter.title })),
    ...questions[chapter.id].flatMap((question, index) => {
      const questionId = `${chapter.id}-pergunta-${index + 1}`;
      return [
        { id: questionId, kind: 'question', title: `Questão ${index + 1}`, topic: chapter.title, question, questionId },
        { id: `${questionId}-resposta`, kind: 'answer', title: `Resposta ${index + 1}`, topic: chapter.title, question, questionId },
      ];
    }),
  ],
}));

export const slides = [
  { id: 'inicio', kind: 'cover', title: 'Programação para Arduino' },
  { id: 'sumario', kind: 'summary', title: 'Sumário da aula' },
  ...chapters.flatMap(chapter => chapter.slides),
  { id: 'desafio-final', kind: 'challenge', title: 'Desafio final' },
  { id: 'materiais', kind: 'materials', title: 'Materiais da aula' },
  { id: 'encerramento', kind: 'closing', title: 'Obrigada pela atenção' },
];
