"use strict";
const $ = id => document.getElementById(id);
const canvas = $("tela"), ctx = canvas.getContext("2d");
const TOTAL_FASES = 20, MISSOES_POR_FASE = 5, SALVO = "missaoRespeitoV2";
const perguntas = [
  { q: "Você vê alguém sendo zoado na escola. O que faz?", op: ["Participar da zoeira", "Apoiar a pessoa e chamar um adulto", "Gravar e compartilhar"], certa: 1, dica: "Apoiar a pessoa e buscar ajuda é uma atitude de respeito." },
  { q: "Um colega está sempre sozinho. O que você pode fazer?", op: ["Convidá-lo para participar", "Ignorá-lo", "Rir dele"], certa: 0, dica: "Incluir as pessoas ajuda a criar amizades." },
  { q: "Alguém envia uma mensagem ofensiva no grupo. O que fazer?", op: ["Repassar a mensagem", "Responder com outra ofensa", "Não compartilhar e procurar ajuda"], certa: 2, dica: "Não espalhar ofensas ajuda a combater o cyberbullying." },
  { q: "Qual atitude demonstra empatia?", op: ["Ouvir e respeitar sentimentos", "Humilhar quem pensa diferente", "Excluir colegas"], certa: 0, dica: "Empatia é tentar compreender o que o outro sente." },
  { q: "Um colega recebe um apelido de que não gosta. O correto é:", op: ["Continuar usando", "Respeitar como ele quer ser chamado", "Inventar outro apelido ofensivo"], certa: 1, dica: "Respeitar os limites dos outros é fundamental." },
  { q: "Uma pessoa sofre bullying repetidamente. Quem pode ajudar?", op: ["Ninguém", "Somente os colegas", "Professores, responsáveis e equipe escolar"], certa: 2, dica: "Pedir ajuda a adultos de confiança é importante." },
  { q: "Qual atitude melhora a convivência?", op: ["Espalhar boatos", "Dialogar e respeitar diferenças", "Fazer ameaças"], certa: 1, dica: "O diálogo e o respeito fortalecem a comunidade." },
  { q: "Você cometeu uma ofensa. O melhor é:", op: ["Reconhecer o erro e mudar de atitude", "Culpar a outra pessoa", "Repetir a ofensa"], certa: 0, dica: "Assumir a responsabilidade é parte do aprendizado." },
  { q: "Uma foto constrangedora de alguém circula na internet. Você deve:", op: ["Compartilhar com amigos", "Fazer memes", "Não divulgar e avisar um adulto de confiança"], certa: 2, dica: "A privacidade das pessoas deve ser respeitada." },
  { q: "O que significa respeitar as diferenças?", op: ["Aceitar que as pessoas são diversas", "Exigir que todos sejam iguais", "Excluir quem é diferente"], certa: 0, dica: "Todos merecem dignidade e respeito." },
  { q: "Uma pessoa pede para parar uma brincadeira. O que fazer?", op: ["Continuar", "Parar e respeitar o pedido", "Rir ainda mais"], certa: 1, dica: "Uma brincadeira deixa de ser divertida quando machuca alguém." },
  { q: "Como acolher alguém que sofreu bullying?", op: ["Ouvir sem julgar", "Culpar a pessoa", "Ignorar o que aconteceu"], certa: 0, dica: "Escutar e acolher faz diferença." },
  { q: "Se você presenciar exclusão de um colega, pode:", op: ["Ajudar a incluir o colega", "Apoiar a exclusão", "Fingir que não existe"], certa: 0, dica: "Pequenas atitudes de inclusão são importantes." },
  { q: "Qual mensagem é positiva em um grupo online?", op: ["Uma ameaça", "Uma fofoca", "Uma mensagem de apoio"], certa: 2, dica: "Palavras gentis também fazem a diferença na internet." },
  { q: "O que fazer se você estiver sofrendo bullying?", op: ["Guardar tudo em segredo", "Conversar com um adulto de confiança", "Revidar com agressão"], certa: 1, dica: "Você merece apoio e segurança." },
  { q: "Qual destas opções mostra respeito?", op: ["Ouvir opiniões diferentes", "Zombar de alguém", "Espalhar apelidos ofensivos"], certa: 0, dica: "Discordar é possível sem desrespeitar." },
  { q: "Se um amigo compartilha um boato, você deve:", op: ["Espalhar também", "Não repassar e conversar com ele", "Publicar em outra rede"], certa: 1, dica: "Boatos podem prejudicar pessoas." },
  { q: "Como tornar a sala mais acolhedora?", op: ["Criando panelinhas fechadas", "Rindo de erros", "Convidando todos a participar"], certa: 2, dica: "Um ambiente acolhedor inclui todo mundo." },
  { q: "Uma pessoa tem uma dificuldade diferente da sua. Você pode:", op: ["Oferecer ajuda com respeito", "Fazer piadas", "Ignorar sempre"], certa: 0, dica: "Ajuda respeitosa considera o que a pessoa precisa." },
  { q: "Qual é a missão de todos na escola?", op: ["Competir para humilhar", "Promover respeito e segurança", "Excluir colegas"], certa: 1, dica: "Uma escola melhor é construída em conjunto." }
];
let fase = 1, missao = 1, pontos = 0, vidas = 3;
let ativo = false, respondendo = false, travado = false, teclas = {}, ultimoTempo = 0, sessao = 0;
const jogador = { x: 35, y: 180, tamanho: 24, velocidade: 3 };
const objetivo = { x: 555, y: 180, tamanho: 28 };
let obstaculos = [];
function atualizarPainel() {
  $("fase").textContent = `Fase ${fase}/${TOTAL_FASES}`;
  $("missao").textContent = `Missão ${missao}/${MISSOES_POR_FASE}`;
  $("pontos").textContent = `⭐ ${pontos}`;
  $("vidas").textContent = `❤️ ${vidas}`;
}
function salvar() {
  try { localStorage.setItem(SALVO, JSON.stringify({ fase, missao, pontos, vidas })); } catch (_) {}
}
function carregar() {
  try {
    const dados = JSON.parse(localStorage.getItem(SALVO));
    if (!dados || !Number.isInteger(dados.fase) || dados.fase < 1 || dados.fase > TOTAL_FASES || !Number.isInteger(dados.missao) || dados.missao < 1 || dados.missao > MISSOES_POR_FASE) return;
    fase = dados.fase; missao = dados.missao;
    pontos = Math.max(0, Number(dados.pontos) || 0);
    vidas = Math.max(1, Math.min(3, Number(dados.vidas) || 3));
  } catch (_) {}
}
function criarCenario() {
  jogador.x = 35; jogador.y = 180;
  objetivo.x = 555; objetivo.y = 180;
  obstaculos = [];
  const quantidade = Math.min(2 + Math.floor(fase / 4), 6);
  for (let i = 0; i < quantidade; i++) {
    const x = 145 + i * 70;
    const y = 45 + ((i * 91 + fase * 37 + missao * 29) % 265);
    obstaculos.push({ x, y, largura: 30, altura: 30 });
  }
  atualizarPainel();
  $("mensagem").textContent = "Chegue até a estrela do respeito! ⭐";
  $("pergunta").classList.add("escondido");
  respondendo = false; travado = false; teclas = {};
  salvar();
}
function iniciar() {
  if (ativo) return;
  $("menu").classList.add("escondido");
  $("jogo").classList.remove("escondido");
  ativo = true; sessao++; criarCenario();
  ultimoTempo = 0;
  requestAnimationFrame(tempo => loop(tempo, sessao));
}
function voltarMenu() {
  ativo = false; sessao++; teclas = {};
  $("jogo").classList.add("escondido");
  $("menu").classList.remove("escondido");
  salvar();
}
function reiniciar() {
  if (!confirm("Recomeçar do início e apagar o progresso salvo?")) return;
  localStorage.removeItem(SALVO);
  fase = 1; missao = 1; pontos = 0; vidas = 3;
  if (!ativo) iniciar(); else criarCenario();
}
function colisao(a, b) {
  const wa = a.largura || a.tamanho, ha = a.altura || a.tamanho;
  const wb = b.largura || b.tamanho, hb = b.altura || b.tamanho;
  return a.x < b.x + wb && a.x + wa > b.x && a.y < b.y + hb && a.y + ha > b.y;
}
function mover(dx, dy) {
  const antigoX = jogador.x, antigoY = jogador.y;
  jogador.x = Math.max(0, Math.min(canvas.width - jogador.tamanho, jogador.x + dx));
  jogador.y = Math.max(0, Math.min(canvas.height - jogador.tamanho, jogador.y + dy));
  if (obstaculos.some(o => colisao(jogador, o))) { jogador.x = antigoX; jogador.y = antigoY; }
  if (colisao(jogador, objetivo) && !respondendo) abrirPergunta();
}
function abrirPergunta() {
  respondendo = true; teclas = {};
  $("pergunta").classList.remove("escondido");
  $("resultado").textContent = "";
  const indice = ((fase - 1) * MISSOES_POR_FASE + missao - 1) % perguntas.length;
  const atual = perguntas[indice];
  $("enunciado").textContent = atual.q;
  $("alternativas").replaceChildren();
  atual.op.forEach((opcao, indiceOpcao) => {
    const botao = document.createElement("button");
    botao.textContent = opcao;
    botao.addEventListener("click", () => responder(indiceOpcao, atual));
    $("alternativas").appendChild(botao);
  });
}
function responder(escolha, atual) {
  if (travado) return;
  travado = true;
  const botoes = [...$("alternativas").querySelectorAll("button")];
  botoes.forEach(b => b.disabled = true);
  const sessaoAtual = sessao;
  if (escolha === atual.certa) {
    pontos += 10;
    $("resultado").textContent = "✅ Muito bem! " + atual.dica;
    atualizarPainel(); salvar();
    setTimeout(() => { if (ativo && sessao === sessaoAtual) proximaMissao(); }, 1200);
  } else {
    vidas--;
    $("resultado").textContent = "💡 " + atual.dica;
    atualizarPainel(); salvar();
    setTimeout(() => {
      if (!ativo || sessao !== sessaoAtual) return;
      if (vidas <= 0) {
        vidas = 3; pontos = Math.max(0, pontos - 20);
        criarCenario();
        $("mensagem").textContent = "Você ganhou uma nova chance!";
      } else {
        travado = false;
        botoes.forEach(b => b.disabled = false);
        $("resultado").textContent = "Tente outra alternativa! " + atual.dica;
      }
    }, 1300);
  }
}
function proximaMissao() {
  missao++;
  if (missao > MISSOES_POR_FASE) { missao = 1; fase++; vidas = Math.min(3, vidas + 1); }
  if (fase > TOTAL_FASES) { vencer(); return; }
  criarCenario();
}
function vencer() {
  ativo = false; sessao++;
  $("pergunta").classList.add("escondido");
  $("mensagem").textContent = `🏆 PARABÉNS! Você completou 100 missões! Pontos: ${pontos}. Volte ao menu para jogar de novo.`;
  localStorage.removeItem(SALVO);
  fase = 1; missao = 1; pontos = 0; vidas = 3;
}
function desenhar() {
  ctx.clearRect(0, 0, 640, 400);
  ctx.fillStyle = "#4b9869"; ctx.fillRect(0, 0, 640, 400);
  for (let x = 0; x < 640; x += 40) for (let y = 0; y < 400; y += 40) {
    ctx.fillStyle = "#56a873"; ctx.fillRect(x + 8, y + 8, 8, 8);
  }
  ctx.fillStyle = "#c8b58a"; ctx.fillRect(0, 155, 640, 90);
  obstaculos.forEach(o => {
    ctx.fillStyle = "#683f28"; ctx.fillRect(o.x, o.y, 30, 30);
    ctx.fillStyle = "#ad7542"; ctx.fillRect(o.x + 4, o.y + 4, 22, 22);
    ctx.fillStyle = "#f2c16b"; ctx.fillRect(o.x + 10, o.y + 10, 10, 10);
  });
  ctx.fillStyle = "#ffda36";
  ctx.fillRect(objetivo.x + 8, objetivo.y, 12, 28);
  ctx.fillRect(objetivo.x, objetivo.y + 8, 28, 12);
  ctx.fillStyle = "#fff5aa"; ctx.fillRect(objetivo.x + 10, objetivo.y + 10, 8, 8);
  const x = Math.round(jogador.x), y = Math.round(jogador.y);
  ctx.fillStyle = "#292d47"; ctx.fillRect(x + 4, y, 16, 5);
  ctx.fillStyle = "#e6a66e"; ctx.fillRect(x + 4, y + 5, 16, 9);
  ctx.fillStyle = "#202030"; ctx.fillRect(x + 7, y + 8, 3, 3); ctx.fillRect(x + 15, y + 8, 3, 3);
  ctx.fillStyle = "#3279e5"; ctx.fillRect(x + 2, y + 14, 20, 7);
  ctx.fillStyle = "#26375a"; ctx.fillRect(x + 3, y + 21, 7, 3); ctx.fillRect(x + 14, y + 21, 7, 3);
}
function loop(tempo, idSessao) {
  if (!ativo || idSessao !== sessao) return;
  if (!ultimoTempo) ultimoTempo = tempo;
  const delta = Math.min((tempo - ultimoTempo) / 16.67, 2);
  ultimoTempo = tempo;
  if (!respondendo) {
    let dx = 0, dy = 0;
    if (teclas.arrowup || teclas.w || teclas.cima) dy--;
    if (teclas.arrowdown || teclas.s || teclas.baixo) dy++;
    if (teclas.arrowleft || teclas.a || teclas.esquerda) dx--;
    if (teclas.arrowright || teclas.d || teclas.direita) dx++;
    const modulo = Math.hypot(dx, dy) || 1;
    mover(dx / modulo * jogador.velocidade * delta, dy / modulo * jogador.velocidade * delta);
  }
  desenhar();
  requestAnimationFrame(t => loop(t, idSessao));
}
const movimentos = new Set(["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"]);
document.addEventListener("keydown", e => {
  const tecla = e.key.toLowerCase();
  if (movimentos.has(tecla) && ativo && !respondendo) { e.preventDefault(); teclas[tecla] = true; }
});
document.addEventListener("keyup", e => { teclas[e.key.toLowerCase()] = false; });
document.querySelectorAll("[data-direcao]").forEach(botao => {
  const direcao = botao.dataset.direcao;
  botao.addEventListener("pointerdown", e => { e.preventDefault(); botao.setPointerCapture(e.pointerId); teclas[direcao] = true; });
  const parar = () => { teclas[direcao] = false; };
  botao.addEventListener("pointerup", parar);
  botao.addEventListener("pointercancel", parar);
  botao.addEventListener("lostpointercapture", parar);
});
window.addEventListener("blur", () => { teclas = {}; });
$("iniciar").addEventListener("click", iniciar);
$("reiniciar").addEventListener("click", reiniciar);
$("voltar").addEventListener("click", voltarMenu);
carregar(); atualizarPainel();
if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./service-worker.js").catch(console.warn));
}
