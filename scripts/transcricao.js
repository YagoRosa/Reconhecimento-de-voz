try {
    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    var reconhecimento = new SpeechRecognition();
  }
  catch(e) {
    console.error(e);
    $('.sem-suporte').show();
    $('.aplicacao').hide();
  }
  
  
  var areaAnotacoes = $('#area-anotacoes');
  var instrucoes = $('#instrucoes');
  var listaAnotacoes = $('ul#lista-anotacoes');
  
  var conteudoAnotacoes = '';
  
  // Pega as anotaçoes do local storage e mostra elas 
  var anotacoes = carregarAnotacoes();
  mostarAnotacoes(anotacoes);
  
  
  
  // Reconhecomento continuo de voz
  reconhecimento.continuous = true;
  
  // Bloco chamado toda vez que a API captura uma linha  
  reconhecimento.onresult = function(evento) {
    var atual = evento.resultIndex;
    var transcrever = evento.results[atual][0].transcript;

    // Correção de bug mobile
    var mobileRepeatBug = (atual == 1 && transcrever == evento.results[0][0].transcript);
  
    if(!mobileRepeatBug) {
      conteudoAnotacoes += transcrever;
      areaAnotacoes.val(conteudoAnotacoes);
    }
  };
  
  // Indica que o app está capturando áudio 
  reconhecimento.onstart = function() { 
    instrucoes.text('Xandão ta te ouvindo.');
  }
  // Indica que o app parou de capturar o áudio
  reconhecimento.onspeechend = function() {
    instrucoes.text('Você não disse nada por um tempo então Xandão foi descansar.');
  }
  // Indica alguma falha em capturar o áudio
  reconhecimento.onerror = function(evento) {
    if(evento.error == 'sem-fala') {
      instrucoes.text('Xandão não conseguiu te ouvir.');  
    };
  }
  
  // Botões
  $('#iniciar-rec-btn').on('click', function(e) {
    if (conteudoAnotacoes.length) {
      conteudoAnotacoes += ' ';
    }
    reconhecimento.start();
  });
  
  $('#pausar-rec-btn').on('click', function(e) {
    reconhecimento.stop();
    instrucoes.text('Reconhecimento de voz pausado.');
  });
  
  // Joga o texto da 'textarea' na variavel 'conteudoAnotacoes'
  areaAnotacoes.on('input', function() {
    conteudoAnotacoes = $(this).val();
  })
  
  $('#salvar-rec-btn').on('click', function(e) {
    reconhecimento.stop();

    //verifica se a anotação está vazia
    if(!conteudoAnotacoes.length) {
      instrucoes.text('Não e possivel salvar uma anotação vazia.');
    }
    else {
      // Salva no localstorage
      salvarAnotacao(new Date().toLocaleString(), conteudoAnotacoes);
  
      // Reseta as variaveis e recarrega a interface
      conteudoAnotacoes = '';
      mostarAnotacoes(carregarAnotacoes());
      areaAnotacoes.val('');
      instrucoes.text('Xandão salvou sua anotação.');
    }
        
  })
  
  // Coloca as anotações em lista
  listaAnotacoes.on('click', function(e) {
    e.preventDefault();
    var anotacaoAlvo = $(e.target);
  
    // Permite ouvir a anotação
    if(anotacaoAlvo.hasClass('ouvir-anotacao')) {
      var conteudo = anotacaoAlvo.closest('.anotacao').find('.conteudo').text();
      vozAlta(conteudo);
    }
  
    // Deleta anotação.
    if(anotacaoAlvo.hasClass('deletar-anotacao')) {
      var dataHora = anotacaoAlvo.siblings('.data').text();  
      deletarAnotacao(dataHora);
      anotacaoAlvo.closest('.anotacao').remove();
    }
  });
  
  // Sintese de voz
  function vozAlta(mensagem) {
      var fala = new SpeechSynthesisUtterance();
  
    // Controla os atributos da voz
      fala.text = mensagem;
      fala.volume = 1;
      fala.rate = 1;
      fala.pitch = 1;
    
      window.speechSynthesis.speak(fala);
  }
  
  
  // Adiciona ao HTML a lista com as anotaçoes
  function mostarAnotacoes(anotacoes) {
    var html = '';
    if(anotacoes.length) {
      anotacoes.forEach(function(anotacao) {
        html+= `<li class="anotacao">
          <p class="header">
            <span class="data">${anotacao.data}</span>
            <a href="#" class="ouvir-anotacao" title="Ouvir anotação">Ouvir anotação</a>
            <a href="#" class="deletar-anotacao" title="Deletar anotação">Deletar</a>
          </p>
          <p class="conteudo">${anotacao.conteudo}</p>
        </li>`;    
      });
    }
    else {
      html = '<li><p class="conteudo"><strong class="texto-azul">Xandão</strong> ainda não tem nenhuma anotação sua :(</p></li>';
    }
    listaAnotacoes.html(html);
  }
  
  // Salva anotação com data e hora no localstorage
  function salvarAnotacao(dataHora, conteudo) {
    localStorage.setItem('anotacao-' + dataHora, conteudo);
  }
  
  // Carrega as anotaçoes
  function carregarAnotacoes() {
    var anotacoes = [];
    var chave;
    for (var i = 0; i < localStorage.length; i++) {
      chave = localStorage.key(i);
  
      if(chave.substring(0,9) == 'anotacao-') {
        anotacoes.push({
          data: chave.replace('anotacao-',''),
          conteudo: localStorage.getItem(localStorage.key(i))
        });
      } 
    }
    return anotacoes;
  }
  
  // Deleta anotaçoes
  function deletarAnotacao(dataHora) {
    localStorage.removeItem('anotacao-' + dataHora); 
  }
  
  