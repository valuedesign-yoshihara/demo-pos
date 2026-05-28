const menuData = [
  {
    id: "standard",
    label: "通常拝観",
    presets: [
      { label: "大人2", items: { adult: 2 } },
      { label: "家族", items: { adult: 2, child: 2 } },
      { label: "学生10", items: { student: 10 } },
      { label: "大人10", items: { adult: 10 } },
    ],
    tickets: [
      { id: "adult", name: "大人", price: 500, tag: "基本" },
      { id: "child", name: "小人", price: 200, tag: "小学生" },
      { id: "student", name: "学生", price: 300, tag: "中高大" },
      { id: "disabled", name: "障がい者", price: 250, tag: "手帳" },
      { id: "caregiver", name: "介助者", price: 0, tag: "同伴" },
      { id: "infant", name: "幼児", price: 0, tag: "無料" },
    ],
  },
  {
    id: "special",
    label: "特別拝観",
    presets: [
      { label: "特別 大人2", items: { specialAdult: 2 } },
      { label: "宝物館2", items: { treasureSet: 2 } },
      { label: "夜間10", items: { nightAdult: 10 } },
      { label: "体験5", items: { zazen: 5 } },
    ],
    tickets: [
      { id: "specialAdult", name: "特別 大人", price: 1000, tag: "期間" },
      { id: "specialChild", name: "特別 小人", price: 500, tag: "期間" },
      { id: "treasureSet", name: "宝物館セット", price: 1200, tag: "共通" },
      { id: "nightAdult", name: "夜間拝観", price: 900, tag: "夜間" },
      { id: "zazen", name: "坐禅体験", price: 1500, tag: "体験" },
      { id: "garden", name: "庭園特別", price: 700, tag: "庭園" },
    ],
  },
  {
    id: "discount",
    label: "割引・団体",
    presets: [
      { label: "団体 大人10", items: { groupAdult: 10 } },
      { label: "団体 学生10", items: { groupStudent: 10 } },
      { label: "手帳2", items: { disabled: 2 } },
      { label: "招待5", items: { invitation: 5 } },
    ],
    tickets: [
      { id: "groupAdult", name: "団体 大人", price: 450, tag: "20名-" },
      { id: "groupChild", name: "団体 小人", price: 180, tag: "20名-" },
      { id: "groupStudent", name: "団体 学生", price: 270, tag: "20名-" },
      { id: "invitation", name: "招待券", price: 0, tag: "無料" },
      { id: "annualPass", name: "年間パス", price: 0, tag: "提示" },
      { id: "couponAdult", name: "割引 大人", price: 400, tag: "券" },
    ],
  },
];

const ticketsById = new Map(menuData.flatMap((menu) => menu.tickets.map((ticket) => [ticket.id, { ...ticket, menuId: menu.id }])));
const yenFormatter = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0,
});
const REGISTER_NUMBER = "01";
const weatherOptions = ["快晴", "晴れ", "曇り", "小雨", "雨", "豪雨", "台風", "雪", "大雪"];
const staffOptions = ["山田 太郎", "佐藤 花子", "鈴木 一郎", "田中 美咲", "高橋 健", "伊藤 由美", "中村 誠"];
const denominations = [
  { value: 10000, label: "10,000円札" },
  { value: 5000, label: "5,000円札" },
  { value: 1000, label: "1,000円札" },
  { value: 500, label: "500円硬貨" },
  { value: 100, label: "100円硬貨" },
  { value: 50, label: "50円硬貨" },
  { value: 10, label: "10円硬貨" },
  { value: 5, label: "5円硬貨" },
  { value: 1, label: "1円硬貨" },
];

const state = {
  activeMenu: menuData[0].id,
  quantities: {},
  history: [],
  nextReceiptNo: 1,
  undoStack: [],
  payment: "cash",
  cashReceived: 0,
  cashlessMethod: "クレジット",
  cashlessApproved: false,
  quantityEditing: null,
  quantityDraft: "0",
  cashCountEditing: null,
  cashCountDraft: "0",
  cancelTargetId: null,
  printTargetId: null,
  weather: "晴れ",
  staff: "山田 太郎",
  screen: "register",
  cashCounts: {
    opening: {},
    closing: {},
  },
  openingRegisteredAt: null,
  closingRegisteredAt: null,
};

const registerScreen = document.querySelector("#registerScreen");
const closingScreen = document.querySelector("#closingScreen");
const openClosing = document.querySelector("#openClosing");
const backRegister = document.querySelector("#backRegister");
const menuTabs = document.querySelector("#menuTabs");
const presetStrip = document.querySelector("#presetStrip");
const ticketGrid = document.querySelector("#ticketGrid");
const activeMenuLabel = document.querySelector("#activeMenuLabel");
const ticketContextLabel = document.querySelector("#ticketContextLabel");
const summaryList = document.querySelector("#summaryList");
const peopleTotal = document.querySelector("#peopleTotal");
const itemTotal = document.querySelector("#itemTotal");
const grandTotal = document.querySelector("#grandTotal");
const cashReceived = document.querySelector("#cashReceived");
const changeAmount = document.querySelector("#changeAmount");
const cashlessTotal = document.querySelector("#cashlessTotal");
const paymentTabs = document.querySelector("#paymentTabs");
const paymentModeLabel = document.querySelector("#paymentModeLabel");
const cashPanel = document.querySelector("#cashPanel");
const cashlessPanel = document.querySelector("#cashlessPanel");
const approveCashless = document.querySelector("#approveCashless");
const cashlessStatus = document.querySelector("#cashlessStatus");
const settleButton = document.querySelector("#settleButton");
const historyList = document.querySelector("#historyList");
const historyCount = document.querySelector("#historyCount");
const quantityDialog = document.querySelector("#quantityDialog");
const quantityTargetName = document.querySelector("#quantityTargetName");
const quantityInputValue = document.querySelector("#quantityInputValue");
const quantityPad = document.querySelector(".quantity-pad");
const quantityApply = document.querySelector("#quantityApply");
const quantityCancel = document.querySelector("#quantityCancel");
const quantityClear = document.querySelector("#quantityClear");
const cashCountDialog = document.querySelector("#cashCountDialog");
const cashCountTitle = document.querySelector("#cashCountTitle");
const cashCountTargetName = document.querySelector("#cashCountTargetName");
const cashCountInputValue = document.querySelector("#cashCountInputValue");
const cashCountPad = document.querySelector("#cashCountPad");
const cashCountApply = document.querySelector("#cashCountApply");
const cashCountCancel = document.querySelector("#cashCountCancel");
const cashCountClear = document.querySelector("#cashCountClear");
const confirmDialog = document.querySelector("#confirmDialog");
const confirmSummary = document.querySelector("#confirmSummary");
const confirmPayment = document.querySelector("#confirmPayment");
const confirmTotal = document.querySelector("#confirmTotal");
const confirmReceived = document.querySelector("#confirmReceived");
const confirmChange = document.querySelector("#confirmChange");
const confirmReceivedBlock = document.querySelector("#confirmReceivedBlock");
const confirmChangeBlock = document.querySelector("#confirmChangeBlock");
const confirmCancel = document.querySelector("#confirmCancel");
const confirmCancelTop = document.querySelector("#confirmCancelTop");
const confirmSettle = document.querySelector("#confirmSettle");
const cancelSaleDialog = document.querySelector("#cancelSaleDialog");
const cancelSaleSummary = document.querySelector("#cancelSaleSummary");
const cancelSalePayment = document.querySelector("#cancelSalePayment");
const cancelSaleTotal = document.querySelector("#cancelSaleTotal");
const cancelSaleNotice = document.querySelector("#cancelSaleNotice");
const cancelSaleClose = document.querySelector("#cancelSaleClose");
const cancelSaleBack = document.querySelector("#cancelSaleBack");
const cancelSaleConfirm = document.querySelector("#cancelSaleConfirm");
const cancelSaleNo = document.querySelector("#cancelSaleNo");
const cancelSaleStatus = document.querySelector("#cancelSaleStatus");
const printDialog = document.querySelector("#printDialog");
const printSaleNo = document.querySelector("#printSaleNo");
const printSaleTotal = document.querySelector("#printSaleTotal");
const printSaleMeta = document.querySelector("#printSaleMeta");
const printReceipt = document.querySelector("#printReceipt");
const printInvoice = document.querySelector("#printInvoice");
const printOutput = document.querySelector("#printOutput");
const printClose = document.querySelector("#printClose");
const weatherButton = document.querySelector("#weatherButton");
const weatherMenu = document.querySelector("#weatherMenu");
const staffButton = document.querySelector("#staffButton");
const staffMenu = document.querySelector("#staffMenu");
const openingAlert = document.querySelector("#openingAlert");
const openingCashRows = document.querySelector("#openingCashRows");
const closingCashRows = document.querySelector("#closingCashRows");
const openingCashTotal = document.querySelector("#openingCashTotal");
const cashSalesTotal = document.querySelector("#cashSalesTotal");
const expectedCashTotal = document.querySelector("#expectedCashTotal");
const closingCashTotal = document.querySelector("#closingCashTotal");
const cashDifference = document.querySelector("#cashDifference");
const activeSaleCount = document.querySelector("#activeSaleCount");
const closingPeopleTotal = document.querySelector("#closingPeopleTotal");
const cashSalesBreakdown = document.querySelector("#cashSalesBreakdown");
const creditSalesTotal = document.querySelector("#creditSalesTotal");
const emoneySalesTotal = document.querySelector("#emoneySalesTotal");
const grossSalesTotal = document.querySelector("#grossSalesTotal");
const ticketSalesSummary = document.querySelector("#ticketSalesSummary");
const openingSavedAt = document.querySelector("#openingSavedAt");
const closingSavedAt = document.querySelector("#closingSavedAt");
const saveOpeningCash = document.querySelector("#saveOpeningCash");
const saveClosingCash = document.querySelector("#saveClosingCash");
const printClosingReport = document.querySelector("#printClosingReport");
const toast = document.querySelector("#toast");
const clock = document.querySelector("#clock");

function yen(value) {
  return yenFormatter.format(value);
}

function timeLabel(date = new Date()) {
  return new Intl.DateTimeFormat("ja-JP", { hour: "2-digit", minute: "2-digit" }).format(date);
}

function formatReceiptNo(number) {
  return `No.${REGISTER_NUMBER}${String(number).padStart(5, "0")}`;
}

function activeMenu() {
  return menuData.find((menu) => menu.id === state.activeMenu);
}

function selectedRows() {
  return [...ticketsById.values()]
    .map((ticket) => {
      const quantity = state.quantities[ticket.id] || 0;
      return {
        ...ticket,
        quantity,
        lineTotal: quantity * ticket.price,
      };
    })
    .filter((row) => row.quantity > 0);
}

function totals() {
  return selectedRows().reduce(
    (acc, row) => {
      // 授与品などは countsAsPerson: false にすると人数には含めず、数量だけ増える。
      acc.people += row.countsAsPerson === false ? 0 : row.quantity;
      acc.items += row.quantity;
      acc.amount += row.lineTotal;
      return acc;
    },
    { people: 0, items: 0, amount: 0 },
  );
}

function menuQuantity(menuId) {
  return [...ticketsById.values()]
    .filter((ticket) => ticket.menuId === menuId)
    .reduce((sum, ticket) => sum + (state.quantities[ticket.id] || 0), 0);
}

function activeSales() {
  return state.history.filter((record) => !record.cancelled);
}

function countTotal(kind) {
  return denominations.reduce((sum, denomination) => {
    return sum + (state.cashCounts[kind][denomination.value] || 0) * denomination.value;
  }, 0);
}

function salesSummary() {
  return activeSales().reduce(
    (acc, record) => {
      acc.amount += record.amount;
      acc.people += record.people;
      if (record.payment === "現金") {
        acc.cash += record.amount;
      } else if (record.payment === "クレジット") {
        acc.credit += record.amount;
      } else if (record.payment === "電子マネー") {
        acc.emoney += record.amount;
      } else {
        acc.cashless += record.amount;
      }
      return acc;
    },
    { amount: 0, people: 0, cash: 0, credit: 0, emoney: 0, cashless: 0 },
  );
}

function ticketSalesRows() {
  const totalsByTicket = new Map([...ticketsById.values()].map((ticket) => [ticket.id, { ...ticket, quantity: 0, amount: 0 }]));
  activeSales().forEach((record) => {
    (record.rows || []).forEach((row) => {
      const current = totalsByTicket.get(row.id);
      if (!current) return;
      current.quantity += row.quantity;
      current.amount += row.lineTotal;
    });
  });
  return [...totalsByTicket.values()].filter((row) => row.quantity > 0);
}

function snapshot() {
  return {
    quantities: { ...state.quantities },
    cashReceived: state.cashReceived,
    payment: state.payment,
    cashlessMethod: state.cashlessMethod,
    cashlessApproved: state.cashlessApproved,
  };
}

function pushUndo(before) {
  state.undoStack.push(JSON.stringify(before));
  if (state.undoStack.length > 30) {
    state.undoStack.shift();
  }
}

function restoreSnapshot(saved) {
  state.quantities = saved.quantities || {};
  state.cashReceived = saved.cashReceived || 0;
  state.payment = saved.payment || "cash";
  state.cashlessMethod = saved.cashlessMethod || "クレジット";
  state.cashlessApproved = Boolean(saved.cashlessApproved);
}

function setQuantity(id, quantity) {
  const before = snapshot();
  const next = Math.max(0, Math.min(999, Number(quantity) || 0));
  pushUndo(before);
  state.quantities[id] = next;
  if (next === 0) {
    delete state.quantities[id];
  }
  state.cashlessApproved = false;
  render();
}

function addQuantity(id, delta) {
  setQuantity(id, (state.quantities[id] || 0) + delta);
}

function clearTicket(id) {
  if (!state.quantities[id]) {
    return;
  }
  setQuantity(id, 0);
}

function applyPreset(preset) {
  const before = snapshot();
  pushUndo(before);
  Object.entries(preset.items).forEach(([id, amount]) => {
    state.quantities[id] = Math.min(999, (state.quantities[id] || 0) + amount);
  });
  state.cashlessApproved = false;
  render();
}

function clearOrder() {
  if (selectedRows().length === 0 && state.cashReceived === 0) {
    return;
  }
  pushUndo(snapshot());
  state.quantities = {};
  state.cashReceived = 0;
  state.cashlessApproved = false;
  closeConfirm();
  closeCancelSale();
  closeQuantityPad();
  closeCashCountPad();
  render();
}

function undo() {
  const saved = state.undoStack.pop();
  if (!saved) {
    showToast("取消できる操作がありません");
    return;
  }
  restoreSnapshot(JSON.parse(saved));
  closeConfirm();
  closeCancelSale();
  closeQuantityPad();
  closeCashCountPad();
  render();
}

function setPayment(payment) {
  if (state.payment === payment) {
    return;
  }
  pushUndo(snapshot());
  state.payment = payment;
  state.cashlessApproved = false;
  render();
}

function appendCashDigit(value) {
  pushUndo(snapshot());
  const current = String(state.cashReceived || "");
  const next = Number(`${current}${value}`.slice(0, 7));
  state.cashReceived = Number.isFinite(next) ? next : 0;
  render();
}

function addCash(amount) {
  pushUndo(snapshot());
  state.cashReceived = Math.min(9999999, state.cashReceived + amount);
  render();
}

function openQuantityPad(id) {
  const ticket = ticketsById.get(id);
  if (!ticket) {
    return;
  }
  state.quantityEditing = id;
  state.quantityDraft = String(state.quantities[id] || 0);
  renderQuantityDialog();
  quantityDialog.classList.remove("hidden");
  quantityApply.focus();
}

function closeQuantityPad() {
  state.quantityEditing = null;
  state.quantityDraft = "0";
  quantityDialog.classList.add("hidden");
}

function renderQuantityDialog() {
  const ticket = ticketsById.get(state.quantityEditing);
  quantityTargetName.textContent = ticket ? ticket.name : "券種";
  quantityInputValue.textContent = state.quantityDraft || "0";
}

function appendQuantityDigit(digit) {
  const base = state.quantityDraft === "0" ? "" : state.quantityDraft;
  const next = `${base}${digit}`.replace(/^0+(?=\d)/, "").slice(0, 3);
  state.quantityDraft = next || "0";
  renderQuantityDialog();
}

function backspaceQuantity() {
  state.quantityDraft = state.quantityDraft.length > 1 ? state.quantityDraft.slice(0, -1) : "0";
  renderQuantityDialog();
}

function applyQuantityDraft() {
  if (!state.quantityEditing) {
    return;
  }
  const id = state.quantityEditing;
  const next = Number(state.quantityDraft || "0");
  closeQuantityPad();
  setQuantity(id, next);
}

function openCashCountPad(kind, denominationValue) {
  const denomination = denominations.find((item) => String(item.value) === String(denominationValue));
  if (!denomination || !state.cashCounts[kind]) {
    return;
  }
  state.cashCountEditing = { kind, denominationValue: String(denominationValue) };
  state.cashCountDraft = String(state.cashCounts[kind][denominationValue] || 0);
  renderCashCountDialog();
  cashCountDialog.classList.remove("hidden");
  cashCountApply.focus();
}

function closeCashCountPad() {
  state.cashCountEditing = null;
  state.cashCountDraft = "0";
  cashCountDialog.classList.add("hidden");
}

function renderCashCountDialog() {
  const editing = state.cashCountEditing;
  const denomination = editing
    ? denominations.find((item) => String(item.value) === String(editing.denominationValue))
    : null;
  cashCountTitle.textContent = editing?.kind === "closing" ? "レジ締 枚数入力" : "元金 枚数入力";
  cashCountTargetName.textContent = denomination ? denomination.label : "金種";
  cashCountInputValue.textContent = state.cashCountDraft || "0";
}

function appendCashCountDigit(digit) {
  const base = state.cashCountDraft === "0" ? "" : state.cashCountDraft;
  const next = `${base}${digit}`.replace(/^0+(?=\d)/, "").slice(0, 3);
  state.cashCountDraft = next || "0";
  renderCashCountDialog();
}

function backspaceCashCountDigit() {
  state.cashCountDraft = state.cashCountDraft.length > 1 ? state.cashCountDraft.slice(0, -1) : "0";
  renderCashCountDialog();
}

function applyCashCountDraft() {
  if (!state.cashCountEditing) {
    return;
  }
  const { kind, denominationValue } = state.cashCountEditing;
  const next = Math.max(0, Math.min(999, Number(state.cashCountDraft) || 0));
  state.cashCounts[kind][denominationValue] = next;
  closeCashCountPad();
  renderCashCountRows(kind, kind === "opening" ? openingCashRows : closingCashRows);
  renderClosingTotals();
}

function validateSettlement() {
  const total = totals();
  if (total.items === 0) {
    showToast("券種が選択されていません");
    return false;
  }
  if (state.payment === "cash" && state.cashReceived < total.amount) {
    showToast("お預り金額が不足しています");
    return false;
  }
  if (state.payment === "cashless" && !state.cashlessApproved) {
    showToast("キャッシュレス承認を確認してください");
    return false;
  }
  return true;
}

function paymentDetailText() {
  const total = totals();
  if (state.payment === "cash") {
    return `現金 / お預り ${yen(state.cashReceived)} / お釣り ${yen(Math.max(0, state.cashReceived - total.amount))}`;
  }
  return `${state.cashlessMethod} / 承認済み`;
}

function openConfirm() {
  if (!validateSettlement()) {
    return;
  }
  renderConfirm();
  confirmDialog.classList.remove("hidden");
  confirmSettle.focus();
}

function openCashlessApprovalFlow() {
  const total = totals();
  if (total.items === 0) {
    showToast("券種が選択されていません");
    return;
  }
  state.cashlessApproved = true;
  render();
  openConfirm();
}

function closeConfirm() {
  confirmDialog.classList.add("hidden");
}

function renderRowsForDialog(rows) {
  return rows
    .map(
      (row) => `
        <div class="confirm-row">
          <strong>${row.name}</strong>
          <strong class="confirm-line-total">${yen(row.lineTotal)}</strong>
          <span>${yen(row.price)} × ${row.quantity}</span>
          <span>${row.quantity}名</span>
        </div>
      `,
    )
    .join("");
}

function renderConfirm() {
  const total = totals();
  const isCash = state.payment === "cash";
  confirmSummary.innerHTML = renderRowsForDialog(selectedRows());
  confirmTotal.textContent = yen(total.amount);
  confirmPayment.textContent = isCash ? "現金" : state.cashlessMethod;
  confirmReceived.textContent = yen(state.cashReceived);
  confirmChange.textContent = yen(Math.max(0, state.cashReceived - total.amount));
  confirmReceivedBlock.classList.toggle("hidden", !isCash);
  confirmChangeBlock.classList.toggle("hidden", !isCash);
}

function finalizeSettlement() {
  if (!validateSettlement()) {
    closeConfirm();
    return;
  }
  const total = totals();
  const receiptNo = formatReceiptNo(state.nextReceiptNo);
  const record = {
    id: globalThis.crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
    receiptNo,
    time: timeLabel(),
    amount: total.amount,
    people: total.people,
    payment: state.payment === "cash" ? "現金" : state.cashlessMethod,
    paymentDetail: paymentDetailText(),
    weather: state.weather,
    staff: state.staff,
    rows: selectedRows().map(({ id, name, price, quantity, lineTotal }) => ({ id, name, price, quantity, lineTotal })),
    cancelled: false,
    cancelledAt: null,
  };
  state.nextReceiptNo += 1;
  state.history.unshift(record);
  state.quantities = {};
  state.cashReceived = 0;
  state.cashlessApproved = false;
  state.undoStack = [];
  closeConfirm();
  showToast(`${record.receiptNo} ${yen(record.amount)} 会計確定`);
  render();
}

function openCancelSale(id) {
  const record = state.history.find((item) => item.id === id);
  if (!record || record.cancelled) {
    return;
  }
  state.cancelTargetId = id;
  renderCancelSale(record);
  cancelSaleDialog.classList.remove("hidden");
  cancelSaleConfirm.focus();
}

function closeCancelSale() {
  state.cancelTargetId = null;
  cancelSaleDialog.classList.add("hidden");
}

function recordPaymentName(record) {
  return record.payment === "現金" ? "現金" : record.payment;
}

function renderCancelSale(record) {
  cancelSaleSummary.innerHTML = renderRowsForDialog(record.rows || []);
  cancelSaleNo.textContent = record.receiptNo || "";
  cancelSalePayment.textContent = recordPaymentName(record);
  cancelSaleTotal.textContent = yen(record.amount);
  cancelSaleStatus.textContent = record.payment === "現金" ? "返金確認" : "承認済み";
  cancelSaleNotice.textContent =
    record.payment === "現金"
      ? "現金を返金してから「取消する」を押してください。"
      : "決済端末側で取消または返金処理を済ませてから「取消する」を押してください。";
}

function finalizeCancelSale() {
  const record = state.history.find((item) => item.id === state.cancelTargetId);
  if (!record || record.cancelled) {
    closeCancelSale();
    return;
  }
  record.cancelled = true;
  record.cancelledAt = timeLabel();
  closeCancelSale();
  showToast(`${yen(record.amount)} 取消済み`);
  render();
}

function openPrintDialog(id) {
  const record = state.history.find((item) => item.id === id);
  if (!record || record.cancelled) {
    return;
  }
  state.printTargetId = id;
  renderPrintDialog(record);
  printDialog.classList.remove("hidden");
  printReceipt.focus();
}

function closePrintDialog() {
  state.printTargetId = null;
  printDialog.classList.add("hidden");
}

function renderPrintDialog(record) {
  printSaleNo.textContent = `${record.receiptNo || ""} ${record.time}`.trim();
  printSaleTotal.textContent = yen(record.amount);
  printSaleMeta.textContent = `${recordPaymentName(record)} / ${record.people}名 / 天候:${record.weather || "未記録"} / 担当:${record.staff || "未記録"}${record.cancelled ? " / 取消済" : ""}`;
  printOutput.classList.add("hidden");
  printOutput.textContent = "";
}

function issuePrint(kind) {
  const record = state.history.find((item) => item.id === state.printTargetId);
  if (!record) {
    closePrintDialog();
    return;
  }
  const label = kind === "receipt" ? "レシート" : "領収書";
  printOutput.innerHTML = `
    <strong>${label}を出力しました</strong>
    <span>${record.receiptNo || ""} / ${recordPaymentName(record)} / ${yen(record.amount)}</span>
  `;
  printOutput.classList.remove("hidden");
  showToast(`${record.receiptNo || ""} ${label}発行`);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 1600);
}

function renderMenuTabs() {
  menuTabs.innerHTML = menuData
    .map((menu) => {
      const count = menuQuantity(menu.id);
      return `
        <button type="button" class="${menu.id === state.activeMenu ? "active" : ""}" data-menu="${menu.id}" role="tab" aria-selected="${menu.id === state.activeMenu}">
          <span>${menu.label}</span>
          <span class="menu-tab-count">${count}名</span>
        </button>
      `;
    })
    .join("");
  activeMenuLabel.textContent = activeMenu().label;
  ticketContextLabel.textContent = activeMenu().label;
}

function renderPresets() {
  presetStrip.innerHTML = activeMenu()
    .presets.map(
      (preset, index) => `
        <button type="button" data-preset="${index}">
          ${preset.label}
        </button>
      `,
    )
    .join("");
}

function renderTickets() {
  ticketGrid.innerHTML = activeMenu()
    .tickets.map((ticket) => {
      const quantity = state.quantities[ticket.id] || 0;
      return `
        <article class="ticket-card ${quantity > 0 ? "selected" : ""}">
          <div class="ticket-info">
            <div class="ticket-name">
              <span>${ticket.name}</span>
              <span class="ticket-tag">${ticket.tag}</span>
            </div>
            <div class="ticket-meta">
              <span>${yen(ticket.price)}</span>
              <span class="ticket-line-total">${quantity > 0 ? `${quantity}名 ${yen(quantity * ticket.price)}` : ""}</span>
            </div>
          </div>
          <div class="ticket-controls" aria-label="${ticket.name}">
            <button type="button" class="minus" data-ticket="${ticket.id}" data-delta="-1" aria-label="${ticket.name}を1名減らす">−</button>
            <button type="button" class="count-button" data-quantity="${ticket.id}" aria-label="${ticket.name}の数量を直接入力">${quantity}</button>
            <button type="button" class="plus" data-ticket="${ticket.id}" data-delta="1" aria-label="${ticket.name}を1名追加">＋</button>
            <button type="button" class="quick-add" data-ticket="${ticket.id}" data-delta="5">＋5</button>
            <button type="button" class="clear-ticket" data-clear-ticket="${ticket.id}" ${quantity === 0 ? "disabled" : ""}>クリア</button>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderSummary() {
  const rows = selectedRows();
  summaryList.innerHTML =
    rows.length === 0
      ? `<div class="empty-state">未選択</div>`
      : rows
          .map(
            (row) => `
              <div class="summary-row">
                <strong>${row.name}</strong>
                <strong class="line-total">${yen(row.lineTotal)}</strong>
                <button type="button" class="summary-delete" data-remove-summary="${row.id}" aria-label="${row.name}を削除">削除</button>
                <span>${yen(row.price)} × ${row.quantity}</span>
                <span>${row.quantity}名</span>
              </div>
            `,
          )
          .join("");

  const total = totals();
  peopleTotal.textContent = `${total.people}名`;
  itemTotal.textContent = String(total.items);
  grandTotal.textContent = yen(total.amount);
  cashReceived.textContent = yen(state.cashReceived);
  cashlessTotal.textContent = yen(total.amount);
  changeAmount.textContent = yen(Math.max(0, state.cashReceived - total.amount));
  settleButton.disabled =
    total.items === 0 ||
    (state.payment === "cash" && state.cashReceived < total.amount) ||
    (state.payment === "cashless" && !state.cashlessApproved);
}

function renderPayment() {
  [...paymentTabs.querySelectorAll("button")].forEach((button) => {
    const active = button.dataset.payment === state.payment;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });
  paymentModeLabel.textContent = state.payment === "cash" ? "現金" : "キャッシュレス";
  cashPanel.classList.toggle("hidden", state.payment !== "cash");
  cashlessPanel.classList.toggle("hidden", state.payment !== "cashless");
  document.querySelectorAll("[data-cashless]").forEach((button) => {
    button.classList.toggle("active", button.dataset.cashless === state.cashlessMethod);
  });
  approveCashless.classList.toggle("approved", state.cashlessApproved);
  approveCashless.textContent = state.cashlessApproved ? "承認済み・確認へ" : "承認して会計確認";
  cashlessStatus.textContent = state.cashlessApproved ? `${state.cashlessMethod} 承認済み` : "未処理";
}

function renderHistory() {
  historyCount.textContent = `${state.history.length}件`;
  historyList.innerHTML =
    state.history.length === 0
      ? `<div class="empty-state">履歴なし</div>`
      : state.history
          .map(
            (record) => `
              <div class="history-row ${record.cancelled ? "cancelled" : ""}">
                <strong>${record.receiptNo || ""} ${record.time} ${record.payment}</strong>
                <strong class="history-total">${yen(record.amount)}</strong>
                <button type="button" class="history-print" data-print-sale="${record.id}" ${record.cancelled ? "disabled" : ""}>印刷</button>
                <button type="button" class="history-cancel" data-cancel-sale="${record.id}" ${record.cancelled ? "disabled" : ""}>取消</button>
                <span>${record.people}名 / ${record.weather || "未記録"} / ${record.staff || "未記録"}</span>
                <span class="history-status ${record.cancelled ? "cancelled" : ""}">${record.cancelled ? `取消済 ${record.cancelledAt}` : "確定"}</span>
              </div>
            `,
          )
          .join("");
}

function renderWeather() {
  weatherButton.textContent = `天候：${state.weather}`;
  weatherMenu.innerHTML = weatherOptions
    .map(
      (weather) => `
        <button type="button" class="${weather === state.weather ? "active" : ""}" data-weather="${weather}">
          ${weather}
        </button>
      `,
    )
    .join("");
}

function renderStaff() {
  staffButton.textContent = `担当：${state.staff}`;
  staffMenu.innerHTML = staffOptions
    .map(
      (staff) => `
        <button type="button" class="${staff === state.staff ? "active" : ""}" data-staff="${staff}">
          ${staff}
        </button>
      `,
    )
    .join("");
}

function renderCashCountRows(kind, container) {
  container.innerHTML = denominations
    .map((denomination) => {
      const count = state.cashCounts[kind][denomination.value] || 0;
      return `
        <div class="cash-count-row" data-kind="${kind}" data-denom="${denomination.value}">
          <div class="cash-denomination">
            <strong>${denomination.label}</strong>
          </div>
          <button class="cash-count-input" type="button" data-cash-count data-cash-kind="${kind}" data-cash-denom="${denomination.value}" aria-label="${denomination.label}の枚数を入力">
            ${count}
          </button>
          <span>枚</span>
          <strong class="cash-row-total">${yen(count * denomination.value)}</strong>
        </div>
      `;
    })
    .join("");
}

function renderClosingTotals() {
  const sales = salesSummary();
  const openingTotal = countTotal("opening");
  const drawerTotal = countTotal("closing");
  const expectedTotal = openingTotal + sales.cash;
  const difference = drawerTotal - expectedTotal;

  openingCashTotal.textContent = yen(openingTotal);
  cashSalesTotal.textContent = yen(sales.cash);
  expectedCashTotal.textContent = yen(expectedTotal);
  closingCashTotal.textContent = yen(drawerTotal);
  cashDifference.textContent = yen(difference);
  cashDifference.classList.toggle("balanced", difference === 0);
  cashDifference.classList.toggle("shortage", difference < 0);
  cashDifference.classList.toggle("overage", difference > 0);

  activeSaleCount.textContent = `${activeSales().length}件`;
  closingPeopleTotal.textContent = `${sales.people}名`;
  cashSalesBreakdown.textContent = yen(sales.cash);
  creditSalesTotal.textContent = yen(sales.credit + sales.cashless);
  emoneySalesTotal.textContent = yen(sales.emoney);
  grossSalesTotal.textContent = yen(sales.amount);
  openingSavedAt.textContent = state.openingRegisteredAt ? `登録 ${state.openingRegisteredAt}` : "未登録";
  closingSavedAt.textContent = state.closingRegisteredAt ? `登録 ${state.closingRegisteredAt}` : "未登録";
  renderOpeningAlert();
}

function renderOpeningAlert() {
  openingAlert.classList.toggle("hidden", Boolean(state.openingRegisteredAt));
}

function renderTicketSalesSummary() {
  const rows = ticketSalesRows();
  ticketSalesSummary.innerHTML =
    rows.length === 0
      ? `<div class="empty-state">売上なし</div>`
      : rows
          .map(
            (row) => `
              <div class="ticket-sales-row">
                <strong class="ticket-sales-name">${row.name}</strong>
                <span class="ticket-sales-tag">${row.tag}</span>
                <strong class="ticket-sales-quantity">${row.quantity}名</strong>
                <strong class="ticket-sales-amount">${yen(row.amount)}</strong>
              </div>
            `,
          )
          .join("");
}

function renderClosing() {
  renderCashCountRows("opening", openingCashRows);
  renderCashCountRows("closing", closingCashRows);
  renderClosingTotals();
  renderTicketSalesSummary();
}

function render() {
  renderMenuTabs();
  renderPresets();
  renderTickets();
  renderSummary();
  renderPayment();
  renderHistory();
  renderWeather();
  renderStaff();
  renderOpeningAlert();
  if (state.screen === "closing") {
    renderClosing();
  }
}

function showClosingScreen() {
  state.screen = "closing";
  registerScreen.classList.add("hidden");
  closingScreen.classList.remove("hidden");
  closeQuantityPad();
  closeConfirm();
  closeCancelSale();
  closePrintDialog();
  closeCashCountPad();
  renderClosing();
}

function showRegisterScreen() {
  state.screen = "register";
  closingScreen.classList.add("hidden");
  registerScreen.classList.remove("hidden");
  closeCashCountPad();
  render();
}

menuTabs.addEventListener("click", (event) => {
  const button = event.target.closest("[data-menu]");
  if (!button) return;
  state.activeMenu = button.dataset.menu;
  render();
});

presetStrip.addEventListener("click", (event) => {
  const button = event.target.closest("[data-preset]");
  if (!button) return;
  applyPreset(activeMenu().presets[Number(button.dataset.preset)]);
});

ticketGrid.addEventListener("click", (event) => {
  const quantityButton = event.target.closest("[data-quantity]");
  if (quantityButton) {
    openQuantityPad(quantityButton.dataset.quantity);
    return;
  }

  const clearButton = event.target.closest("[data-clear-ticket]");
  if (clearButton) {
    clearTicket(clearButton.dataset.clearTicket);
    return;
  }

  const button = event.target.closest("[data-ticket]");
  if (!button) return;
  addQuantity(button.dataset.ticket, Number(button.dataset.delta));
});

summaryList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove-summary]");
  if (!button) return;
  clearTicket(button.dataset.removeSummary);
});

paymentTabs.addEventListener("click", (event) => {
  const button = event.target.closest("[data-payment]");
  if (!button) return;
  setPayment(button.dataset.payment);
});

document.querySelector("#undoButton").addEventListener("click", undo);
document.querySelector("#clearOrder").addEventListener("click", clearOrder);
openClosing.addEventListener("click", showClosingScreen);
backRegister.addEventListener("click", showRegisterScreen);
settleButton.addEventListener("click", openConfirm);
approveCashless.addEventListener("click", openCashlessApprovalFlow);

function handleCashCountClick(event) {
  const button = event.target.closest("[data-cash-count]");
  if (!button) return;
  openCashCountPad(button.dataset.cashKind, button.dataset.cashDenom);
}

openingCashRows.addEventListener("click", handleCashCountClick);
closingCashRows.addEventListener("click", handleCashCountClick);

saveOpeningCash.addEventListener("click", () => {
  state.openingRegisteredAt = timeLabel();
  renderClosingTotals();
  showToast("レジ元金を登録しました");
});

saveClosingCash.addEventListener("click", () => {
  state.closingRegisteredAt = timeLabel();
  renderClosingTotals();
  showToast("レジ締を登録しました");
});

printClosingReport.addEventListener("click", () => {
  showToast("レジ締集計表を印刷しました");
});

document.querySelector(".quick-money").addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.dataset.cash === "exact") {
    pushUndo(snapshot());
    state.cashReceived = totals().amount;
    render();
    return;
  }
  if (button.dataset.cashAdd) {
    addCash(Number(button.dataset.cashAdd));
  }
});

document.querySelector(".money-pad").addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.dataset.action === "clearCash") {
    pushUndo(snapshot());
    state.cashReceived = 0;
    render();
    return;
  }
  if (button.dataset.digit) {
    appendCashDigit(button.dataset.digit);
  }
});

document.querySelector(".cashless-methods").addEventListener("click", (event) => {
  const button = event.target.closest("[data-cashless]");
  if (!button) return;
  state.cashlessMethod = button.dataset.cashless;
  state.cashlessApproved = false;
  render();
});

quantityPad.addEventListener("click", (event) => {
  const digit = event.target.closest("[data-qty-digit]");
  if (digit) {
    appendQuantityDigit(digit.dataset.qtyDigit);
    return;
  }
  const action = event.target.closest("[data-qty-action]");
  if (!action) return;
  if (action.dataset.qtyAction === "clear") {
    state.quantityDraft = "0";
    renderQuantityDialog();
  }
  if (action.dataset.qtyAction === "back") {
    backspaceQuantity();
  }
});

quantityApply.addEventListener("click", applyQuantityDraft);
quantityCancel.addEventListener("click", closeQuantityPad);
quantityClear.addEventListener("click", () => {
  state.quantityDraft = "0";
  applyQuantityDraft();
});
quantityDialog.addEventListener("click", (event) => {
  if (event.target === quantityDialog) {
    closeQuantityPad();
  }
});

cashCountPad.addEventListener("click", (event) => {
  const digit = event.target.closest("[data-cash-count-digit]");
  if (digit) {
    appendCashCountDigit(digit.dataset.cashCountDigit);
    return;
  }
  const action = event.target.closest("[data-cash-count-action]");
  if (!action) return;
  if (action.dataset.cashCountAction === "clear") {
    state.cashCountDraft = "0";
    renderCashCountDialog();
  }
  if (action.dataset.cashCountAction === "back") {
    backspaceCashCountDigit();
  }
});

cashCountApply.addEventListener("click", applyCashCountDraft);
cashCountCancel.addEventListener("click", closeCashCountPad);
cashCountClear.addEventListener("click", () => {
  state.cashCountDraft = "0";
  applyCashCountDraft();
});
cashCountDialog.addEventListener("click", (event) => {
  if (event.target === cashCountDialog) {
    closeCashCountPad();
  }
});

confirmCancel.addEventListener("click", closeConfirm);
confirmCancelTop.addEventListener("click", closeConfirm);
confirmSettle.addEventListener("click", finalizeSettlement);
confirmDialog.addEventListener("click", (event) => {
  if (event.target === confirmDialog) {
    closeConfirm();
  }
});

historyList.addEventListener("click", (event) => {
  const printButton = event.target.closest("[data-print-sale]");
  if (printButton) {
    openPrintDialog(printButton.dataset.printSale);
    return;
  }

  const cancelButton = event.target.closest("[data-cancel-sale]");
  if (!cancelButton) return;
  openCancelSale(cancelButton.dataset.cancelSale);
});

cancelSaleBack.addEventListener("click", closeCancelSale);
cancelSaleClose.addEventListener("click", closeCancelSale);
cancelSaleConfirm.addEventListener("click", finalizeCancelSale);
cancelSaleDialog.addEventListener("click", (event) => {
  if (event.target === cancelSaleDialog) {
    closeCancelSale();
  }
});

printClose.addEventListener("click", closePrintDialog);
printReceipt.addEventListener("click", () => issuePrint("receipt"));
printInvoice.addEventListener("click", () => issuePrint("invoice"));
printDialog.addEventListener("click", (event) => {
  if (event.target === printDialog) {
    closePrintDialog();
  }
});

weatherButton.addEventListener("click", () => {
  const isOpen = !weatherMenu.classList.contains("hidden");
  staffMenu.classList.add("hidden");
  staffButton.setAttribute("aria-expanded", "false");
  weatherMenu.classList.toggle("hidden", isOpen);
  weatherButton.setAttribute("aria-expanded", String(!isOpen));
});

weatherMenu.addEventListener("click", (event) => {
  const button = event.target.closest("[data-weather]");
  if (!button) return;
  state.weather = button.dataset.weather;
  weatherMenu.classList.add("hidden");
  weatherButton.setAttribute("aria-expanded", "false");
  renderWeather();
});

staffButton.addEventListener("click", () => {
  const isOpen = !staffMenu.classList.contains("hidden");
  weatherMenu.classList.add("hidden");
  weatherButton.setAttribute("aria-expanded", "false");
  staffMenu.classList.toggle("hidden", isOpen);
  staffButton.setAttribute("aria-expanded", String(!isOpen));
});

staffMenu.addEventListener("click", (event) => {
  const button = event.target.closest("[data-staff]");
  if (!button) return;
  state.staff = button.dataset.staff;
  staffMenu.classList.add("hidden");
  staffButton.setAttribute("aria-expanded", "false");
  renderStaff();
});

document.addEventListener("click", (event) => {
  if (event.target.closest(".weather-selector, .staff-selector")) {
    return;
  }
  weatherMenu.classList.add("hidden");
  weatherButton.setAttribute("aria-expanded", "false");
  staffMenu.classList.add("hidden");
  staffButton.setAttribute("aria-expanded", "false");
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeQuantityPad();
    closeCashCountPad();
    closeConfirm();
    closeCancelSale();
    closePrintDialog();
    weatherMenu.classList.add("hidden");
    weatherButton.setAttribute("aria-expanded", "false");
    staffMenu.classList.add("hidden");
    staffButton.setAttribute("aria-expanded", "false");
  }
});

function updateClock() {
  const now = new Date();
  const date = new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
    weekday: "short",
  }).format(now);
  const time = new Intl.DateTimeFormat("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(now);
  clock.textContent = `${date} ${time}`;
}

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  navigator.serviceWorker.register("./service-worker.js").catch(() => {});
}

updateClock();
window.setInterval(updateClock, 30_000);
render();
