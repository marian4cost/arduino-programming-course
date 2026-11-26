export const variablesSketch = `const int limite = 3;            // Inteiro que fica fixo.
int contagem = 0;                 // Inteiro que pode mudar.
float tempoSegundos = 0.5f;       // Número com parte decimal.
bool ligado = false;              // true ou false.
char modo = 'A';                  // Um caractere.

void setup() {
  Serial.begin(9600);

  // Guarda novos valores nas mesmas variáveis.
  contagem = contagem + 1;
  ligado = true;

  Serial.print("Modo: ");
  Serial.println(modo);
  Serial.print("Contagem: ");
  Serial.println(contagem);
  Serial.print("Limite: ");
  Serial.println(limite);
  Serial.print("Tempo em segundos: ");
  Serial.println(tempoSegundos);
  Serial.print("Ligado (1 = true): ");
  Serial.println(ligado);
}

void loop() {
  // A demonstração imprime uma vez a cada reinício.
}`;

export const serialSketch = `const unsigned long intervaloMs = 500;
unsigned long leitura = 0;

void setup() {
  // Use a mesma velocidade no Monitor Serial.
  Serial.begin(9600);
}

void loop() {
  // print mantém o cursor na linha. println encerra a linha.
  Serial.print("Leitura: ");
  Serial.println(leitura);
  leitura++;
  delay(intervaloMs);
}`;

export function repetitionSketch(structure, limit = 3) {
  const repetition = structure === 'for'
    ? `  // Inicializa i, testa o limite e incrementa a cada volta.
  for (int i = 0; i < limite; i++) {
    Serial.println(i);
  }`
    : `  int i = 0;
  // Testa antes de cada volta.
  while (i < limite) {
    Serial.println(i);
    i++;  // Atualização que permite chegar ao limite.
  }`;

  return `const int limite = ${limit};

void setup() {
  Serial.begin(9600);
${repetition}
}

void loop() {
  // A contagem acontece uma vez a cada reinício.
}`;
}

export const reverseSketch = `const int ledVermelho = 8;
const int ledAmarelo = 9;
const int ledVerde = 10;
int leds[] = {ledVermelho, ledAmarelo, ledVerde};
const size_t quantidade = sizeof(leds) / sizeof(leds[0]);
const unsigned long tempoMs = 400;

void inverterVetor() {
  // Troca os extremos e avança em direção ao centro.
  for (size_t i = 0; i < quantidade / 2; i++) {
    size_t oposto = quantidade - 1 - i;
    int temporario = leds[i];
    leds[i] = leds[oposto];
    leds[oposto] = temporario;
  }
}

void setup() {
  for (size_t i = 0; i < quantidade; i++) {
    pinMode(leds[i], OUTPUT);
  }
  // Faz a troca uma vez, antes de percorrer a sequência.
  inverterVetor();
}

void loop() {
  for (size_t i = 0; i < quantidade; i++) {
    digitalWrite(leds[i], HIGH);
    delay(tempoMs);
    digitalWrite(leds[i], LOW);
  }
}`;

export const conditionSketch = `const int pinoSensor = A0;
const int pinoLed = 8;  // LED externo com resistor em série.
const int limiteEscuro = 300;
const int limiteMeiaLuz = 700;

void setup() {
  pinMode(pinoLed, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int leitura = analogRead(pinoSensor);

  // Só o primeiro bloco cuja condição for verdadeira executa.
  if (leitura < limiteEscuro) {
    Serial.println("Escuro");
    digitalWrite(pinoLed, HIGH);
  } else if (leitura < limiteMeiaLuz) {
    Serial.println("Meia-luz");
    digitalWrite(pinoLed, LOW);
  } else {
    Serial.println("Claro");
    digitalWrite(pinoLed, LOW);
  }

  delay(200);
}`;
