// script.js
// ============================================================
// Elementos do DOM
// ============================================================
const btnLogin = document.getElementById("btnLogin");
const btnCadastro = document.getElementById("btnCadastro");
const btnVoiceToggle = document.getElementById("btnVoiceToggle");

const loginSection = document.getElementById("loginSection");
const cadastroSection = document.getElementById("cadastroSection");

const loginForm = document.getElementById("loginForm");
const cadastroForm = document.getElementById("cadastroForm");
const btnCadastroLink = document.getElementById("btnCadastroLink");
const btnLoginLink = document.getElementById("btnLoginLink");
const passwordToggles = document.querySelectorAll(".password-toggle");

const voiceStatus = document.getElementById("voiceStatus");
const feedbackGlobal = document.getElementById("feedbackGlobal");

// ============================================================
// Mapeamento de campos para validação
// ============================================================
const loginFields = [
  { id: "loginEmail", label: "E-mail", validate: (v) => v.trim() !== "" ? "" : "Informe seu e-mail." },
  { id: "loginSenha", label: "Senha", validate: (v) => v.trim() !== "" ? "" : "Informe sua senha." }
];

const cadastroFields = [
  { id: "nome", label: "Nome Completo", validate: (v) => v.trim().length >= 3 ? "" : "Nome deve ter ao menos 3 caracteres." },
  { id: "emailCadastro", label: "E-mail", validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "" : "Informe um e-mail válido." },
  { id: "telefone", label: "Telefone", validate: (v) => v.replace(/\D/g, "").length >= 10 ? "" : "Informe um telefone com DDD (mín. 10 dígitos)." },
  { id: "senhaCadastro", label: "Senha", validate: (v) => v.length >= 6 ? "" : "Senha deve ter ao menos 6 caracteres." },
  { id: "confirmarSenha", label: "Confirmar Senha", validate: (v) => {
    const senha = document.getElementById("senhaCadastro").value;
    return v === senha && v !== "" ? "" : "As senhas não coincidem.";
  }}
];

// ============================================================
// Utilitários
// ============================================================
function getField(id) {
  return document.getElementById(id);
}

function getMsg(id) {
  return document.getElementById(id + "-msg");
}

function limparFormulario(form) {
  const inputs = form.querySelectorAll("input");
  inputs.forEach(inp => {
    inp.value = "";
    inp.classList.remove("erro", "sucesso");
    const msg = getMsg(inp.id);
    if (msg) { msg.textContent = ""; msg.className = "campo-msg"; }
  });
}

function mostrarFeedback(texto, tipo) {
  feedbackGlobal.textContent = texto;
  feedbackGlobal.className = "feedback-global";
  if (tipo) feedbackGlobal.classList.add(tipo);
}

function definirFocoPrimeiroCampo(section) {
  const firstInput = section.querySelector("input");
  if (firstInput) setTimeout(() => firstInput.focus(), 100);
}

// ============================================================
// Validação de campo individual (tempo real)
// ============================================================
function validarCampo(input, fieldConfig) {
  const valor = input.value;
  const msg = getMsg(input.id);
  const erro = fieldConfig.validate(valor);

  input.classList.remove("erro", "sucesso");
  if (msg) { msg.textContent = ""; msg.className = "campo-msg"; }

  if (erro) {
    input.classList.add("erro");
    input.setAttribute("aria-invalid", "true");
    if (msg) { msg.textContent = erro; msg.className = "campo-msg erro"; }
    return false;
  }

  if (valor.trim() !== "") {
    input.classList.add("sucesso");
    input.setAttribute("aria-invalid", "false");
    if (msg) { msg.textContent = "✓"; msg.className = "campo-msg sucesso"; }
  }
  return true;
}

// ============================================================
// Validação de formulário completo
// ============================================================
function validarFormulario(form, fieldsConfig) {
  let valido = true;
  const primeiroInvalido = [];

  fieldsConfig.forEach(cfg => {
    const input = getField(cfg.id);
    if (!input) return;
    const ok = validarCampo(input, cfg);
    if (!ok) {
      valido = false;
      if (primeiroInvalido.length === 0) primeiroInvalido.push(input);
    }
  });

  if (!valido && primeiroInvalido.length > 0) {
    primeiroInvalido[0].focus();
  }

  return valido;
}

// ============================================================
// Vinculando validação em tempo real nos campos
// ============================================================
function configurarValidacaoCampos(fieldsConfig) {
  fieldsConfig.forEach(cfg => {
    const input = getField(cfg.id);
    if (!input) return;

    input.addEventListener("blur", () => validarCampo(input, cfg));
    input.addEventListener("input", () => {
      if (input.classList.contains("erro") || input.value.trim() !== "") {
        validarCampo(input, cfg);
      }
    });
  });
}

configurarValidacaoCampos(loginFields);
configurarValidacaoCampos(cadastroFields);

passwordToggles.forEach(toggle => {
  toggle.addEventListener("click", () => {
    const wrap = toggle.closest(".input-wrap");
    if (!wrap) return;
    const input = wrap.querySelector("input");
    if (!input) return;

    const mostrarSenha = input.type === "password";
    input.type = mostrarSenha ? "text" : "password";
    toggle.classList.toggle("active", mostrarSenha);
    toggle.setAttribute("aria-label", mostrarSenha ? "Ocultar senha" : "Mostrar senha");
  });
});

// ============================================================
// Alternar telas
// ============================================================
function mostrarSecao(section) {
  loginSection.classList.remove("active");
  cadastroSection.classList.remove("active");
  section.classList.add("active");
  definirFocoPrimeiroCampo(section);
  
  const heading = section.querySelector("h2");
  if (heading) {
    const anuncio = document.createElement("div");
    anuncio.setAttribute("aria-live", "polite");
    anuncio.textContent = heading.textContent;
    anuncio.style.position = "absolute";
    anuncio.style.height = "1px";
    anuncio.style.width = "1px";
    anuncio.style.overflow = "hidden";
    document.body.appendChild(anuncio);
    setTimeout(() => anuncio.remove(), 3000);
  }
}

btnLogin.addEventListener("click", () => mostrarSecao(loginSection));
btnCadastro.addEventListener("click", () => mostrarSecao(cadastroSection));

if (btnCadastroLink) {
  btnCadastroLink.addEventListener("click", (event) => {
    event.preventDefault();
    mostrarSecao(cadastroSection);
  });
}

if (btnLoginLink) {
  btnLoginLink.addEventListener("click", (event) => {
    event.preventDefault();
    mostrarSecao(loginSection);
  });
}

// ============================================================
// LOGIN - Submit
// ============================================================
loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!validarFormulario(loginForm, loginFields)) return;

  mostrarFeedback("Login realizado com sucesso! ✓", "sucesso");
  falar("Login realizado com sucesso.");
  limparFormulario(loginForm);
});

// ============================================================
// CADASTRO - Submit
// ============================================================
cadastroForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!validarFormulario(cadastroForm, cadastroFields)) return;

  mostrarFeedback("Cadastro realizado com sucesso! ✓", "sucesso");
  falar("Cadastro realizado com sucesso.");
  limparFormulario(cadastroForm);
});

// ============================================================
// Navegação por teclado
// ============================================================
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    feedbackGlobal.textContent = "";
    feedbackGlobal.className = "feedback-global";
  }

  if (event.key === "v" || event.key === "V") {
    if (!event.ctrlKey && !event.metaKey && !event.altKey) {
      toggleVoiceAssistant();
    }
  }
});

// ============================================================
// ASSISTENTE DE VOZ - Speech Synthesis (Saída de Voz)
// ============================================================
let synth = window.speechSynthesis;
let utterance = null;

function falar(texto, callback) {
  if (!synth) return;

  const estavaOuvindo = ouvindo;
  if (estavaOuvindo) {
    pararEscuta();
  }

  window.speechSynthesis.cancel();

  utterance = new SpeechSynthesisUtterance(texto);
  utterance.lang = "pt-BR";
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  const vozes = synth.getVoices();
  const vozPT = vozes.find(v => v.lang.startsWith("pt"));
  if (vozPT) utterance.voice = vozPT;

  utterance.onstart = () => {
    voiceStatus.textContent = "🎙️ Falando: " + texto;
    voiceStatus.className = "voice-status speaking";
  };

  utterance.onend = () => {
    voiceStatus.textContent = "✓ Assistente de voz pronto.";
    voiceStatus.className = "voice-status";
    
    if (estavaOuvindo) {
      restartTimeout = setTimeout(() => {
        iniciarEscuta();
      }, 400);
    }
    if (callback) callback();
  };

  utterance.onerror = () => {
    voiceStatus.textContent = "⚠️ Erro ao reproduzir áudio.";
    voiceStatus.className = "voice-status error";
    if (callback) callback();
  };

  synth.speak(utterance);
}

if (synth) {
  synth.getVoices();
  synth.onvoiceschanged = () => synth.getVoices();
}

// ============================================================
// ASSISTENTE DE VOZ - Speech Recognition (Entrada de Voz)
// ============================================================
let recognition = null;
let ouvindo = false;
let restartTimeout = null;
let retryCount = 0;
const MAX_RETRIES = 3;

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

// Inicializa o objeto do reconhecimento uma única vez no escopo correto
if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.lang = "pt-BR";
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 5;
}

function toggleVoiceAssistant() {
  if (!SpeechRecognition) {
    voiceStatus.textContent = "⚠️ Seu navegador não suporta reconhecimento de voz. Use Chrome ou Edge.";
    voiceStatus.className = "voice-status error";
    falar("Seu navegador não suporta reconhecimento de voz. Use Chrome ou Edge.");
    return;
  }

  if (ouvindo) {
    pararEscuta();
  } else {
    iniciarEscuta();
  }
}

function iniciarEscuta() {
  if (!recognition || ouvindo) return;

  try {
    recognition.onstart = () => {
      ouvindo = true;
      btnVoiceToggle.classList.add("active");
      btnVoiceToggle.setAttribute("aria-pressed", "true");
      btnVoiceToggle.setAttribute("aria-label", "Desativar assistente de voz");
      voiceStatus.textContent = "🎤 Ouvindo... Fale um comando.";
      voiceStatus.className = "voice-status listening";
    };

    recognition.onresult = (event) => {
      const lastResult = event.results[event.results.length - 1];
      if (lastResult.isFinal) {
        const comando = lastResult[0].transcript.toLowerCase().trim();
        if (comando) {
          voiceStatus.textContent = `🗣️ Você disse: "${comando}"`;
          processarComandoVoz(comando);
        }
      } else {
        const parcial = lastResult[0].transcript.toLowerCase().trim();
        if (parcial) {
          voiceStatus.textContent = `🎤 "${parcial}"`;
          voiceStatus.className = "voice-status listening";
        }
      }
    };

    recognition.onerror = (event) => {
      console.error("Erro de reconhecimento de voz:", event.error);

      // Trata pausas e silêncios reiniciando sem travar a interface
      if (event.error === "no-speech" || event.error === "aborted") {
        if (ouvindo) {
          restartTimeout = setTimeout(() => { if (ouvindo) recognition.start(); }, 400);
        }
        return;
      }

      if (event.error === "network") {
        retryCount++;
        if (retryCount <= MAX_RETRIES && ouvindo) {
          voiceStatus.textContent = `🔄 Reconectando... (tentativa ${retryCount}/${MAX_RETRIES})`;
          restartTimeout = setTimeout(() => { if (ouvindo) recognition.start(); }, 1500);
          return;
        }
        retryCount = 0;
        voiceStatus.textContent = "⚠️ Serviço de voz indisponível devido à rede.";
        voiceStatus.className = "voice-status error";
        pararEscuta();
        return;
      }

      let mensagem = "⚠️ Erro no reconhecimento de voz.";
      if (event.error === "audio-capture") {
        mensagem = "⚠️ Microfone não encontrado.";
      } else if (event.error === "not-allowed") {
        mensagem = "⚠️ Permissão do microfone negada.";
      }

      voiceStatus.textContent = message;
      voiceStatus.className = "voice-status error";
      falar(mensagem);
      pararEscuta();
    };

    recognition.onend = () => {
      if (ouvindo) {
        restartTimeout = setTimeout(() => { if (ouvindo) recognition.start(); }, 300);
      }
    };

    recognition.start();
    ouvindo = true;

  } catch (e) {
    console.error("Erro ao iniciar reconhecimento de voz:", e);
    pararEscuta();
  }
}

function pararEscuta() {
  ouvindo = false;
  if (restartTimeout) {
    clearTimeout(restartTimeout);
    restartTimeout = null;
  }
  if (recognition) {
    try {
      recognition.abort();
    } catch(e) { /* ignora */ }
  }
  btnVoiceToggle.classList.remove("active");
  btnVoiceToggle.setAttribute("aria-pressed", "false");
  btnVoiceToggle.setAttribute("aria-label", "Ativar assistente de voz");
  voiceStatus.textContent = "✓ Assistente de voz desativado.";
  voiceStatus.className = "voice-status";
}

btnVoiceToggle.addEventListener("click", toggleVoiceAssistant);

// ============================================================
// Mapeamento de campos para comandos de voz
// ============================================================
const campoMapping = [
  { chave: "email", ids: ["loginEmail", "emailCadastro"] },
  { chave: "e-mail", ids: ["loginEmail", "emailCadastro"] },
  { chave: "e mail", ids: ["loginEmail", "emailCadastro"] },
  { chave: "i mail", ids: ["loginEmail", "emailCadastro"] },
  { chave: "senha cadastro", ids: ["senhaCadastro"] },
  { chave: "confirmar senha", ids: ["confirmarSenha"] },
  { chave: "senha", ids: ["loginSenha", "senhaCadastro"] },
  { chave: "nome completo", ids: ["nome"] },
  { chave: "nome", ids: ["nome"] },
  { chave: "telefone", ids: ["telefone"] },
  { chave: "fone", ids: ["telefone"] },
  { chave: "whatsapp", ids: ["telefone"] }
];

function normalizarEmailFalado(texto) {
  if (/^[a-z0-9._-]+@[a-z0-9._-]+\.[a-z]{2,}$/i.test(texto.trim())) {
    return texto.trim();
  }

  let email = texto.toLowerCase().trim();
  email = email
    .replace(/\barroba\b/g, "@")
    .replace(/\b(g[- ]?mail|g mail)\b/g, "gmail")
    .replace(/\b(hotmail|hotmlail|hotmial|hotmali|hotm[ae]il|hot mail)\b/g, "hotmail")
    .replace(/\bponto\s+com\b/g, ".com")
    .replace(/\bponto\s+com\s+br\b/g, ".com.br")
    .replace(/\bponto\s+net\b/g, ".net")
    .replace(/\bponto\s+org\b/g, ".org")
    .replace(/\bponto\s+gov\b/g, ".gov")
    .replace(/\bponto\b/g, ".")
    .replace(/\b(underline|underlin|traco|traço|hifen|hífen|risco)\b/g, "_")
    .replace(/ /g, "")
    .replace(/arroba/g, "@");

  email = email.replace(/[^a-z0-9@._-]/g, "");

  if (email.includes("@") && !email.includes(".", email.indexOf("@"))) {
    email = email.replace(/@([a-z]+)(com|net|org|gov|br)$/, "@$1.$2");
  }

  return email;
}

function limparValorCampoVoz(chave, valor) {
  valor = valor.trim();
  if (chave === "senha" || chave === "senha cadastro") {
    valor = valor
      .replace(/\b(e|o|a|os|as|meu|minha|senha|número|numero|números|numeros|com|de|do|da|por|para|pra)\b/gi, "")
      .replace(/\s+/g, "")
      .trim();
  }

  if (chave === "telefone") {
    valor = valor.replace(/[^0-9+]/g, "").trim();
  }

  return valor;
}

function ehComandoNavegacao(comando) {
  const palavras = comando.trim().split(/\s+/);
  if (palavras.length > 3) return false;

  const palavrasCampo = ["email", "senha", "nome", "telefone", "fone", "whatsapp"];
  for (const p of palavrasCampo) {
    if (comando.includes(p)) return false;
  }
  return true;
}

// ============================================================
// Processamento de comandos de voz
// ============================================================
function processarComandoVoz(comando) {
  const comandoNormalizado = comando
    .replace(/\be\s?mail\b/g, "email")
    .replace(/\bi\s?mail\b/g, "email")
    .replace(/\b(g[- ]?mail|g mail)\b/g, "gmail")
    .replace(/\b(hotmail|hotmlail|hotmial|hotmali|hotm[ae]il|hot mail)\b/g, "hotmail");

  // PRIORIDADE 1: PREENCHER CAMPOS
  for (const { chave, ids } of campoMapping) {
    if (comandoNormalizado.includes(chave)) {
      const regex = new RegExp(chave.replace(/[- ]/g, "[- ]?") + "\\s+(.+)", "i");
      const match = comandoNormalizado.match(regex);
      if (match && match[1]) {
        let valor = match[1].trim();

        const ehEmail = chave.includes("email") || chave.includes("e-mail") || chave === "i mail" || chave === "e mail";
        if (ehEmail) {
          valor = normalizarEmailFalado(valor);
        } else {
          valor = limparValorCampoVoz(chave, valor);
        }

        const secaoAtiva = loginSection.classList.contains("active") ? "login" : "cadastro";
        let inputId = null;

        if (secaoAtiva === "login") {
          inputId = ids.find(id => id.startsWith("login")) || null;
        } else {
          inputId = ids.find(id => !id.startsWith("login")) || ids[0];
        }

        if (inputId) {
          const input = getField(inputId);
          if (input) {
            input.value = valor;
            input.focus();

            const event = new Event("blur", { bubbles: true });
            input.dispatchEvent(event);

            if (ehEmail) {
              falar(`Email ${valor} preenchido.`);
            } else {
              falar(`Campo ${chave} preenchido.`);
            }
            return;
          }
        }
      }
    }
  }

  // PRIORIDADE 2: NAVEGAÇÃO
  if (ehComandoNavegacao(comando)) {
    if (comando === "login" || comando === "logar" || comando === "entrar") {
      mostrarSecao(loginSection);
      falar("Tela de login aberta.");
      return;
    }

    if (comando === "cadastro" || comando === "criar conta" || comando === "registrar") {
      mostrarSecao(cadastroSection);
      falar("Tela de cadastro aberta.");
      return;
    }
  }

  // PRIORIDADE 3: AÇÕES
  if (comando === "enviar" || comando === "confirmar" || comando === "ok") {
    const secaoAtiva = loginSection.classList.contains("active") ? loginSection : cadastroSection;
    const formAtivo = secaoAtiva.querySelector("form");
    if (formAtivo) {
      formAtivo.dispatchEvent(new Event("submit"));
      return;
    }
  }

  if (comando === "limpar" || comando === "reset" || comando === "apagar" || comando === "clear") {
    const secaoAtiva = loginSection.classList.contains("active") ? loginSection : cadastroSection;
    const formAtivo = secaoAtiva.querySelector("form");
    if (formAtivo) {
      limparFormulario(formAtivo);
      falar("Formulário limpo.");
    }
    return;
  }

  // PRIORIDADE 4: AJUDA E CONTROLE
  if (comando === "ajuda" || comando === "comandos" || comando === "o que fazer" || comando === "help") {
    const ajuda = "Comandos disponíveis: Login, Cadastro, preencher campos, enviar ou limpar formulário.";
    falar(ajuda);
    return;
  }

  if (comando === "desativar" || comando === "parar" || comando === "silêncio" || comando === "desliga") {
    pararEscuta();
    falar("Assistente de voz desativado.");
    return;
  }

  falar("Comando não reconhecido. Diga ajuda para conhecer os comandos.");
}

// ============================================================
// Feedback de boas-vindas
// ============================================================
window.addEventListener("load", () => {
  setTimeout(() => {
    voiceStatus.textContent = "💡 Pressione o botão 🎤 Voz ou a tecla V para usar comandos de voz.";
    voiceStatus.className = "voice-status";
    falar("Bem vindo ao sistema OdontoCare. Pressione a tecla V para ativar o assistente de voz.");
  }, 1000);
});