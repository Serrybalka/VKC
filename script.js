const views = document.querySelectorAll(".view");
const nav = document.querySelectorAll("[data-view]");
const drawer = document.getElementById("drawer");
const drawerTitle = document.getElementById("drawerTitle");
const drawerBody = document.getElementById("drawerBody");
const toast = document.getElementById("toast");
const stage = document.getElementById("stage");
const criticalCount = document.getElementById("criticalCount");
const criticalBar = document.getElementById("criticalBar");
const nextTitle = document.getElementById("nextTitle");
const nextText = document.getElementById("nextText");
const docState = document.getElementById("docState");
const videoPanel = document.getElementById("videoPanel");
let critical = 3;

function normalizeStaticTables() {
  document.querySelectorAll(".radio").forEach((item) => item.remove());
  document.querySelectorAll("tr.selected").forEach((row) => row.classList.remove("selected"));
  document.querySelectorAll("th").forEach((head) => {
    if (!head.textContent.trim()) head.remove();
  });
  document.querySelectorAll("tr").forEach((row) => {
    const first = row.firstElementChild;
    if (first && !first.textContent.trim() && first.children.length === 0) first.remove();
  });
}

const templates = {
  termination: {
    title: "Ходатайство о прекращении дела",
    body: `<div class="drawer-panel blue"><p class="label">Причина P1</p><h3>Блокирует завершение заседания</h3><p>Судья должен принять процессуальное решение до перехода к завершению. Это снижает риск пропустить событие, влияющее на ход дела.</p></div><div class="form-grid"><label class="field"><span>Инициатор</span><input value="Ответчик ООО «Вектор»"></label><label class="field"><span>Действие</span><select><option>Взять к рассмотрению</option><option>Удовлетворить</option><option>Отказать</option></select></label><label class="field"><span>Срочность</span><select><option>P1 - критично</option></select></label><label class="field"><span>В протокол</span><input value="Да, обязательно"></label></div><textarea>Заслушать мнения участников и вынести мотивированное определение.</textarea>`
  },
  recusal: {
    title: "Заявление об отводе судьи",
    body: `<div class="drawer-panel blue"><p class="label">Отдельный тип события</p><h3>Устное обращение не смешивается с документами</h3><p>Карточка ведет судью по шагам: зафиксировать инициатора, заслушать мнения, вынести определение, внести запись в протокол.</p></div><div class="form-grid"><label class="field"><span>Форма</span><input value="Устное обращение"></label><label class="field"><span>Статус</span><select><option>Требует решения</option><option>Решено</option></select></label></div>`
  },
  signature: {
    title: "Подписка переводчика",
    body: `<div class="drawer-panel"><h3>Перед допуском нужна КЭП</h3><p>Если КЭП недоступна, система предлагает резервный протокольный сценарий и помечает риск для судьи.</p></div><div class="form-grid"><label class="field"><span>Роль</span><input value="Переводчик"></label><label class="field"><span>Подпись</span><select><option>Ожидает КЭП</option><option>Подписано КЭП</option><option>Резервная отметка</option></select></label></div>`
  },
  document: {
    title: "Договор поставки.pdf",
    body: `<div class="drawer-panel"><p class="label">Документ</p><h3>На рассмотрении</h3><p>Система показывает, почему документ срочный, кто его подал, кому открыт доступ и какое решение ожидается.</p></div><div class="form-grid"><label class="field"><span>От кого</span><input value="Истец Иванов И. И."></label><label class="field"><span>Решение</span><select><option>Принять судом</option><option>Отклонить с причиной</option><option>Открыть доступ</option></select></label><label class="field"><span>Адресаты</span><select><option>Суд</option><option>Все участники</option><option>Выбранные участники</option></select></label><label class="field"><span>Статус</span><input value="На рассмотрении"></label></div><textarea>Комментарий к решению</textarea>`
  },
  whyBlocked: {
    title: "Почему нельзя завершить",
    body: `<div class="drawer-panel blue"><h3>Условия завершения</h3><p>Завершение доступно, когда нет P1-событий, закрыты обязательные подписки, технические сбои с влиянием на явку внесены в журнал, а протокол содержит ключевые решения.</p></div><ul class="findings"><li>Ходатайство о прекращении дела - не решено.</li><li>Отвод судьи - не вынесено определение.</li><li>Подписка переводчика - нет КЭП или резервной отметки.</li></ul>`
  },
  visitor: {
    title: "Сверка личности",
    body: `<div class="drawer-panel"><h3>Карточка посетителя</h3><p>ФИО, паспорт, фото и идентификатор видны в одном окне. Для гостя без связи с делом кнопка допуска заблокирована.</p></div><div class="form-grid"><label class="field"><span>Документ</span><input value="Паспорт"></label><label class="field"><span>Результат</span><select><option>Личность подтверждена</option><option>Нужна ручная проверка</option></select></label></div>`
  },
  upload: {
    title: "Передача файла",
    body: `<div class="drawer-panel blue"><h3>Резервный файлообмен</h3><p>Файл можно подать даже при отказе встроенного файлообмена ВКС. Пользователь видит статус: загружается, подан, на рассмотрении, принят или отклонен.</p></div><div class="form-grid"><label class="field"><span>Файл</span><input value="new-evidence.pdf"></label><label class="field"><span>Проверка</span><input value="Формат и размер допустимы"></label></div>`
  },
  request: {
    title: "Заявка суду",
    body: `<div class="drawer-panel"><h3>Управляемый канал вместо чата</h3><p>Участник выбирает тип обращения: просьба о слове, ходатайство, вопрос по документу или техническая проблема.</p></div><div class="form-grid"><label class="field"><span>Тип</span><select><option>Просьба о слове</option><option>Ходатайство</option><option>Техническая проблема</option></select></label><label class="field"><span>Срочность</span><select><option>Обычная</option><option>Срочная</option></select></label></div><textarea>Текст заявки</textarea>`
  }
};

function switchView(id) {
  views.forEach((view) => view.classList.toggle("active", view.id === id));
  nav.forEach((item) => {
    if (item.dataset.view) item.classList.toggle("active", item.dataset.view === id);
  });
}

function notify(text) {
  toast.textContent = text;
  toast.classList.add("show");
  clearTimeout(notify.timer);
  notify.timer = setTimeout(() => toast.classList.remove("show"), 3200);
}

function openDrawer(type) {
  const t = templates[type] || templates.document;
  drawerTitle.textContent = t.title;
  drawerBody.innerHTML = t.body;
  drawer.classList.add("open");
  drawer.setAttribute("aria-hidden", "false");
}

nav.forEach((item) => item.addEventListener("click", () => switchView(item.dataset.view)));

document.body.addEventListener("click", (e) => {
  const target = e.target;
  if (!(target instanceof HTMLElement)) return;
  if (target.dataset.open) openDrawer(target.dataset.open);
  if (target.dataset.viewJump) switchView(target.dataset.viewJump);
  if (target.dataset.action === "reserve") notify("Запущен резервный ВКС: участник получает инструкцию и код подключения.");
  if (target.dataset.action === "reserveFile") notify("Включен защищенный резервный файлообмен вне ВКС.");
  if (target.dataset.action === "acceptDoc") { docState.textContent = "Принято судом"; notify("Документ принят судом, решение внесено в протокол."); }
  if (target.dataset.action === "share") notify("Открыт выбор адресатов: всем или отдельным участникам.");
  if (target.dataset.action === "admit") notify("Эксперт допущен в зал после проверки статусов.");
  if (target.dataset.action === "showAll") notify("Выбранный участник показан всем. Суд может вернуть автоматический вид.");
  if (target.dataset.action === "judgeRoom" || target.dataset.action === "jury") notify("Открыта защищенная совещательная комната.");
  if (target.dataset.action === "hand") notify("Сигнал поднятой руки отправлен, место в очереди видно участнику.");
  if (target.dataset.action === "tech") notify("Техническая проблема отправлена отдельно от процессуальных заявлений.");
  if (target.dataset.action === "callWitness") notify("Свидетель вызван из изолированного лобби.");
});

document.getElementById("closeDrawer").addEventListener("click", () => drawer.classList.remove("open", "expanded"));
document.getElementById("cancelDrawer").addEventListener("click", () => { drawer.classList.remove("open", "expanded"); notify("Действие отменено, состояние не потеряно."); });
document.getElementById("expandDrawer").addEventListener("click", () => drawer.classList.toggle("expanded"));
document.getElementById("confirmDrawer").addEventListener("click", () => {
  drawer.classList.remove("open", "expanded");
  critical = Math.max(0, critical - 1);
  criticalCount.textContent = critical === 0 ? "нет" : `${critical} решения`;
  notify("Решение сохранено, участники уведомлены, запись добавлена в протокол.");
  if (critical === 0) {
    criticalBar.classList.add("resolved");
    criticalBar.innerHTML = "<strong>Блокеров нет</strong><span>Можно завершить заседание и подписать протокол после проверки печатной формы.</span><button data-view-jump=\"command\">К пульту</button>";
    nextTitle.textContent = "Можно завершить заседание";
    nextText.textContent = "Критичные события закрыты. Следующий шаг - завершить заседание и подписать протокол КЭП.";
  }
});

document.getElementById("startSession").addEventListener("click", () => {
  stage.textContent = "Идет заседание";
  notify("Заседание открыто, участники уведомлены, управление активно.");
});

document.getElementById("finishSession").addEventListener("click", () => {
  if (critical > 0) {
    notify(`Завершение заблокировано: осталось P1-событий - ${critical}.`);
    openDrawer("whyBlocked");
    return;
  }
  stage.textContent = "Завершено";
  notify("Заседание завершено. Протокол доступен для подписания КЭП.");
});

document.getElementById("toggleOnlyCritical").addEventListener("click", () => {
  const active = document.body.classList.toggle("only-critical");
  document.querySelectorAll(".queue-item").forEach((item) => {
    item.style.display = active && item.dataset.priority !== "p1" ? "none" : "grid";
  });
  notify(active ? "Показаны только P1-события." : "Показана вся очередь.");
});

document.getElementById("full").addEventListener("click", () => { videoPanel.className = "video-panel full"; notify("Включен полноэкранный режим видеозала."); });
document.getElementById("compact").addEventListener("click", () => { videoPanel.className = "video-panel compact"; notify("Включен режим «видео + документ»."); });
document.getElementById("focus").addEventListener("click", () => { videoPanel.className = "video-panel focus"; notify("Выбран фокус на участнике."); });
document.getElementById("normal").addEventListener("click", () => { videoPanel.className = "video-panel"; notify("Восстановлен обычный вид."); });

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") drawer.classList.remove("open", "expanded");
});

normalizeStaticTables();
