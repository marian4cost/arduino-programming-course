# Arduino Lab

Bancada interativa para um minicurso de programação com Arduino Uno. O site é feito com Next.js e executa as simulações no navegador.

## Desenvolvimento

Com Node.js 20.9 ou superior, instale as dependências e abra a prévia.

```sh
npm ci
npm run dev
```

A prévia abre em http://localhost:3000. Para gerar os arquivos estáticos de produção, execute `npm run build`. O resultado fica em `out/`.

## Experimentos

- Primeiro LED com intervalo ajustável, execução automática e passo a passo.
- Botão digital com INPUT_PULLUP e inversão da comparação entre HIGH e LOW.
- Potenciômetro com leitura de 10 bits em A0, conversão para PWM no D9 e brilho proporcional ilustrado no LED.
- Sequência de três LEDs com vetor editável por inversão, índice visível e dois ritmos controlados pelo botão.

Cada experimento mostra o sketch Arduino comentado e permite baixar o código como .ino. Crie uma pasta com o mesmo nome do arquivo antes de abri-lo na Arduino IDE. Os circuitos são representações didáticas das conexões e dos estados do programa. Os questionários registram as respostas durante a sessão e apresentam feedback imediato.

A seção Materiais da aula reúne o plano de ensino, a apresentação editável e os sketches do minicurso. A navegação por tópicos, o modo de tela cheia e a correção dos questionários foram inspirados na [apresentação de Projeto de Banco de Dados de Flaygner Matos Rebouças](https://flaygner.com.br/projeto-banco-de-dados/index.html).
