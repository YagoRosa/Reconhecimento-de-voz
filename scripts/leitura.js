// verifica compatibilidade do Browser
try {
    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    var reconhecimento = new SpeechRecognition();
  }
  catch(e) {
    console.error(e);
    $('.sem-suporte').show();
    $('.aplicacao').hide();
  }
  
  // variaveis de controle
  var msg = new SpeechSynthesisUtterance();
  let vozes = [];
  var vozesDisponiveis = document.querySelector('[name="voz"]');
  var opcoes = document.querySelectorAll('[type="range"], [name="text"]');
  var botaoLerTexto = document.querySelector("#ditar");
  var botaoPausar = document.querySelector("#pausar");
  
  // mensagem que vai ser falada
  msg.texto = document.querySelector('[name="text"]').value;
  
  // Popula as opçoes de vozes disponiveis
  function preencherVozes() {
    vozes = this.getVoices();
    vozesDisponiveis.innerHTML = vozes
      .map(
        voz =>
          `<option value="${voz.name}">${voz.name} (${voz.lang})</option>`
      )
      .join("");
  }
  speechSynthesis.addEventListener("voiceschanged", preencherVozes);
  
  // Seleciona a voz escolhida pelo usuario
  function setVoice() {
    msg.voice = vozes.find((voice) => voice.name === this.value);
  }
  vozesDisponiveis.addEventListener("change", setVoice);
  
  // Declaração das opcoes
  function escolherOpcao() {
    msg[this.name] = this.value;
    toggle();
  }
  
  opcoes.forEach((opcao) => opcao.addEventListener("change", escolherOpcao));
  
  // Controla as opções
  function toggle(recomecar = true) {
    speechSynthesis.cancel();
    if (recomecar) {
      speechSynthesis.speak(msg);
    }
  }
  botaoLerTexto.addEventListener("click", toggle);
  botaoPausar.addEventListener("click", () => toggle(false));
  