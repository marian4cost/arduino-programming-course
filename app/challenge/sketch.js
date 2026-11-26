// Interpret the subset used in class without evaluating student text as JavaScript.
const tokenPattern = /\s+|\/\/[^\n]*|\/\*[\s\S]*?\*\/|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)'|\d+(?:\.\d+)?[fF]?|[A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*|\+\+|--|<=|>=|==|!=|&&|\|\||[{}()[\];,=+*/%<>!\-]/gy;
const types = new Set(['int', 'bool', 'char', 'byte', 'float', 'long', 'unsigned', 'size_t', 'void']);
const precedence = new Map(['=', '||', '&&', '== !=', '< <= > >=', '+ -', '* / %'].flatMap((group, i) => group.split(' ').map(op => [op, i + 1])));

function parse(source) {
  if (source.length > 16000) throw new Error('Use um sketch de até 16 mil caracteres.');
  const tokens = [];
  let offset = 0;
  while (offset < source.length) {
    tokenPattern.lastIndex = offset;
    const match = tokenPattern.exec(source);
    if (!match) throw new Error('Símbolo fora da linguagem da bancada na linha ' + source.slice(0, offset).split('\n').length + '.');
    if (!/^\s|^\/[/\*]/.test(match[0])) tokens.push({ value: match[0], offset });
    offset = tokenPattern.lastIndex;
  }
  let cursor = 0;
  const peek = () => tokens[cursor]?.value;
  const fail = message => {
    const line = source.slice(0, tokens[cursor]?.offset ?? source.length).split('\n').length;
    throw new Error('Linha ' + line + '. ' + message);
  };
  const take = value => {
    if (peek() !== value) return false;
    cursor++;
    return true;
  };
  const expect = value => { if (!take(value)) fail('Esperado ' + value + '.'); };
  const name = () => {
    if (!/^[A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*$/.test(peek() ?? '')) fail('Esperado um nome.');
    return tokens[cursor++].value;
  };
  const readType = () => {
    const constant = take('const');
    const type = peek();
    if (!types.has(type)) fail('Tipo de variável fora da linguagem da bancada.');
    cursor++;
    if (type === 'unsigned' && (peek() === 'int' || peek() === 'long')) return { constant, type: 'unsigned ' + tokens[cursor++].value };
    return { constant, type };
  };
  const list = end => {
    const items = [];
    if (!take(end)) {
      do { items.push(expression()); } while (take(',') && peek() !== end);
      expect(end);
    }
    return items;
  };
  function primary() {
    let item;
    if (take('(')) { item = expression(); expect(')'); }
    else if (['-', '+', '!', '++', '--'].includes(peek())) item = ['unary', tokens[cursor++].value, primary()];
    else if (/^\d/.test(peek() ?? '')) item = ['value', Number(tokens[cursor++].value.replace(/[fF]$/, ''))];
    else if (/^["']/.test(peek() ?? '')) {
      const text = tokens[cursor++].value;
      item = ['value', text[0] === '"' ? JSON.parse(text) : text.slice(1, -1)];
    } else {
      const identifier = name();
      item = take('(') ? ['call', identifier, list(')')] : ['name', identifier];
    }
    while (take('[')) { item = ['index', item, expression()]; expect(']'); }
    if (peek() === '++' || peek() === '--') item = ['post', tokens[cursor++].value, item];
    return item;
  }
  function expression(min = 1) {
    let left = primary();
    while ((precedence.get(peek()) ?? 0) >= min) {
      const op = tokens[cursor++].value;
      left = ['binary', op, left, expression(precedence.get(op) + (op === '=' ? 0 : 1))];
    }
    return left;
  }
  function declaration(meta = readType(), identifier = name()) {
    let length;
    if (take('[')) {
      length = peek() === ']' ? null : expression();
      expect(']');
    }
    const initial = take('=') ? (take('{') ? ['array', list('}')] : expression()) : null;
    return ['declare', identifier, meta, length, initial];
  }
  function simple() {
    return types.has(peek()) || peek() === 'const' ? declaration() : ['expression', expression()];
  }
  function statement() {
    if (take('{')) {
      const body = [];
      while (!take('}')) body.push(statement());
      return ['block', body];
    }
    if (take('if')) {
      expect('('); const test = expression(); expect(')');
      const yes = statement();
      return ['if', test, yes, take('else') ? statement() : null];
    }
    if (take('while')) {
      expect('('); const test = expression(); expect(')');
      return ['loop', null, test, null, statement()];
    }
    if (take('for')) {
      expect('('); const initial = peek() === ';' ? null : simple(); expect(';');
      const test = peek() === ';' ? ['value', true] : expression(); expect(';');
      const update = peek() === ')' ? null : expression(); expect(')');
      return ['loop', initial, test, update, statement()];
    }
    if (take('return')) {
      const value = peek() === ';' ? null : expression(); expect(';');
      return ['return', value];
    }
    if (take(';')) return ['block', []];
    const result = simple(); expect(';'); return result;
  }
  const globals = [];
  const functions = new Map();
  while (peek() !== undefined) {
    const meta = readType();
    const identifier = name();
    if (take('(')) {
      const parameters = [];
      if (!take(')')) {
        do { parameters.push([readType(), name()]); } while (take(','));
        expect(')');
      }
      if (peek() !== '{') fail('Esperado o corpo da função.');
      functions.set(identifier, { parameters, body: statement() });
    } else {
      globals.push(declaration(meta, identifier)); expect(';');
    }
  }
  if (!functions.has('setup') || !functions.has('loop')) throw new Error('Defina as funções setup() e loop().');
  return { globals, functions };
}

const constants = new Map(Object.entries({ HIGH: 1, LOW: 0, INPUT: 0, OUTPUT: 1, INPUT_PULLUP: 2, A0: 14, true: true, false: false }));
const byteSize = type => ['bool', 'char', 'byte'].includes(type) ? 1 : ['long', 'unsigned long', 'float'].includes(type) ? 4 : 2;
const scope = (parent = null) => ({ parent, values: new Map() });

export function startSketch(source, io) {
  const { globals, functions } = parse(source);
  const global = scope();
  const modes = new Map();
  let budget = 3000;
  let depth = 0;
  let serialStarted = false;

  function spend() {
    if (--budget < 0) throw new Error('Muitas instruções sem pausa. Confira a condição do laço ou adicione delay().');
  }
  function lookup(environment, key) {
    for (let current = environment; current; current = current.parent) {
      if (current.values.has(key)) return current.values.get(key);
    }
    if (constants.has(key)) return { value: constants.get(key), constant: true, type: 'int' };
    throw new Error('Nome não declarado: ' + key + '.');
  }
  function reference(node, environment) {
    if (node[0] === 'name') return lookup(environment, node[1]);
    if (node[0] !== 'index') throw new Error('Use uma variável ou posição do vetor neste trecho.');
    const entry = reference(node[1], environment);
    const index = evaluate(node[2], environment);
    if (!Array.isArray(entry.value) || !Number.isInteger(index) || index < 0 || index >= entry.value.length) throw new Error('Índice fora do vetor.');
    return { get value() { return entry.value[index]; }, set value(value) { entry.value[index] = value; }, type: entry.type, constant: entry.constant };
  }
  function change(node, value, environment) {
    const target = reference(node, environment);
    if (target.constant) throw new Error('Um valor const não pode ser alterado.');
    if (Array.isArray(target.value)) throw new Error('Selecione um índice do vetor para escrever.');
    target.value = value;
    return value;
  }
  function evaluate(node, environment) {
    const [kind, a, b, c] = node;
    if (kind === 'value') return a;
    if (kind === 'name' || kind === 'index') return reference(node, environment).value;
    if (kind === 'array') return a.map(value => evaluate(value, environment));
    if (kind === 'unary' || kind === 'post') {
      const value = evaluate(b, environment);
      if (a === '!') return !value;
      if (a === '-') return -value;
      if (a === '+') return +value;
      const changed = change(b, value + (a === '++' ? 1 : -1), environment);
      return kind === 'post' ? value : changed;
    }
    if (kind === 'binary') {
      if (a === '=') return change(b, evaluate(c, environment), environment);
      const left = evaluate(b, environment);
      if (a === '&&') return Boolean(left && evaluate(c, environment));
      if (a === '||') return Boolean(left || evaluate(c, environment));
      const right = evaluate(c, environment);
      switch (a) {
        case '+': return left + right;
        case '-': return left - right;
        case '*': return left * right;
        case '/': if (right === 0) throw new Error('Divisão por zero.'); return Number.isInteger(left) && Number.isInteger(right) ? Math.trunc(left / right) : left / right;
        case '%': if (right === 0) throw new Error('Divisão por zero.'); return left % right;
        case '<': return left < right;
        case '<=': return left <= right;
        case '>': return left > right;
        case '>=': return left >= right;
        case '==': return left == right;
        case '!=': return left != right;
      }
    }
    if (a === 'sizeof') {
      const entry = reference(b[0], environment);
      return byteSize(entry.type) * (Array.isArray(entry.value) ? entry.value.length : 1);
    }
    return call(a, b.map(arg => evaluate(arg, environment)));
  }
  function* execute(node, environment) {
    if (!node) return;
    spend();
    const [kind, a, b, c, d] = node;
    switch (kind) {
      case 'block': {
        const local = scope(environment);
        for (const line of a) {
          const result = yield* execute(line, local);
          if (result) return result;
        }
        break;
      }
      case 'declare': {
        let value = d ? evaluate(d, environment) : c === undefined ? 0 : [];
        if (c !== undefined) {
          const length = c === null ? value.length : evaluate(c, environment);
          if (!Array.isArray(value) || !Number.isInteger(length) || length < 1 || length > 128 || value.length > length) throw new Error('Tamanho ou conteúdo inválido no vetor ' + a + '.');
          value = Array.from({ length }, (_, i) => value[i] ?? 0);
        }
        environment.values.set(a, { ...b, value });
        break;
      }
      case 'if': return yield* execute(evaluate(a, environment) ? b : c, environment);
      case 'loop': {
        const local = scope(environment);
        yield* execute(a, local);
        while (evaluate(b, local)) {
          spend();
          const result = yield* execute(d, local);
          if (result) return result;
          if (c) evaluate(c, local);
        }
        break;
      }
      case 'expression': {
        if (a[0] === 'call' && a[1] === 'delay') {
          const ms = evaluate(a[2][0], environment);
          if (!Number.isFinite(ms) || ms < 0) throw new Error('Use um número positivo em delay().');
          yield Math.max(16, Math.min(2147483647, ms));
        } else if (a[0] === 'call' && functions.has(a[1])) {
          yield* runFunction(a[1], a[2].map(arg => evaluate(arg, environment)));
        } else evaluate(a, environment);
        break;
      }
      case 'return': return { value: a ? evaluate(a, environment) : undefined };
    }
  }
  function* runFunction(key, values) {
    const { parameters, body } = functions.get(key);
    if (parameters.length !== values.length) throw new Error('Quantidade de parâmetros inválida em ' + key + '().');
    if (++depth > 24) throw new Error('Chamadas de funções demais em sequência.');
    try {
      const local = scope(global);
      parameters.forEach(([meta, identifier], index) => local.values.set(identifier, { ...meta, value: values[index] }));
      return (yield* execute(body, local))?.value;
    } finally { depth--; }
  }
  function call(key, args) {
    const [pin, value, inputMax, outputMin, outputMax] = args;
    switch (key) {
      case 'pinMode': modes.set(pin, value); return;
      case 'digitalRead':
        if (pin !== 2 || modes.get(pin) !== 2) throw new Error('Configure D2 como INPUT_PULLUP antes de ler o botão.');
        return Number(!io.read().pressed);
      case 'analogRead': return pin === 14 ? io.read().adc : 0;
      case 'digitalWrite':
      case 'analogWrite':
        if (modes.get(pin) !== 1) throw new Error('Configure o pino D' + pin + ' como OUTPUT antes de escrever.');
        io.write(pin, key === 'digitalWrite' ? (value ? 255 : 0) : Math.max(0, Math.min(255, Math.trunc(value))));
        return;
      case 'map':
        if (inputMax === value) throw new Error('A faixa de entrada de map() precisa de dois limites diferentes.');
        return Math.trunc((pin - value) * (outputMax - outputMin) / (inputMax - value)) + outputMin;
      case 'Serial.begin': serialStarted = true; io.baud(pin); return;
      case 'Serial.print':
      case 'Serial.println':
        if (!serialStarted) throw new Error('Inicie o Monitor Serial com Serial.begin() antes de imprimir.');
        io.print(args.map(String).join(' ') + (key.endsWith('println') ? '\n' : ''));
        return;
      default: {
        if (!functions.has(key)) throw new Error('Função ' + key + ' fora da linguagem da bancada.');
        const result = runFunction(key, args).next();
        if (!result.done) throw new Error('Chame funções com delay() em uma linha própria.');
        return result.value;
      }
    }
  }
  function* program() {
    for (const line of globals) yield* execute(line, global);
    yield* runFunction('setup', []);
    while (true) {
      yield* runFunction('loop', []);
      // Keep a loop without delay responsive to button and sensor changes.
      yield 32;
    }
  }
  const runner = program();
  return () => {
    budget = 3000;
    return runner.next().value;
  };
}
