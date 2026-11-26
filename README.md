# Arduino Lab

Bancada interativa para um minicurso de programação com Arduino Uno. O site é feito com Next.js e executa as simulações no navegador.

## Desenvolvimento

Com Node.js 20.9 ou superior, instale as dependências e abra a prévia.

```sh
npm ci
npm run dev
```

A prévia abre em http://localhost:3000. Para gerar os arquivos estáticos de produção, execute `npm run build`. O resultado fica em `out/`.

## Apresentação em aula

A apresentação abre na capa. Use os botões do rodapé ou as setas esquerda e direita para avançar e voltar. O menu **Roteiro** leva diretamente ao assunto ou à atividade.

O sumário abre os temas. A aula começa por entradas, saídas e tipos antes dos sketches. Os temas alternam explicações, exemplos do dia a dia, código completo, bancadas e questões. O botão **Ver resposta** abre a justificativa no slide seguinte. Quando a escolha está errada, a correção compara a opção marcada com a correta. As setas continuam disponíveis para mover os seletores e navegar entre opções quando esses controles estão em foco.

## Experimentos

- Primeiro LED com intervalo ajustável, execução automática e passo a passo.
- Botão digital com INPUT_PULLUP e inversão da comparação entre HIGH e LOW.
- Potenciômetro com leitura de 10 bits em A0, conversão para PWM no D9 e brilho proporcional ilustrado no LED.
- Monitor Serial simulado com amostras e comparação de for e while, inclusive com limite zero.
- Sequência de três LEDs com vetor editável por inversão, índice visível e dois ritmos controlados pelo botão.

Cada experimento mostra o sketch Arduino comentado e permite baixar o código como .ino. Crie uma pasta com o mesmo nome do arquivo antes de abri-lo na Arduino IDE. Os circuitos são representações didáticas das conexões e dos estados do programa. As escolhas permanecem durante a navegação na sessão. O slide seguinte mostra a correção comentada.

O slide Materiais da aula reúne o plano de ensino, a apresentação editável e os sketches do minicurso. A navegação por tópicos, o modo de tela cheia e a correção dos questionários foram inspirados na [apresentação de Projeto de Banco de Dados de Flaygner Matos Rebouças](https://flaygner.com.br/projeto-banco-de-dados/index.html).

## Desafio final

Na última atividade, a bancada permite adicionar e posicionar peças, ligar terminais e verificar o circuito. A aba de código executa localmente um subconjunto do Arduino C++ usado na aula. Ela simula D2, A0, os LEDs em D9 e D10 e o Monitor Serial. O arquivo .ino pode ser baixado para a Arduino IDE.
