import type { Dict } from "./es";

export const pt: Dict = {
  meta: {
    locale: "pt-BR",
    title: "Aegis Home · O escudo do lar",
  },
  common: {
    homeAria: "Aegis Home, início",
    tagline: "O escudo do lar",
    skipToContent: "Pular para o conteúdo",
    language: "Idioma",
    close: "Fechar",
    copy: "Copiar",
    copied: "Copiado!",
    useSample: "Usar imagem de exemplo",
    noPhotoAtHand: "Não tem uma foto à mão?",
    materials: "Precisa de:",
    floorShare: (pct: number) => `Ocupa ${pct}% do piso visível`,
  },
  theme: {
    title: "Aparência",
    text: "Claro ou escuro. «Sistema» segue a configuração do seu dispositivo.",
    system: "Sistema",
    light: "Claro",
    dark: "Escuro",
    toLight: "Mudar para o modo claro",
    toDark: "Mudar para o modo escuro",
  },
  rooms: {
    bathroom: "Banheiro",
    kitchen: "Cozinha",
    bedroom: "Quarto",
    living_room: "Sala",
    hallway: "Corredor",
    stairs: "Escada",
    entrance: "Entrada",
    outdoor: "Quintal ou área externa",
    other: "Outro cômodo",
  },
  // Framed as when to act, not how alarming it is: calmer, and it says what to do.
  severity: { high: "Resolver primeiro", medium: "Resolver logo", low: "Quando puder" },
  cost: {
    free: "Sem custo",
    approx: (value: string) => `Aprox. ${value}`,
  },
  samples: {
    livingRoom: "Sala com fios e piso molhado",
    bedroom: "Quarto com coisas no chão",
  },
  errors: {
    generic: "Ocorreu um erro inesperado. Tente novamente.",
    network: "Não foi possível conectar ao serviço. Verifique sua conexão e tente novamente.",
    sampleLoad: "Não foi possível carregar a imagem de exemplo.",
    imageTooBig: "A foto é grande demais. Use uma com menos de 25 MB.",
    imageUnreadable: "Não foi possível ler a imagem. Use uma foto JPG, PNG ou WebP.",
    imageUnsupported: "Seu navegador não consegue processar a imagem.",
    imagePrepare: "Não foi possível preparar a imagem.",
    codes: {
      BAD_REQUEST: "A solicitação não é válida.",
      UNAUTHORIZED: "Este link não é mais válido ou a avaliação expirou.",
      NOT_FOUND: "Não encontramos o que você procura.",
      PAYLOAD_TOO_LARGE: "O arquivo é grande demais.",
      UNSUPPORTED_MEDIA_TYPE: "Tipo de arquivo não suportado. Use uma foto JPG, PNG ou WebP.",
      VALIDATION_ERROR: "Alguns dados não são válidos.",
      RATE_LIMITED: "Muitas solicitações. Aguarde um momento e tente novamente.",
      AI_PROVIDER_ERROR: "O serviço de análise não está disponível. Tente mais tarde.",
      INTERNAL_ERROR: "Ocorreu um erro no servidor. Tente novamente.",
    },
  },
  privacy: {
    title: "Antes de começar",
    items: [
      "As fotos são analisadas com inteligência artificial da Meta e este app não as guarda.",
      "Evite fotos com pessoas, rostos ou documentos.",
      "A análise aponta riscos do ambiente; não substitui a opinião de um profissional nem dá conselhos médicos.",
      "Não é um serviço de emergência.",
    ],
    accept: "Entendo e quero continuar",
  },
  progress: {
    seconds: (seconds: number) => `${seconds} s`,
    review: "Revisando a foto…",
    search: "Procurando o que poderia causar uma queda…",
    slow: "Pode levar até um minuto se o serviço estava em repouso.",
    previewAlt: "Foto sendo analisada",
  },
  fallback: {
    cachedTitle: "Resultado salvo anteriormente",
    mockTitle: "Resultado de exemplo",
    cachedNotice:
      "O serviço de análise não está disponível no momento. Mostramos uma análise real feita antes para esta mesma foto.",
    mockNotice: "Resultado de exemplo: o serviço de análise não está disponível no momento.",
  },
  share: {
    title: "Compartilhar com a família",
    warning:
      "Qualquer pessoa com este link pode ver e atualizar o plano desta casa. Compartilhe apenas com pessoas de confiança.",
    linkLabel: "Link do plano",
    promptCopy: "Copie este link:",
    shareButton: "Compartilhar o plano",
    message:
      "Este é o plano do Aegis Home para deixar a casa mais segura. Com este link você pode vê-lo e marcar o que já foi resolvido.",
  },
  landingNav: {
    aria: "Seções da página",
    sections: {
      how: "Como funciona",
      features: "Benefícios",
      example: "Exemplo",
      privacy: "Privacidade",
      about: "Sobre",
      faq: "Perguntas",
    },
    myEvaluation: "Meu plano",
    settings: "Idioma e aparência",
    start: "Analisar foto",
    openMenu: "Abrir menu",
    closeMenu: "Fechar menu",
  },
  hero: {
    badge: "Feito com a IA da Meta",
    titleA: "Descubra o que pode causar uma queda na casa dos seus pais.",
    titleB: "Com uma única foto.",
    intro:
      "Tire uma foto do banheiro, da cozinha ou do corredor. A IA marca cada risco na sua foto e entrega uma lista de ajustes simples, ordenados por urgência e com custo aproximado.",
    continue: "Continuar minha avaliação",
    analyze: "Analisar uma foto grátis",
    seeExample: "Ver um exemplo real",
    trust: [
      "Grátis e sem criar conta",
      "As fotos não são guardadas",
      "Resultado em um minuto ou menos",
    ],
    photoAlt: "Foto de exemplo de uma sala com riscos destacados",
    highRisk: "Resolver primeiro",
    planOf: "Plano desta sala",
    fixes: "ajustes",
    caption: "Resultado real do Muse Spark e do SAM 3.1 sobre uma imagem de exemplo gerada com IA.",
  },
  problem: {
    eyebrow: "Por que importa",
    story:
      "Sua mãe se levanta à noite para ir ao banheiro. O corredor está escuro, o piso continua molhado e não há onde se apoiar. São detalhes que vemos todos os dias e quase nunca notamos.",
    statLead: "As quedas são a",
    statValue: "2ª",
    statLabel: "causa de morte por lesões não intencionais no mundo",
    sourceLabel: "Fonte:",
    whoLink: "Organização Mundial da Saúde",
    whoUrl: "https://www.who.int/news-room/fact-sheets/detail/falls",
    detail:
      "As pessoas com mais de 60 anos são as mais afetadas. Muitas quedas começam em casa, com coisas que podem ser resolvidas com pouco dinheiro.",
    risks: [
      { title: "Pisos molhados ou lisos", text: "Banheiros e cozinhas sem tapete antiderrapante." },
      { title: "Tapetes soltos e fios", text: "Bordas levantadas e objetos no caminho." },
      { title: "Escadas sem corrimão", text: "Degraus sem apoio nem boa iluminação." },
      { title: "Pouca luz à noite", text: "Corredores escuros a caminho do banheiro." },
    ],
  },
  how: {
    eyebrow: "Como funciona",
    title: "De uma foto a um plano de ação",
    intro: "Sem instalar nada nem criar uma conta.",
    steps: [
      {
        title: "Tire uma foto",
        text: "Em pé, mostrando o piso e por onde se anda: banheiro, cozinha, escada, corredores. A foto é reduzida e os dados de localização são removidos no seu dispositivo.",
      },
      {
        title: "A IA encontra os riscos",
        text: "O Muse Spark, modelo de visão da Meta, identifica cada risco, sua gravidade, como resolvê-lo em palavras simples e quanto pode custar.",
      },
      {
        title: "Marca os riscos na sua foto",
        text: "O SAM 3.1, modelo de segmentação da Meta, localiza cada risco e o destaca na sua própria foto, com um número.",
      },
      {
        title: "Siga seu plano",
        text: "Os ajustes ficam ordenados por prioridade, com o custo pendente. Marque-os ao terminar e compartilhe com a família.",
      },
    ],
    planTitle: "Plano de ação",
  },
  analysis: {
    eyebrow: "Análise com IA",
    title: "Experimente agora",
    intro:
      "Explore um resultado real ou comece com uma foto da casa. Se não tiver uma à mão, use uma imagem de exemplo: a análise é feita ao vivo com a IA da Meta.",
    demoTitle: "Exemplo: uma sala",
    recorded: "Resultado real gravado",
    demoHint: "Toque em um número ou em um risco para destacá-lo.",
    demoAlt: "Foto de exemplo de uma sala",
    demoCaption:
      "Resposta do Muse Spark e do SAM 3.1 sobre uma imagem de exemplo gerada com IA (não é uma casa real).",
    startTitle: "Analise sua primeira foto",
    nameLabel: "Nome para esta casa (opcional)",
    namePlaceholder: "Ex.: Casa da vovó",
    creating: "Criando…",
    start: "Analisar uma foto",
    checkFirst: "Marque a caixa para continuar.",
    showAll: (n: number) => `Ver os ${n} riscos`,
    showLess: "Ver menos",
  },
  features: {
    eyebrow: "O que você recebe",
    title: "Tudo o que precisa para agir, nada além",
    items: [
      {
        title: "Riscos destacados na foto",
        text: "Cada risco tem um número e um contorno sobre a sua própria foto.",
      },
      {
        title: "Plano por prioridade",
        text: "Primeiro o mais urgente. Cada ajuste explicado em palavras simples.",
      },
      {
        title: "Custos locais",
        text: "Preços aproximados de materiais fáceis de encontrar na América Central.",
      },
      {
        title: "Acompanhamento",
        text: "Marque “Já resolvi” e veja quanto falta e quanto vai custar.",
      },
      {
        title: "Em família",
        text: "Compartilhe um link privado para que irmãos ou primos ajudem com o plano.",
      },
    ],
  },
  tech: {
    title: "Dois modelos da Meta trabalhando juntos",
    intro:
      "O Muse Spark entende a cena e decide o que é perigoso; o SAM 3.1 encontra exatamente onde está. Cada resposta é verificada antes de ser exibida.",
    step: (n: number) => `Passo ${n}`,
    pipeline: [
      {
        name: "Sua foto",
        detail: "É reduzida e os dados de localização são removidos no seu dispositivo.",
      },
      {
        name: "Muse Spark 1.3",
        detail: "Visão da Meta: riscos, gravidade, ajuste e custo em JSON.",
      },
      { name: "SAM 3.1", detail: "Segmentação da Meta: encontra cada objeto na imagem." },
      { name: "Seu plano", detail: "Validado, ordenado por prioridade e pronto para seguir." },
    ],
    honesty:
      "Se o serviço de IA não responder, o app avisa com clareza e nunca apresenta um exemplo como se fosse uma análise nova.",
  },
  privacySection: {
    eyebrow: "Privacidade e segurança",
    title: "Feito para cuidar, inclusive dos seus dados",
    intro:
      "As fotos de uma casa são informação sensível. O Aegis Home guarda o mínimo e pelo menor tempo possível.",
    warning:
      "Evite fotos com pessoas, rostos ou documentos. As fotos são enviadas à IA da Meta para análise.",
    items: [
      {
        title: "Fotos que não são guardadas",
        text: "São analisadas em memória e descartadas. Fica apenas a lista de riscos.",
      },
      {
        title: "Sem contas nem e-mails",
        text: "Não pedimos nome, e-mail nem telefone. Um link privado identifica a avaliação.",
      },
      {
        title: "Apaga sozinha",
        text: "Cada avaliação expira em 30 dias, e você pode apagá-la antes com um botão.",
      },
      {
        title: "Contatos no seu telefone",
        text: "Os contatos de confiança ficam só no seu dispositivo, nunca no servidor.",
      },
    ],
  },
  about: {
    eyebrow: "Por trás do Aegis Home",
    title: "Uma ferramenta para a família que cuida à distância",
    p1: "Muitos de nós vivemos longe dos nossos pais ou avós e nem sempre conseguimos verificar a casa deles. Uma avaliação profissional presencial não está ao alcance de todos, e as ferramentas que existem costumam estar em inglês e pensadas para outros países.",
    p2Before: "O Aegis Home nasceu no",
    p2Theme: "com o tema",
    p2After: ": construir para o próprio mundo, no nosso idioma e com a nossa realidade.",
    values: [
      {
        title: "Prevenção, não diagnóstico",
        text: "Apenas riscos do ambiente e ajustes na casa. Nunca conselhos médicos.",
      },
      {
        title: "Para a nossa região",
        text: "Palavras simples, custos e materiais da América Central e da América Latina.",
      },
      {
        title: "Honesto sobre seus limites",
        text: "A IA pode errar; o app diz isso e avisa quando um resultado não é ao vivo.",
      },
    ],
  },
  faq: {
    eyebrow: "Perguntas frequentes",
    title: "O que costumam nos perguntar",
    items: [
      { q: "Quanto custa?", a: "Nada. É grátis e não precisa criar uma conta." },
      {
        q: "Vocês guardam minhas fotos?",
        a: "Não. Elas são analisadas e descartadas. Só é guardada a lista de riscos de cada cômodo, que é apagada em 30 dias ou quando você decidir.",
      },
      {
        q: "Substitui um profissional ou um médico?",
        a: "Não. O Aegis Home aponta riscos do ambiente para ajudar você a começar. Não dá conselhos médicos nem detecta quedas, e não substitui a visita de um profissional.",
      },
      {
        q: "E se a IA errar?",
        a: "Pode acontecer: às vezes ela não vê um risco ou marca algo que não é. Use o plano como guia e confie no seu critério. Se o serviço de IA não estiver disponível, o app mostra um aviso visível.",
      },
      {
        q: "Em que idioma chegam os resultados?",
        a: "Os resultados chegam no idioma escolhido no app. Se o serviço de IA não estiver disponível e for mostrado um resultado salvo em outro idioma, o app avisa.",
      },
      {
        q: "Quem pode ver o plano?",
        a: "Apenas quem tiver o link da avaliação. Compartilhe somente com pessoas de confiança.",
      },
      {
        q: "O botão de contato liga para a emergência?",
        a: "Não. Ele abre a ligação, o WhatsApp ou o SMS para os contatos que você adicionar. Em uma emergência, ligue para o número de emergência local (911 na América Central, 192 no Brasil).",
      },
    ],
  },
  finalCta: {
    titleA: "Comece por",
    titleB: "um único cômodo",
    text: "O banheiro costuma ser o lugar mais importante. Uma foto basta para ter seu primeiro plano.",
    cta: "Analisar meu primeiro cômodo",
  },
  footer: {
    disclaimer:
      "O Aegis Home aponta riscos do ambiente com inteligência artificial e pode errar. Não dá conselhos médicos, não detecta quedas e não é um serviço de emergência. Os custos são aproximados.",
    identityTitle: "Identidade e propósito",
    identityText:
      "Prevenção de quedas em casa para famílias da América Central e da América Latina: de uma foto a um plano claro.",
    navTitle: "Navegação rápida",
    home: "Início",
    startEvaluation: "Começar uma avaliação",
    privacyTitle: "Privacidade e segurança",
    privacyItems: [
      "As fotos são analisadas e não são guardadas.",
      "Sem contas nem dados pessoais.",
      "Cada avaliação é apagada em 30 dias.",
      "Contatos guardados só no seu dispositivo.",
    ],
    techTitle: "Tecnologias e créditos",
    techAi: "IA da Meta: Muse Spark 1.3 e SAM 3.1",
    techStack: "React, Tailwind CSS, Node.js, Express e PostgreSQL",
    hackathon: "Criado para o Meta Global AI Developer Hackathon 2026",
    github: "Código aberto no GitHub",
    emergency: "Em uma emergência, ligue para o número de emergência local.",
  },
  nav: {
    aria: "Seções da avaliação",
    tabs: { plan: "Plano", analizar: "Analisar", espacios: "Cômodos", ajustes: "Ajustes" },
    pending: "pendentes",
  },
  household: {
    confirmDelete: "Apagar esta avaliação e todos os seus dados? Esta ação não pode ser desfeita.",
    expired: "Este link não é mais válido ou a avaliação expirou.",
    goHome: "Ir para o início",
    loading: "Carregando a avaliação…",
    analyzeCta: "Analisar um cômodo",
  },
  plan: {
    title: "Plano de ação",
    empty: "Ainda não há riscos no plano. Analise a foto de um cômodo da casa para começar.",
    emptyShort: "Ainda não há riscos no plano. Envie a foto de um cômodo da casa para começar.",
    progress: (resolved: number, total: number) => `${resolved} de ${total} riscos resolvidos`,
    progressAria: "Progresso do plano",
    pendingCost: "Custo pendente aprox.:",
    todo: "A fazer, em ordem de prioridade",
    done: "Já resolvidos",
    fixed: "Já resolvi",
    undo: "Desfazer",
    seePhoto: "Ver na foto",
    filterAria: "Ver por cômodo",
    filterAll: "Todos",
    roomClear: "Não há nada pendente neste cômodo.",
    fixedDone: "✓ Muito bem! Marcado como resolvido.",
    fixedAnnounce: (label: string, remaining: number) =>
      remaining === 0
        ? `${label}: resolvido. Plano completo!`
        : `${label}: resolvido. Faltam ${remaining}.`,
    undoAnnounce: (label: string) => `${label} volta para a lista de pendentes.`,
    allDone:
      "Plano completo! A casa está mais segura. Você pode analisar outro cômodo quando quiser.",
  },
  analyze: {
    title: "Analisar um cômodo",
    subtitle: "Uma foto por cômodo. Ao terminar, você verá os riscos destacados.",
    roomQuestion: "Que cômodo é?",
    photoLabel: "Foto do cômodo",
    photoHint: "Tire a foto em pé, mostrando o piso e os lugares por onde se anda.",
    submit: "Analisar foto",
    takePhoto: "Tirar foto",
    choosePhoto: "Escolher foto",
    noFile: "Nenhuma foto escolhida",
    analyzing: "Analisando…",
    roomPlaceholder: "Escolha o cômodo",
    roomRequired: "Escolha qual é o cômodo para continuar.",
    photoRequired: "Tire ou escolha uma foto para continuar.",
    changePhoto: "Trocar foto",
    chosenAlt: "Foto escolhida",
  },
  roomsView: {
    languageNames: { es: "espanhol", pt: "português", en: "inglês" } as Record<string, string>,
    otherLanguage: (language: string) =>
      `Este resultado está em ${language}: foi analisado ou salvo nesse idioma.`,
    title: "Cômodos analisados",
    subtitle: "Toque em um número na foto ou em um risco da lista para destacá-lo.",
    empty: "Você ainda não analisou nenhum cômodo.",
    back: "Todos os cômodos",
    notFound: "Não encontramos este cômodo",
    notFoundHint: "Ele pode ter sido apagado.",
    photoAlt: (room: string) => `Foto de ${room.toLowerCase()}`,
    noPhoto:
      "Por privacidade, a foto não foi guardada. Escolha a mesma foto para ver as marcações de novo: ela não é enviada nem analisada outra vez.",
    restorePhoto: "Escolher a mesma foto",
    noHazards:
      "Não vimos riscos nesta foto. Isso não garante que não existam: se estava escura ou distante, tente com mais luz ou de outro ângulo.",
    summaryTitle: (room: string, n: number) =>
      n === 1
        ? `${room}: encontramos 1 coisa para melhorar`
        : `${room}: encontramos ${n} coisas para melhorar`,
    summaryHigh: (n: number) =>
      n === 1
        ? "Comece pela marcada como «Resolver primeiro»."
        : `Comece pelas ${n} marcadas como «Resolver primeiro».`,
    summaryCost: (value: string) => `Custo aproximado dos ajustes: ${value}.`,
    summaryResolved: "Tudo neste cômodo já está resolvido.",
    seePlan: "Ver meu plano",
    analyzeAnother: "Analisar outro cômodo",
    whatToDo: "O que fazer:",
    resolved: "Resolvido",
    riskAria: (n: number, label: string) => `Risco ${n}: ${label}`,
  },
  settings: {
    title: "Ajustes",
    contactsTitle: "Contatos de confiança",
    contactsBefore: "Use o botão vermelho",
    contactsButton: "Contatar um familiar",
    contactsAfter:
      "para adicionar até 3 contatos e ligar ou escrever para eles. Eles ficam só neste dispositivo.",
    privacyTitle: "Privacidade",
    privacyPhotos: "As fotos são analisadas e não são guardadas; só a lista de riscos é guardada.",
    availableBefore: "Esta avaliação ficará disponível até",
    availableAfter: ". Depois, ela é apagada automaticamente.",
    languageTitle: "Idioma",
    languageText: "Escolha o idioma do app. Ele fica salvo neste dispositivo.",
    deleteTitle: "Apagar dados",
    deleteText:
      "Apaga a avaliação, seus cômodos e riscos. O link compartilhado deixará de funcionar.",
    deleting: "Apagando…",
    delete: "Apagar esta avaliação e seus dados",
  },
  contact: {
    button: "Contatar um familiar",
    title: "Contatar um familiar",
    disclaimer:
      "Este botão abre seu telefone para ligar ou escrever para seus contatos. Não é um serviço de emergência e não avisa ninguém sozinho. Em uma emergência, ligue para o número de emergência local.",
    includeLocation: "Incluir minha localização na mensagem",
    locating: "Obtendo localização…",
    locationError: "Não foi possível obter a localização. A mensagem será enviada sem ela.",
    call: "Ligar",
    whatsapp: "WhatsApp",
    sms: "SMS",
    remove: "Remover",
    removed: (name: string) => `Contato removido: ${name}.`,
    undo: "Desfazer",
    removeAria: (name: string) => `Remover ${name}`,
    actionAria: (action: string, name: string) => `${action}: ${name}`,
    addFirst: "Adicione um contato de confiança",
    addAnother: "Adicionar outro contato",
    storedLocally: "Os contatos ficam guardados só neste telefone ou computador.",
    name: "Nome",
    phone: "Telefone com código do país",
    save: "Salvar contato",
    nameError: "Escreva um nome (máximo de 40 letras).",
    phoneError: "Escreva o número com código do país, por exemplo +55 11 90000 0000.",
    max: "Você pode guardar até 3 contatos.",
    help: "Olá, preciso que você entre em contato comigo, por favor.",
    myLocation: "Minha localização:",
  },
};
