document.addEventListener("DOMContentLoaded", function () {
  // Adicionar formas decorativas ao body
  addDecorativeShapes();

  // Configurar elementos animados
  setupAnimatedElements();

  // Inicializar a hero section
  initHeroSection();

  // Inicializar o formulário de agendamento
  initAgendamentoForm();

  // Adicionar evento de rolagem para animar elementos
  window.addEventListener("scroll", animateOnScroll);
  // Disparar uma vez para animar elementos visíveis no carregamento
  animateOnScroll();

  // Inicializar header sticky
  initStickyHeader();

  // Inicializar menu mobile
  initMobileMenu();

  // Inicializar contador para o aniversário
  initCountdown();

  // Inicializar tracking de cliques
  initClickTracking();

  // Inicializar modal de analytics
  initAnalyticsModal();
});

// Adiciona formas decorativas para o fundo
function addDecorativeShapes() {
  const body = document.body;

  const shape1 = document.createElement("div");
  shape1.classList.add("bg-shape", "shape-1");

  const shape2 = document.createElement("div");
  shape2.classList.add("bg-shape", "shape-2");

  body.appendChild(shape1);
  body.appendChild(shape2);
}

// Inicializa o formulário de agendamento em etapas
function initAgendamentoForm() {
  const form = document.getElementById("agendamento-form");
  if (!form) return;

  const steps = form.querySelectorAll(".step");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  const progressSteps = document.querySelectorAll(".progress-step");
  const progressConnectors = document.querySelectorAll(".progress-connector");

  let currentStep = 1;
  let formData = {
    service: "",
    size: "",
    name: "",
    breed: "",
    date: "",
    time: "",
    notes: "",
  };

  // Verificar se um serviço foi selecionado via link
  const checkPreselectedService = () => {
    // Buscar links com data-service que apontam para #agendamento
    const serviceLinks = document.querySelectorAll(
      'a[href="#agendamento"][data-service]'
    );

    serviceLinks.forEach((link) => {
      link.addEventListener("click", function (e) {
        const selectedService = this.getAttribute("data-service");
        if (selectedService) {
          // Encontrar o botão de serviço correspondente no formulário
          const serviceButtons = form.querySelectorAll(".service-btn");
          let foundButton = null;

          serviceButtons.forEach((btn) => {
            if (btn.getAttribute("data-service") === selectedService) {
              foundButton = btn;
            }
          });

          // Se encontrou o botão, simular clique
          if (foundButton) {
            // Remover seleção atual
            serviceButtons.forEach((btn) => btn.classList.remove("selected"));
            // Adicionar seleção ao botão do serviço
            foundButton.classList.add("selected");
            // Armazenar dados
            formData.service = selectedService;
            // Analytics
            logFormEvent("service_selected", selectedService);

            // Avançar automaticamente para o próximo passo
            setTimeout(() => {
              nextBtn.click();
            }, 500);
          }
        }
      });
    });
  };

  // Chamar a verificação de serviço pré-selecionado
  checkPreselectedService();

  // Atualizar a UI para mostrar a etapa atual
  const updateUI = () => {
    // Esconder todas as etapas
    steps.forEach((step) => step.classList.add("hidden"));

    // Mostrar a etapa atual
    steps[currentStep - 1].classList.remove("hidden");

    // Atualizar botão voltar
    if (currentStep === 1) {
      prevBtn.classList.add("hidden");
    } else {
      prevBtn.classList.remove("hidden");
    }

    // Atualizar texto do botão avançar
    if (currentStep === 3) {
      nextBtn.textContent = "Finalizar Agendamento";
    } else {
      nextBtn.textContent = "Continuar →";
    }

    // Atualizar indicadores de progresso
    progressSteps.forEach((step, index) => {
      step.classList.remove("active", "completed");
      if (index + 1 < currentStep) {
        step.classList.add("completed");
      } else if (index + 1 === currentStep) {
        step.classList.add("active");
      }
    });

    // Atualizar conectores de progresso
    progressConnectors.forEach((connector, index) => {
      connector.classList.remove("active");
      if (index + 1 < currentStep) {
        connector.classList.add("active");
      }
    });

    // Efeito de entrada para a etapa atual
    const currentStepEl = steps[currentStep - 1];
    currentStepEl.style.opacity = "0";
    currentStepEl.style.transform = "translateY(20px)";

    setTimeout(() => {
      currentStepEl.style.transition = "opacity 0.5s ease, transform 0.5s ease";
      currentStepEl.style.opacity = "1";
      currentStepEl.style.transform = "translateY(0)";
    }, 50);
  };

  // Selecionar um serviço
  const serviceButtons = form.querySelectorAll(".service-btn");
  serviceButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Remover seleção atual
      serviceButtons.forEach((btn) => btn.classList.remove("selected"));

      // Aplicar seleção
      this.classList.add("selected");

      // Armazenar dados
      formData.service = this.getAttribute("data-service");

      // Trigger de analytics
      logFormEvent("service_selected", formData.service);
    });
  });

  // Selecionar um tamanho
  const sizeButtons = form.querySelectorAll(".size-btn");
  sizeButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Remover seleção atual
      sizeButtons.forEach((btn) => btn.classList.remove("selected"));

      // Aplicar seleção
      this.classList.add("selected");

      // Armazenar dados
      formData.size = this.getAttribute("data-size");

      // Trigger de analytics
      logFormEvent("size_selected", formData.size);
    });
  });

  // Eventos dos botões de navegação
  prevBtn.addEventListener("click", () => {
    if (currentStep > 1) {
      currentStep--;
      updateUI();

      // Trigger de analytics
      logFormEvent("step_back", `step_${currentStep}`);
    }
  });

  // Checkbox para usar o próximo horário disponível
  const useNextTimeCheckbox = document.getElementById("use-next-time");
  const petDateInput = document.getElementById("pet-date");
  const petTimeInput = document.getElementById("pet-time");

  if (useNextTimeCheckbox && petDateInput && petTimeInput) {
    useNextTimeCheckbox.addEventListener("change", function () {
      // Desabilitar/habilitar campos de data e hora
      petDateInput.disabled = this.checked;
      petTimeInput.disabled = this.checked;

      // Trigger de analytics
      logFormEvent(
        "next_time_" + (this.checked ? "selected" : "unselected"),
        "form_option"
      );
    });
  }

  nextBtn.addEventListener("click", () => {
    let canProceed = true;

    // Validação por etapa
    if (currentStep === 1) {
      if (!formData.service) {
        canProceed = false;
        showToast("Por favor, selecione um serviço para continuar");
      }
    } else if (currentStep === 2) {
      if (!formData.size) {
        canProceed = false;
        showToast("Por favor, selecione o porte do seu pet");
      }
    } else if (currentStep === 3) {
      // Coletar dados do formulário
      formData.name = document.getElementById("pet-name").value;
      formData.breed = document.getElementById("pet-breed").value;
      formData.date = document.getElementById("pet-date").value;
      formData.time = document.getElementById("pet-time").value;
      formData.notes = document.getElementById("pet-obs").value;

      // Verificar se está usando próximo horário disponível
      const useNextTime =
        document.getElementById("use-next-time")?.checked || false;
      formData.useNextTime = useNextTime;

      if (!formData.name) {
        canProceed = false;
        showToast("Por favor, informe o nome do seu pet");
      } else if (!useNextTime && (!formData.date || !formData.time)) {
        // Só validar data e hora se não estiver usando próximo horário disponível
        canProceed = false;
        showToast("Por favor, selecione uma data e horário");
      }
    }

    if (canProceed) {
      if (currentStep < 4) {
        currentStep++;
        updateUI();

        // Se for a última etapa, mostrar resumo do agendamento
        if (currentStep === 4) {
          showBookingSummary();
        }

        // Trigger de analytics
        logFormEvent("step_forward", `step_${currentStep}`);
      }
    }
  });

  // Exibir resumo do agendamento
  function showBookingSummary() {
    const bookingDetails = document.getElementById("booking-details");
    if (!bookingDetails) return;

    // Verificar se está usando o próximo horário disponível
    const useNextTime =
      document.getElementById("use-next-time")?.checked || false;

    // Formatar data
    const formattedDate = formData.date
      ? new Date(formData.date).toLocaleDateString("pt-BR")
      : "";

    // Montar o HTML do resumo com ou sem informações de data/hora
    let summaryHTML = `
      <p><strong>Serviço:</strong> ${formData.service}</p>
      <p><strong>Porte do Pet:</strong> ${formData.size}</p>
      <p><strong>Nome do Pet:</strong> ${formData.name}</p>
      <p><strong>Raça:</strong> ${formData.breed || "Não informado"}</p>
    `;

    if (useNextTime) {
      summaryHTML += `<p><strong>Horário:</strong> Próximo horário disponível</p>`;
    } else {
      summaryHTML += `
        <p><strong>Data:</strong> ${formattedDate}</p>
        <p><strong>Horário:</strong> ${formData.time}</p>
      `;
    }

    if (formData.notes) {
      summaryHTML += `<p><strong>Observações:</strong> ${formData.notes}</p>`;
    }

    bookingDetails.innerHTML = summaryHTML;

    // Preparar link do WhatsApp
    const sendWhatsappButton = document.getElementById("send-whatsapp");
    if (sendWhatsappButton) {
      // Construir mensagem para WhatsApp
      let message = `Olá! Gostaria de agendar o serviço de *${formData.service}* para meu pet de porte *${formData.size}*.`;
      message += `\n*Nome do pet:* ${formData.name}`;

      if (formData.breed) {
        message += `\n*Raça:* ${formData.breed}`;
      }

      if (useNextTime) {
        message += `\n*Horário:* Gostaria do próximo horário disponível`;
      } else if (formData.date && formData.time) {
        message += `\n*Data desejada:* ${formattedDate}`;
        message += `\n*Horário desejado:* ${formData.time}`;
      }

      if (formData.notes) {
        message += `\n*Observações:* ${formData.notes}`;
      }

      // Adicionar evento de clique no botão
      sendWhatsappButton.addEventListener("click", function (e) {
        e.preventDefault();
        const whatsappURL = `https://wa.me/5511969440495?text=${encodeURIComponent(
          message
        )}`;
        window.open(whatsappURL, "_blank");
        showToast("Abrindo WhatsApp para confirmar seu agendamento!");
        logFormEvent("whatsapp_sent", "message_sent");
      });
    }

    // Trigger de analytics de conversão
    logFormEvent("booking_completed", JSON.stringify(formData));

    // Atualizar funnel de conversão
    if (window.trackingData) {
      window.trackingData.funnelSteps.step4++;
    }
  }

  // Botão para fazer novo agendamento
  const newBookingBtn = document.getElementById("new-booking");
  if (newBookingBtn) {
    newBookingBtn.addEventListener("click", () => {
      // Resetar formulário
      formData = {
        service: "",
        size: "",
        name: "",
        breed: "",
        date: "",
        time: "",
        notes: "",
      };

      // Resetar seleções
      serviceButtons.forEach((btn) => btn.classList.remove("selected"));
      sizeButtons.forEach((btn) => btn.classList.remove("selected"));

      // Limpar campos
      document.getElementById("pet-name").value = "";
      document.getElementById("pet-breed").value = "";
      document.getElementById("pet-date").value = "";
      document.getElementById("pet-time").value = "";
      document.getElementById("pet-obs").value = "";

      // Voltar para primeira etapa
      currentStep = 1;
      updateUI();

      // Trigger de analytics
      logFormEvent("new_booking_started", "form_reset");
    });
  }

  // Iniciar tracking do funil
  function logFormEvent(action, label) {
    if (window.trackingData) {
      // Registar evento
      const eventId = `form_${action}`;
      if (!window.trackingData.clicks[eventId]) {
        window.trackingData.clicks[eventId] = 0;
      }
      window.trackingData.clicks[eventId]++;
      window.trackingData.totalClicks++;

      // Atualizar etapa do funil
      if (action === "step_forward") {
        const step = parseInt(label.split("_")[1]);
        if (step <= 4) {
          window.trackingData.funnelSteps[`step${step}`]++;
        }
      }
    }
  }

  // Inicializar UI
  updateUI();
}

// Inicializa o menu mobile
function initMobileMenu() {
  const menuButton = document.querySelector(".md\\:hidden");

  if (!menuButton) return;

  const nav = document.querySelector("nav");
  const header = document.querySelector("header");

  menuButton.addEventListener("click", function () {
    if (nav.classList.contains("hidden") || nav.classList.contains("md:flex")) {
      // Adicionando a navegação mobile
      nav.classList.remove("hidden", "md:flex");
      nav.classList.add(
        "flex",
        "flex-col",
        "fixed",
        "top-24", // Aumentado para ficar mais abaixo e não sobrepor conteúdos
        "right-4",
        "glass-container",
        "p-4",
        "space-y-4",
        "z-[9999]" // Z-index extremamente alto para garantir que fique acima de tudo
      );

      // Certifique-se de que o header fique acima de tudo também
      header.classList.add("z-[9999]");

      // Adicionar overlay para evitar cliques em elementos abaixo
      const overlay = document.createElement("div");
      overlay.classList.add("mobile-menu-overlay");
      overlay.style.position = "fixed";
      overlay.style.top = "0";
      overlay.style.left = "0";
      overlay.style.width = "100%";
      overlay.style.height = "100%";
      overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
      overlay.style.zIndex = "999";
      overlay.style.backdropFilter = "blur(3px)";
      document.body.appendChild(overlay);

      // Fechar menu ao clicar no overlay
      overlay.addEventListener("click", closeMenu);
    } else {
      closeMenu();
    }
  });

  // Função para fechar o menu
  function closeMenu() {
    // Removendo a navegação mobile
    nav.classList.add("hidden", "md:flex");
    nav.classList.remove(
      "flex",
      "flex-col",
      "fixed",
      "top-24",
      "right-4",
      "glass-container",
      "p-4",
      "space-y-4",
      "z-[9999]"
    );

    // Remover overlay se existir
    const overlay = document.querySelector(".mobile-menu-overlay");
    if (overlay) {
      overlay.remove();
    }
  }

  // Fechar menu ao clicar em um link
  const navLinks = nav.querySelectorAll("a");
  navLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });
}

// Animação na rolagem da página
function animateOnScroll() {
  const elements = document.querySelectorAll(".animated-entry");

  elements.forEach((element) => {
    const elementTop = element.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;

    if (elementTop < windowHeight * 0.8) {
      element.classList.add("visible");
    }
  });
}

// Função para adicionar classe animated-entry a elementos selecionados
function setupAnimatedElements() {
  // Aplicar apenas a elementos específicos que queremos animar na rolagem
  // Não aplicar a todo o site para evitar que ele "se mexer sozinho"
  const sectionsToAnimate = [
    "#servicos .glass-card",
    "#boutique .product-card",
    "#sobre .glass-container",
    "#aniversario .party-item",
  ];

  sectionsToAnimate.forEach((selector) => {
    document.querySelectorAll(selector).forEach((element, index) => {
      element.classList.add("animated-entry");
      // Adicionar um pequeno atraso baseado no índice para criar efeito cascata
      element.style.transitionDelay = `${index * 0.1}s`;
    });
  });
}

// Função para mostrar toast (mensagem temporária)
function showToast(message) {
  // Verificar se já existe um toast
  const existingToast = document.querySelector(".toast");
  if (existingToast) {
    existingToast.remove();
  }

  // Criar novo toast
  const toast = document.createElement("div");
  toast.classList.add(
    "toast",
    "glass-container",
    "fixed",
    "top-4",
    "left-1/2",
    "transform",
    "-translate-x-1/2",
    "p-3",
    "z-50"
  );
  toast.style.minWidth = "250px";
  toast.style.textAlign = "center";
  toast.innerText = message;

  // Adicionar ao body
  document.body.appendChild(toast);

  // Remover após 3 segundos
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

// Inicializa o contador para aniversário
function initCountdown() {
  const countdownContainer = document.querySelector(".countdown-timer");
  if (!countdownContainer) return;

  const daysElement = document.getElementById("countdown-days");
  const hoursElement = document.getElementById("countdown-hours");
  const minutesElement = document.getElementById("countdown-minutes");
  const secondsElement = document.getElementById("countdown-seconds");

  // Data do aniversário (6 de abril)
  const eventDate = new Date("2025-04-06T14:00:00").getTime();

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = eventDate - now;

    // Cálculos para dias, horas, minutos e segundos
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Atualizar elementos da página
    if (daysElement) daysElement.textContent = String(days).padStart(2, "0");
    if (hoursElement) hoursElement.textContent = String(hours).padStart(2, "0");
    if (minutesElement)
      minutesElement.textContent = String(minutes).padStart(2, "0");
    if (secondsElement)
      secondsElement.textContent = String(seconds).padStart(2, "0");

    // Se o contador chegou a zero
    if (distance < 0) {
      clearInterval(countdownInterval);
      if (daysElement) daysElement.textContent = "00";
      if (hoursElement) hoursElement.textContent = "00";
      if (minutesElement) minutesElement.textContent = "00";
      if (secondsElement) secondsElement.textContent = "00";
    }
  }

  // Atualizar o contador a cada segundo
  updateCountdown();
  const countdownInterval = setInterval(updateCountdown, 1000);
}

// Sistema de tracking de cliques e funil
function initClickTracking() {
  // Objeto para armazenar dados de tracking
  window.trackingData = {
    clicks: {},
    totalClicks: 0,
    funnelSteps: {
      step1: 0, // Escolha do serviço
      step2: 0, // Escolha do porte
      step3: 0, // Preenchimento de dados
      step4: 0, // Conversão final
    },
    sections: {
      banner: 0,
      servicos: 0,
      sobre: 0,
      agendamento: 0,
      boutique: 0,
      aniversario: 0,
      contato: 0,
      footer: 0,
    },
  };

  // Selecionar todos os elementos clicáveis com atributo data-tracking
  const trackableElements = document.querySelectorAll("[data-tracking]");

  // Adicionar listener de cliques
  trackableElements.forEach((element) => {
    element.addEventListener("click", function () {
      const trackingId = this.dataset.tracking;

      // Incrementar contagem para este elemento
      if (!window.trackingData.clicks[trackingId]) {
        window.trackingData.clicks[trackingId] = 0;
      }
      window.trackingData.clicks[trackingId]++;
      window.trackingData.totalClicks++;

      // Classificar clique por seção
      if (trackingId.includes("btn-")) {
        // Verificar qual seção este elemento pertence
        categorizeClickBySection(this);
      }

      // Salvar dados no localStorage
      saveTrackingData();
    });
  });

  // Carregar dados salvos anteriormente
  loadTrackingData();
}

// Classifica o clique por seção
function categorizeClickBySection(element) {
  // Encontrar a seção pai deste elemento
  let currentElement = element;
  while (currentElement && currentElement !== document.body) {
    const sectionId = currentElement.id;
    if (sectionId) {
      if (window.trackingData.sections.hasOwnProperty(sectionId)) {
        window.trackingData.sections[sectionId]++;
        return;
      }
    }

    // Se não encontrou pelo ID, verificar a classe
    if (currentElement.classList.contains("banner")) {
      window.trackingData.sections.banner++;
      return;
    }

    currentElement = currentElement.parentNode;
  }
}

// Salva os dados de tracking no localStorage
function saveTrackingData() {
  localStorage.setItem(
    "shibaPetTrackingData",
    JSON.stringify(window.trackingData)
  );
}

// Carrega os dados de tracking do localStorage
function loadTrackingData() {
  const savedData = localStorage.getItem("shibaPetTrackingData");
  if (savedData) {
    try {
      window.trackingData = JSON.parse(savedData);
    } catch (e) {
      console.error("Erro ao carregar dados de tracking:", e);
    }
  }
}

// Registra uma etapa do funil
function trackFunnelStep(step) {
  if (!window.trackingData) return;

  switch (step) {
    case 1:
      window.trackingData.funnelSteps.step1++;
      break;
    case 2:
      window.trackingData.funnelSteps.step2++;
      break;
    case 3:
      window.trackingData.funnelSteps.step3++;
      break;
    case 4:
      window.trackingData.funnelSteps.step4++;
      break;
  }

  saveTrackingData();
}

// Inicializa o modal de analytics
function initAnalyticsModal() {
  const analyticsButton = document.getElementById("analytics-button");
  const analyticsModal = document.getElementById("analytics-modal");
  const closeButton = document.getElementById("close-analytics");

  if (!analyticsButton || !analyticsModal) return;

  // Botão para abrir modal
  analyticsButton.addEventListener("click", function () {
    // Pedir a senha antes de mostrar o painel
    const password = prompt("Digite a senha para acessar o painel:");

    if (password === "pet1234") {
      analyticsModal.classList.remove("hidden");
      updateAnalyticsDisplay();
    } else if (password !== null) {
      // Se a senha estiver errada e o usuário não cancelou
      showToast("Senha incorreta. Acesso negado.");
    }
  });

  // Botão para fechar modal
  if (closeButton) {
    closeButton.addEventListener("click", function () {
      analyticsModal.classList.add("hidden");
    });
  }

  // Fechar ao clicar fora do conteúdo
  analyticsModal.addEventListener("click", function (e) {
    if (e.target === analyticsModal) {
      analyticsModal.classList.add("hidden");
    }
  });
}

// Atualiza a exibição dos dados no modal de analytics
function updateAnalyticsDisplay() {
  // Verificar se os dados de tracking e elementos HTML existem
  if (!window.trackingData) return;

  // Elementos do modal
  const totalClicksElement = document.getElementById("total-clicks");
  const conversionRateElement = document.getElementById("conversion-rate");
  const topButtonElement = document.getElementById("top-button");
  const sectionClicksTable = document.getElementById("section-clicks");

  // 1. Total de cliques
  if (totalClicksElement) {
    totalClicksElement.textContent = window.trackingData.totalClicks;
  }

  // 2. Taxa de conversão (inicios de funil vs. finalizações)
  if (conversionRateElement && window.trackingData.funnelSteps.step1 > 0) {
    const conversionRate =
      (window.trackingData.funnelSteps.step4 /
        window.trackingData.funnelSteps.step1) *
      100;
    conversionRateElement.textContent = conversionRate.toFixed(1) + "%";
  }

  // 3. Botão mais clicado
  if (topButtonElement && Object.keys(window.trackingData.clicks).length > 0) {
    let topButton = "";
    let topClicks = 0;

    for (const [button, clicks] of Object.entries(window.trackingData.clicks)) {
      if (clicks > topClicks) {
        topClicks = clicks;
        topButton = button;
      }
    }

    topButtonElement.textContent =
      formatTrackingName(topButton) + " (" + topClicks + ")";
  }

  // 4. Tabela de cliques por seção
  if (sectionClicksTable) {
    sectionClicksTable.innerHTML = "";
    let totalSectionClicks = 0;

    // Calcular total para porcentagem
    for (const section in window.trackingData.sections) {
      totalSectionClicks += window.trackingData.sections[section];
    }

    // Criar linhas da tabela
    for (const [section, clicks] of Object.entries(
      window.trackingData.sections
    )) {
      const percentage =
        totalSectionClicks > 0 ? (clicks / totalSectionClicks) * 100 : 0;

      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="py-2">${formatSectionName(section)}</td>
        <td class="text-right py-2">${clicks}</td>
        <td class="text-right py-2">${percentage.toFixed(1)}%</td>
      `;
      sectionClicksTable.appendChild(row);
    }
  }

  // 5. Atualizar visualização do funil
  updateFunnelVisualization();
}

// Formata o nome do tracking para exibição
function formatTrackingName(trackingId) {
  // Remover prefixos comuns
  let name = trackingId
    .replace("btn-", "")
    .replace("form-", "")
    .replace("social-", "")
    .replace("footer-", "");

  // Substituir hífens por espaços e capitalizar
  name = name.replace(/-/g, " ");
  return name.charAt(0).toUpperCase() + name.slice(1);
}

// Formata o nome da seção para exibição
function formatSectionName(section) {
  const sectionNames = {
    banner: "Banner Principal",
    servicos: "Serviços",
    sobre: "Sobre Nós",
    agendamento: "Agendamento",
    boutique: "Boutique",
    aniversario: "Aniversário",
    contato: "Contato",
    footer: "Rodapé",
  };

  return sectionNames[section] || section;
}

// Atualiza a visualização do funil
function updateFunnelVisualization() {
  const { step1, step2, step3, step4 } = window.trackingData.funnelSteps;

  // Elementos do funil
  const step1Element = document.getElementById("funnel-step-1");
  const step2Element = document.getElementById("funnel-step-2");
  const step3Element = document.getElementById("funnel-step-3");
  const step4Element = document.getElementById("funnel-step-4");

  const percent1Element = document.getElementById("funnel-percent-1");
  const percent2Element = document.getElementById("funnel-percent-2");
  const percent3Element = document.getElementById("funnel-percent-3");
  const percent4Element = document.getElementById("funnel-percent-4");

  // Calcular porcentagens (relativas ao passo anterior)
  const percent1 = 100;
  const percent2 = step1 > 0 ? (step2 / step1) * 100 : 0;
  const percent3 = step2 > 0 ? (step3 / step2) * 100 : 0;
  const percent4 = step3 > 0 ? (step4 / step3) * 100 : 0;

  // Atualizar larguras das barras de progresso
  if (step1Element) step1Element.style.width = "100%";
  if (step2Element) step2Element.style.width = Math.max(percent2, 5) + "%";
  if (step3Element) step3Element.style.width = Math.max(percent3, 5) + "%";
  if (step4Element) step4Element.style.width = Math.max(percent4, 5) + "%";

  // Atualizar textos de porcentagem
  if (percent1Element)
    percent1Element.textContent = step1 + " (" + percent1.toFixed(0) + "%)";
  if (percent2Element)
    percent2Element.textContent = step2 + " (" + percent2.toFixed(0) + "%)";
  if (percent3Element)
    percent3Element.textContent = step3 + " (" + percent3.toFixed(0) + "%)";
  if (percent4Element)
    percent4Element.textContent = step4 + " (" + percent4.toFixed(0) + "%)";
}

// Inicializa os efeitos da hero section
function initHeroSection() {
  // Adicionar movimento de mouse parallax
  const heroSection = document.querySelector(".hero-section");
  if (heroSection) {
    // Efeito parallax ao mover o mouse
    heroSection.addEventListener("mousemove", function (e) {
      const shapes = document.querySelectorAll(".hero-shape");
      const glitchText = document.querySelector(".glitch-text");
      const logo = document.querySelector(".hero-logo");

      // Calcular a posição relativa do mouse entre -1 e 1
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;

      // Mover as formas de acordo com o movimento do mouse
      shapes.forEach((shape) => {
        const speed = shape.classList.contains("shape-1")
          ? 15
          : shape.classList.contains("shape-2")
          ? 10
          : 20;
        shape.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
      });

      // Efeito sutil no texto e logo
      if (glitchText) {
        glitchText.style.transform = `translate(${x * -5}px, ${y * -5}px)`;
      }

      if (logo) {
        logo.style.transform = `translateY(${
          -15 * Math.sin(Date.now() * 0.001)
        }px) rotate(${x * 2}deg)`;
      }
    });

    // Iniciar efeito fofo flutuante no lugar da digitação
    initCuteEffect();

    // Inicializar partículas se a biblioteca estiver disponível
    initParticles();
  }
}

// Função para iniciar o efeito fofo
function initCuteEffect() {
  const heroTypingElement = document.querySelector(".hero-typing");
  if (heroTypingElement) {
    // Substituir o elemento de digitação por um efeito mais fofo
    heroTypingElement.classList.remove("hero-typing");
    heroTypingElement.classList.add("cute-animation");

    // Emojis fofos de animais
    const cuteEmojis = ["🐶", "🐱", "🐰", "🦊", "🐼", "🦄", "🐕", "🐾"];

    // Criar texto base
    heroTypingElement.innerHTML = `
      <span class="cute-text">Cuidado Premium para seu Pet</span>
      <div class="floating-emojis"></div>
      <div class="big-pet big-dog">🐕</div>
      <div class="big-pet big-cat">🐈</div>
    `;

    // Adicionar emojis flutuantes
    const floatingEmojis = heroTypingElement.querySelector(".floating-emojis");

    cuteEmojis.forEach((emoji, index) => {
      const emojiElement = document.createElement("span");
      emojiElement.classList.add("floating-emoji");
      emojiElement.textContent = emoji;
      emojiElement.style.animationDelay = `${index * 0.5}s`;
      emojiElement.style.left = `${10 + index * 10}%`;
      floatingEmojis.appendChild(emojiElement);
    });
  }
}

// Função para inicializar partículas
function initParticles() {
  // Verificar se a biblioteca particles.js está disponível
  if (typeof particlesJS === "undefined") {
    // Se não estiver disponível, carregar a biblioteca
    loadParticlesScript();
  } else {
    // Se estiver disponível, inicializar as partículas
    setupParticles();
  }
}

// Função para carregar o script particles.js
function loadParticlesScript() {
  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js";
  script.onload = setupParticles;
  document.head.appendChild(script);
}

// Configurar as partículas
function setupParticles() {
  if (typeof particlesJS !== "undefined") {
    particlesJS("particles-js", {
      particles: {
        number: {
          value: 80,
          density: {
            enable: true,
            value_area: 800,
          },
        },
        color: {
          value: "#ffffff",
        },
        shape: {
          type: "circle",
          stroke: {
            width: 0,
            color: "#000000",
          },
        },
        opacity: {
          value: 0.3,
          random: true,
          anim: {
            enable: true,
            speed: 1,
            opacity_min: 0.1,
            sync: false,
          },
        },
        size: {
          value: 3,
          random: true,
          anim: {
            enable: true,
            speed: 2,
            size_min: 0.1,
            sync: false,
          },
        },
        line_linked: {
          enable: true,
          distance: 150,
          color: "#ffffff",
          opacity: 0.2,
          width: 1,
        },
        move: {
          enable: true,
          speed: 1,
          direction: "none",
          random: true,
          straight: false,
          out_mode: "out",
          bounce: false,
        },
      },
      interactivity: {
        detect_on: "canvas",
        events: {
          onhover: {
            enable: true,
            mode: "grab",
          },
          onclick: {
            enable: true,
            mode: "push",
          },
          resize: true,
        },
        modes: {
          grab: {
            distance: 140,
            line_linked: {
              opacity: 0.5,
            },
          },
          push: {
            particles_nb: 3,
          },
        },
      },
      retina_detect: true,
    });
  }
}

// Função auxiliar para criar o efeito de digitação com atraso
function typeText(element, text, speed) {
  let i = 0;
  element.textContent = "";

  function typing() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(typing, speed);
    }
  }

  typing();
}

// Inicializa o comportamento sticky do header
function initStickyHeader() {
  const header = document.querySelector("header");
  const main = document.querySelector("main");
  const originalHeight = header ? header.offsetHeight : 0;
  let lastScrollTop = 0;

  // Garantir que o conteúdo principal tenha espaço adequado
  if (main && header && originalHeight > 0) {
    // Verificar o padding atual e ajustar se necessário
    const currentPadding = parseInt(
      window.getComputedStyle(main).paddingTop,
      10
    );
    if (currentPadding < originalHeight) {
      main.style.paddingTop = originalHeight + "px";
    }
  }

  // Função para controlar a visibilidade do header durante a rolagem
  function handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Determinar a direção da rolagem (só esconder após rolar certa distância)
    if (scrollTop > lastScrollTop && scrollTop > originalHeight * 2) {
      // Rolando para baixo e além da área inicial
      header.classList.add("header-hidden");
    } else {
      // Rolando para cima ou no topo da página
      header.classList.remove("header-hidden");
    }

    // Aplicar efeito de fundo quando rolar
    if (scrollTop > 50) {
      header.classList.add("header-scrolled");
    } else {
      header.classList.remove("header-scrolled");
    }

    lastScrollTop = scrollTop;
  }

  // Adicionar o evento de scroll
  window.addEventListener("scroll", handleScroll);

  // Verificar a posição atual da rolagem
  handleScroll();

  // Garantir que o menu mobile seja exibido sobre o conteúdo
  const menuMobile = document.querySelector("nav.flex.flex-col");
  if (menuMobile) {
    menuMobile.style.zIndex = "9999";
  }
}
