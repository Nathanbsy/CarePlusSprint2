const storageKey = "careplus-sprint2-state";

const defaultState = {
  user: { name: "Seu nome", points: 860, streak: 4 },
  appointments: [
    {
      id: 1,
      specialty: "Cardiologia",
      doctor: "Dra. Marina Costa",
      clinic: "Care Plus Itaim Bibi",
      date: "2026-05-19",
      time: "09:30",
      status: "confirmada",
      risk: "medium",
      reason: "Chuva prevista e horario de pico na regiao.",
    },
    {
      id: 2,
      specialty: "Odontologia",
      doctor: "Dr. Pedro Lima",
      clinic: "Care Plus Vila Olimpia",
      date: "2026-05-24",
      time: "14:00",
      status: "pendente",
      risk: "high",
      reason: "Consulta sem confirmacao e distancia acima da media.",
    },
    {
      id: 3,
      specialty: "Check-up",
      doctor: "Equipe Preventiva",
      clinic: "Teleconsulta Care Plus",
      date: "2026-05-29",
      time: "08:00",
      status: "confirmada",
      risk: "low",
      reason: "Atendimento remoto e lembrete ja ativado.",
    },
  ],
  rewards: [
    { id: 1, title: "Cafe saudavel parceiro", cost: 220, redeemed: false },
    { id: 2, title: "Prioridade no reagendamento", cost: 450, redeemed: false },
    { id: 3, title: "Voucher bem-estar", cost: 700, redeemed: false },
  ],
};

function getState() {
  const saved = localStorage.getItem(storageKey);
  return saved ? JSON.parse(saved) : structuredClone(defaultState);
}

function saveState(state) {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function formatDate(dateString) {
  return new Date(`${dateString}T12:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

function riskInfo(risk) {
  const map = {
    low: ["Baixo", "risk-low"],
    medium: ["Medio", "risk-medium"],
    high: ["Alto", "risk-high"],
  };
  return map[risk] || map.low;
}

function showToast(message) {
  const area = document.querySelector("#toastArea");
  if (!area) return;

  const toast = document.createElement("div");
  toast.className = "toast align-items-center text-bg-primary border-0";
  toast.setAttribute("role", "status");
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Fechar"></button>
    </div>
  `;
  area.appendChild(toast);
  const instance = new bootstrap.Toast(toast, { delay: 2600 });
  instance.show();
  toast.addEventListener("hidden.bs.toast", () => toast.remove());
}

function syncUser() {
  const state = getState();
  document.querySelectorAll("[data-user-name]").forEach((item) => {
    item.textContent = state.user.name;
  });
  document.querySelectorAll("[data-user-points]").forEach((item) => {
    item.textContent = state.user.points;
  });
}

function initLogin() {
  const form = document.querySelector("#loginForm");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const state = getState();
    const name = document.querySelector("#name").value.trim() || "Paciente";
    state.user.name = name.split(" ")[0];
    saveState(state);
    window.location.href = "dashboard.html";
  });
}

function initDashboard() {
  const metrics = document.querySelector("#dashboardMetrics");
  const alerts = document.querySelector("#riskAlerts");
  if (!metrics || !alerts) return;

  const state = getState();
  const confirmed = state.appointments.filter((item) => item.status === "confirmada").length;
  const highRisk = state.appointments.filter((item) => item.risk === "high").length;
  const pending = state.appointments.filter((item) => item.status === "pendente").length;

  metrics.innerHTML = `
    <div class="col-md-4"><div class="soft-card metric-card p-4"><p class="small-label mb-2">Comparecimento</p><div class="metric-value">92%</div><p class="text-secondary mb-0">Meta mensal em alta</p></div></div>
    <div class="col-md-4"><div class="soft-card metric-card p-4"><p class="small-label mb-2">Consultas confirmadas</p><div class="metric-value">${confirmed}</div><p class="text-secondary mb-0">${pending} aguardando acao</p></div></div>
    <div class="col-md-4"><div class="soft-card metric-card p-4"><p class="small-label mb-2">Risco de no-show</p><div class="metric-value">${highRisk}</div><p class="text-secondary mb-0">acao preventiva recomendada</p></div></div>
  `;

  alerts.innerHTML = state.appointments
    .map((item) => {
      const [label, className] = riskInfo(item.risk);
      return `
        <div class="soft-card p-3 mb-3">
          <div class="d-flex flex-wrap justify-content-between gap-2">
            <div>
              <h3 class="h6 mb-1">${item.specialty}</h3>
              <p class="mb-1 text-secondary">${formatDate(item.date)} as ${item.time} - ${item.clinic}</p>
              <p class="mb-0">${item.reason}</p>
            </div>
            <span class="badge-soft ${className} align-self-start">Risco ${label}</span>
          </div>
        </div>
      `;
    })
    .join("");
}

function appointmentCard(item) {
  const [label, className] = riskInfo(item.risk);
  const statusClass = item.status === "cancelada" ? "text-danger" : item.status === "confirmada" ? "text-success" : "text-warning";
  return `
    <article class="soft-card appointment-row p-4 mb-3" data-status="${item.status}">
      <div class="row g-3 align-items-center">
        <div class="col-lg-7">
          <span class="small-label">${formatDate(item.date)} - ${item.time}</span>
          <h2 class="h5 mt-1 mb-1">${item.specialty}</h2>
          <p class="mb-1">${item.doctor}</p>
          <p class="text-secondary mb-0">${item.clinic}</p>
        </div>
        <div class="col-lg-2">
          <span class="badge-soft ${className}">Risco ${label}</span>
          <p class="${statusClass} fw-bold mb-0 mt-2 text-capitalize">${item.status}</p>
        </div>
        <div class="col-lg-3 d-flex flex-wrap gap-2 justify-content-lg-end">
          <button class="btn btn-sm btn-primary" data-confirm="${item.id}">Confirmar</button>
          <button class="btn btn-sm btn-outline-primary" data-reschedule="${item.id}" data-bs-toggle="modal" data-bs-target="#rescheduleModal">Reagendar</button>
          <button class="btn btn-sm btn-outline-danger" data-cancel="${item.id}">Cancelar</button>
        </div>
      </div>
    </article>
  `;
}

function renderAppointments() {
  const list = document.querySelector("#appointmentsList");
  if (!list) return;

  const state = getState();
  const filter = document.querySelector("#appointmentFilter")?.value || "todas";
  const items = state.appointments.filter((item) => filter === "todas" || item.status === filter);

  list.innerHTML = items.length ? items.map(appointmentCard).join("") : `<div class="soft-card p-4 text-center text-secondary">Nenhuma consulta neste filtro.</div>`;
}

function initAppointments() {
  const list = document.querySelector("#appointmentsList");
  if (!list) return;

  renderAppointments();
  document.querySelector("#appointmentFilter").addEventListener("change", renderAppointments);

  let activeId = null;
  list.addEventListener("click", (event) => {
    const state = getState();
    const confirmId = event.target.dataset.confirm;
    const cancelId = event.target.dataset.cancel;
    const rescheduleId = event.target.dataset.reschedule;

    if (confirmId) {
      const item = state.appointments.find((appointment) => appointment.id === Number(confirmId));
      item.status = "confirmada";
      item.risk = "low";
      state.user.points += 80;
      saveState(state);
      renderAppointments();
      syncUser();
      showToast("Consulta confirmada. Voce ganhou 80 pontos de responsabilidade.");
    }

    if (cancelId) {
      const item = state.appointments.find((appointment) => appointment.id === Number(cancelId));
      item.status = "cancelada";
      item.risk = "low";
      state.user.points += 40;
      saveState(state);
      renderAppointments();
      syncUser();
      showToast("Cancelamento antecipado registrado. Voce ganhou 40 pontos.");
    }

    if (rescheduleId) {
      activeId = Number(rescheduleId);
      const item = state.appointments.find((appointment) => appointment.id === activeId);
      document.querySelector("#newDate").value = item.date;
      document.querySelector("#newTime").value = item.time;
    }
  });

  document.querySelector("#rescheduleForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const state = getState();
    const item = state.appointments.find((appointment) => appointment.id === activeId);
    item.date = document.querySelector("#newDate").value;
    item.time = document.querySelector("#newTime").value;
    item.status = "confirmada";
    item.risk = "low";
    state.user.points += 60;
    saveState(state);
    bootstrap.Modal.getInstance(document.querySelector("#rescheduleModal")).hide();
    renderAppointments();
    syncUser();
    showToast("Consulta reagendada com sucesso. Voce ganhou 60 pontos.");
  });
}

function initRewards() {
  const rewardList = document.querySelector("#rewardList");
  if (!rewardList) return;

  const render = () => {
    const state = getState();
    document.querySelector("#rewardPoints").textContent = state.user.points;
    document.querySelector("#streakDays").textContent = state.user.streak;
    document.querySelector("#levelProgress").style.width = `${Math.min(100, (state.user.points / 1000) * 100)}%`;
    rewardList.innerHTML = state.rewards
      .map((reward) => `
        <div class="col-md-4">
          <div class="soft-card h-100 p-4">
            <p class="small-label mb-2">${reward.cost} pontos</p>
            <h2 class="h5">${reward.title}</h2>
            <p class="text-secondary">Beneficio para pacientes que cuidam da agenda com antecedencia.</p>
            <button class="btn ${reward.redeemed ? "btn-success" : "btn-outline-primary"} w-100" data-redeem="${reward.id}" ${reward.redeemed ? "disabled" : ""}>
              ${reward.redeemed ? "Resgatado" : "Resgatar"}
            </button>
          </div>
        </div>
      `)
      .join("");
  };

  rewardList.addEventListener("click", (event) => {
    const id = event.target.dataset.redeem;
    if (!id) return;

    const state = getState();
    const reward = state.rewards.find((item) => item.id === Number(id));
    if (state.user.points < reward.cost) {
      showToast("Pontos insuficientes para este resgate.");
      return;
    }

    state.user.points -= reward.cost;
    reward.redeemed = true;
    saveState(state);
    syncUser();
    render();
    showToast("Recompensa resgatada com sucesso.");
  });

  render();
}

document.addEventListener("DOMContentLoaded", () => {
  syncUser();
  initLogin();
  initDashboard();
  initAppointments();
  initRewards();
});
