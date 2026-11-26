const question = (prompt, correct, options) => ({ prompt, correct, options });

export const questions = {
  basics: [
    question('Qual papel o botão tem no circuito de uma campainha?', 0, [
      ['Entrada', 'O botão fornece ao controlador a informação de que alguém apertou. O som é a saída produzida depois da leitura.'],
      ['Saída', 'A saída é o som produzido pela campainha. O botão fornece o sinal que o controlador lê.'],
      ['Entrada e saída ao mesmo tempo', 'Neste circuito o botão apenas sinaliza que alguém apertou. Outro componente produz o som.'],
    ]),
    question('Qual tipo guarda um estado como ligado ou desligado?', 2, [
      ['float', 'float guarda números com parte decimal, como 0,5 segundo. Aqui há apenas dois estados possíveis.'],
      ['char', 'char guarda um único caractere, como A. É comum usá-lo para uma letra de identificação.'],
      ['bool', 'bool representa dois valores, true e false. Podemos associá-los diretamente aos estados ligado e desligado.'],
    ]),
  ],
  serial: [
    question('O sketch usa Serial.begin(9600). Como abrir o Monitor Serial?', 1, [
      ['Escolher qualquer velocidade', 'Os dois lados precisam concordar sobre a velocidade. Com valores diferentes, a leitura pode aparecer ilegível.'],
      ['Selecionar 9600 baud', 'O sketch e o Monitor Serial precisam usar a mesma velocidade. Com ambos em 9600, o monitor interpreta os dados enviados.'],
      ['Selecionar 1023 baud', '1023 é o maior valor da leitura analógica neste Uno. Ele não define a velocidade de comunicação.'],
    ]),
  ],
  blink: [
    question('Qual função executa uma vez quando o Arduino é reiniciado?', 1, [
      ['loop()', 'loop() é chamada repetidamente depois da configuração. Coloque nela as ações que precisam continuar acontecendo.'],
      ['setup()', 'setup() executa uma vez após ligar ou reiniciar, antes das chamadas a loop(). Por isso é o lugar para configurar os pinos.'],
      ['delay()', 'delay() pausa o código pelo tempo informado sempre que for chamada. Ela não define a etapa de inicialização.'],
    ]),
    question('Se cada espera dura 200 ms, quanto dura um ciclo completo?', 1, [
      ['200 ms', 'Isso conta apenas um dos estados, aceso ou apagado. Um ciclo inclui os dois.'],
      ['400 ms', 'O LED fica 200 ms aceso e depois 200 ms apagado. A soma dos dois intervalos dá 400 ms antes de o padrão recomeçar.'],
      ['800 ms', '800 ms somam quatro intervalos de 200 ms, o equivalente a dois ciclos completos.'],
    ]),
  ],
  button: [
    question('Qual é o valor lido em D2 com o botão solto e INPUT_PULLUP?', 0, [
      ['HIGH', 'Com o botão aberto, o resistor interno conecta o pino fracamente à alimentação. Ao apertar, o botão fecha o caminho ao GND e a leitura passa a LOW.'],
      ['LOW', 'LOW só aparece neste circuito quando o botão leva o pino ao GND. Com o botão solto, o resistor interno o mantém em HIGH.'],
      ['Depende do LED', 'D2 mede o botão. O LED está em outro pino e reage depois que o programa lê D2.'],
    ]),
    question('Qual operador compara dois valores no sketch?', 1, [
      ['=', '= atribui um valor. Por exemplo, tempoMs = 400 guarda 400 em tempoMs.'],
      ['==', '== testa se dois valores são iguais e produz true ou false. O if usa esse resultado para escolher o bloco a executar.'],
      ['++', '++ incrementa uma variável em uma unidade. É útil para avançar o contador de um laço.'],
    ]),
  ],
  pwm: [
    question('Qual é a faixa de leituras de analogRead() no Uno clássico?', 1, [
      ['0 a 255', 'Essa é a faixa de escrita do PWM de 8 bits usado no exemplo. O conversor analógico da entrada tem 10 bits.'],
      ['0 a 1023', 'Os 10 bits permitem 2¹⁰ = 1024 valores. Como a contagem começa em zero, o último valor é 1023.'],
      ['0 a 5', 'Essa é a faixa aproximada da tensão de entrada em volts com a referência padrão. analogRead() devolve um número inteiro sem unidade.'],
    ]),
    question('O que aumenta quando o valor de PWM vai de 64 a 192?', 1, [
      ['A tensão de pico de D9', 'Os níveis de tensão continuam os mesmos. O programa muda a duração do estado HIGH em cada período.'],
      ['O tempo relativo em HIGH', '64 de 255 equivale a cerca de 25% do período. 192 corresponde a cerca de 75%. O LED recebe pulsos mais longos e parece mais brilhante.'],
      ['O valor da resistência', 'O resistor físico continua com o mesmo valor. O código muda quanto tempo o pino alimenta o LED a cada período.'],
    ]),
  ],
  loops: [
    question('O que for (int i = 0; i < 3; i++) imprime se o corpo imprime i?', 0, [
      ['0, 1 e 2', 'O laço começa em zero. Depois de imprimir 2, o incremento gera 3. O teste 3 < 3 é falso e o corpo não executa novamente.'],
      ['1, 2 e 3', 'O contador começa em zero e só incrementa depois do corpo. A condição exclui o 3.'],
      ['0, 1, 2 e 3', 'O 3 apareceria se a condição incluísse o limite, como em i <= 3. Com i < 3, ele encerra o laço.'],
    ]),
    question('Quando o corpo de um while executa pela primeira vez?', 1, [
      ['Sempre, antes de testar', 'Essa ordem é característica de do…while. O while testa a condição antes do corpo.'],
      ['Se a condição inicial for verdadeira', 'O while primeiro avalia a condição. Se ela já for falsa, o corpo executa zero vezes.'],
      ['Apenas depois que a condição fica falsa', 'Uma condição falsa encerra ou impede a repetição. O corpo só é executado quando ela é verdadeira.'],
    ]),
  ],
  arrays: [
    question('Em {8, 9, 10}, qual expressão retorna 10?', 1, [
      ['leds[3]', 'A posição 3 está fora de um vetor com três elementos. As posições válidas vão de 0 a 2.'],
      ['leds[2]', 'O primeiro valor está na posição 0, o segundo na 1 e o terceiro na 2. Por isso leds[2] retorna o valor 10.'],
      ['leds[10]', '10 é o valor guardado, não a posição. Tentar acessar a posição 10 ultrapassa o tamanho deste vetor.'],
    ]),
    question('Qual condição percorre um vetor de n elementos a partir de i = 0, com i++?', 2, [
      ['i <= n', 'Inclui i igual a n, mas essa posição está fora do vetor. O último índice válido é n − 1.'],
      ['i > n', 'Para um vetor não vazio, 0 > n já é falso. O laço não chegaria a acessar a primeira posição.'],
      ['i < n', 'A condição aceita os índices de 0 a n − 1. Assim que i alcança n, ela é falsa e nenhum acesso fora do vetor acontece.'],
    ]),
    question('Para int leds[3] no Uno clássico, quanto vale sizeof(leds) / sizeof(leds[0])?', 2, [
      ['6', '6 é o tamanho em bytes de todo o vetor. Ainda precisamos dividir esse total pelo tamanho em bytes de um elemento.'],
      ['2', '2 é o tamanho em bytes de um int nesta placa, ou seja, o resultado de sizeof(leds[0]).'],
      ['3', 'O vetor ocupa 6 bytes e cada int ocupa 2 bytes nesta placa. Dividir 6 por 2 dá o número de posições, independentemente dos valores guardados.'],
    ]),
    question('O que acontece ao inverter a sequência {8, 9, 10}?', 0, [
      ['O primeiro valor passa a ser 10', 'Os dois extremos trocam de posição e o 9 permanece no meio. O for continua começando em i = 0, que agora guarda o pino 10.'],
      ['O for passa a contar de 2 até 0', 'O botão reorganiza os valores do vetor. O for continua contando de 0 até 2.'],
      ['Os fios dos três LEDs precisam mudar', 'Os pinos físicos continuam os mesmos. A troca é na ordem em que o código visita os pinos.'],
    ]),
  ],
};
