const categories = [
  { id: "food", label: "食品" },
  { id: "drink", label: "飲料" },
  { id: "goshuin", label: "ご朱印用品" },
  { id: "amulet", label: "お守り" },
  { id: "goods", label: "雑貨" },
  { id: "other", label: "その他" },
];

const products = [
  { id: "senbei", category: "food", name: "門前せんべい", price: 650, barcode: "4901000000011", code: "1001", tax: "food" },
  { id: "manju", category: "food", name: "抹茶まんじゅう", price: 900, barcode: "4901000000028", code: "1002", tax: "food" },
  { id: "yokan", category: "food", name: "小倉ようかん", price: 1200, barcode: "4901000000035", code: "1003", tax: "food" },
  { id: "teaBag", category: "food", name: "煎茶ティーバッグ", price: 800, barcode: "4901000000042", code: "1004", tax: "food" },
  { id: "bottleTea", category: "drink", name: "冷茶ボトル", price: 180, barcode: "4902000000018", code: "2001", tax: "food" },
  { id: "coffee", category: "drink", name: "缶コーヒー", price: 160, barcode: "4902000000025", code: "2002", tax: "food" },
  { id: "amazake", category: "drink", name: "甘酒", price: 350, barcode: "4902000000032", code: "2003", tax: "food" },
  { id: "goshuinBook", category: "goshuin", name: "ご朱印帳", price: 1800, barcode: "4903000000015", code: "3001", tax: "standard" },
  { id: "goshuinCase", category: "goshuin", name: "ご朱印帳袋", price: 950, barcode: "4903000000022", code: "3002", tax: "standard" },
  { id: "brushPen", category: "goshuin", name: "筆ペン", price: 500, barcode: "4903000000039", code: "3003", tax: "standard" },
  { id: "trafficCharm", category: "amulet", name: "交通安全守", price: 800, barcode: "4904000000012", code: "4001", tax: "exempt" },
  { id: "healthCharm", category: "amulet", name: "健康守", price: 800, barcode: "4904000000029", code: "4002", tax: "exempt" },
  { id: "studyCharm", category: "amulet", name: "学業成就守", price: 900, barcode: "4904000000036", code: "4003", tax: "exempt" },
  { id: "keyHolder", category: "goods", name: "寺紋キーホルダー", price: 650, barcode: "4905000000019", code: "5001", tax: "standard" },
  { id: "postcard", category: "goods", name: "絵はがきセット", price: 450, barcode: "4905000000026", code: "5002", tax: "standard" },
  { id: "towel", category: "goods", name: "手ぬぐい", price: 1100, barcode: "4905000000033", code: "5003", tax: "standard" },
  { id: "bag", category: "other", name: "紙袋", price: 50, barcode: "4906000000016", code: "9001", tax: "standard" },
  { id: "shipping", category: "other", name: "送料", price: 800, barcode: "", code: "9002", tax: "standard" },
];

const yenFormatter = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0,
});
const REGISTER_NUMBER = "02";
const staffName = "山田 太郎";
const weatherOptions = ["快晴", "晴れ", "曇り", "小雨", "雨", "豪雨", "台風", "雪", "大雪"];
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
  activeCategory: categories[0].id,
  cart: [],
  undoStack: [],
  serviceMode: "takeout",
  payment: "cash",
  cashReceived: 0,
  cashlessMethod: "クレジット",
  cashlessApproved: false,
  scanCodeDraft: "",
  weather: "晴れ",
  history: [],
  nextReceiptNo: 1,
  screen: "register",
  cashCounts: {
    opening: {},
    closing: {},
  },
  openingRegisteredAt: null,
  closingRegisteredAt: null,
  cashCountEditing: null,
  cashCountDraft: "0",
  quantityEditingId: null,
  quantityDraft: "0",
  cancelTargetId: null,
  printTargetId: null,
};

const productsById = new Map(products.map((product) => [product.id, product]));
const productsByBarcode = new Map(products.filter((product) => product.barcode).map((product) => [product.barcode, product]));
const productsByCode = new Map(products.map((product) => [product.code, product]));

const registerScreen = document.querySelector("#registerScreen");
const closingScreen = document.querySelector("#closingScreen");
const openClosing = document.querySelector("#openClosing");
const backRegister = document.querySelector("#backRegister");
const categoryTabs = document.querySelector("#categoryTabs");
const productGrid = document.querySelector("#productGrid");
const activeCategoryLabel = document.querySelector("#activeCategoryLabel");
const categoryContextLabel = document.querySelector("#categoryContextLabel");
const barcodeInput = document.querySelector("#barcodeInput");
const addBarcodeButton = document.querySelector("#addBarcode");
const scannerStatus = document.querySelector("#scannerStatus");
const serviceMode = document.querySelector("#serviceMode");
const serviceNote = document.querySelector("#serviceNote");
const cartList = document.querySelector("#cartList");
const cartCount = document.querySelector("#cartCount");
const itemTotal = document.querySelector("#itemTotal");
const taxSummary = document.querySelector("#taxSummary");
const grandTotal = document.querySelector("#grandTotal");
const paymentTabs = document.querySelector("#paymentTabs");
const paymentModeLabel = document.querySelector("#paymentModeLabel");
const cashPanel = document.querySelector("#cashPanel");
const cashlessPanel = document.querySelector("#cashlessPanel");
const cashReceived = document.querySelector("#cashReceived");
const changeAmount = document.querySelector("#changeAmount");
const cashlessTotal = document.querySelector("#cashlessTotal");
const cashlessMethods = document.querySelector("#cashlessMethods");
const cashlessStatus = document.querySelector("#cashlessStatus");
const approveCashless = document.querySelector("#approveCashless");
const settleButton = document.querySelector("#settleButton");
const historyList = document.querySelector("#historyList");
const historyCount = document.querySelector("#historyCount");
const openingCashRows = document.querySelector("#openingCashRows");
const closingCashRows = document.querySelector("#closingCashRows");
const openingCashTotal = document.querySelector("#openingCashTotal");
const cashSalesTotal = document.querySelector("#cashSalesTotal");
const expectedCashTotal = document.querySelector("#expectedCashTotal");
const closingCashTotal = document.querySelector("#closingCashTotal");
const cashDifference = document.querySelector("#cashDifference");
const activeSaleCount = document.querySelector("#activeSaleCount");
const closingItemTotal = document.querySelector("#closingItemTotal");
const cashSalesBreakdown = document.querySelector("#cashSalesBreakdown");
const creditSalesTotal = document.querySelector("#creditSalesTotal");
const emoneySalesTotal = document.querySelector("#emoneySalesTotal");
const grossSalesTotal = document.querySelector("#grossSalesTotal");
const openingSavedAt = document.querySelector("#openingSavedAt");
const closingSavedAt = document.querySelector("#closingSavedAt");
const saveOpeningCash = document.querySelector("#saveOpeningCash");
const saveClosingCash = document.querySelector("#saveClosingCash");
const printClosingReport = document.querySelector("#printClosingReport");
const closingTaxSummary = document.querySelector("#closingTaxSummary");
const closingProductSummary = document.querySelector("#closingProductSummary");
const scanCodeDialog = document.querySelector("#scanCodeDialog");
const scanCodeInputValue = document.querySelector("#scanCodeInputValue");
const scanCodePad = document.querySelector("#scanCodePad");
const scanCodeApply = document.querySelector("#scanCodeApply");
const scanCodeCancel = document.querySelector("#scanCodeCancel");
const scanCodeClear = document.querySelector("#scanCodeClear");
const quantityDialog = document.querySelector("#quantityDialog");
const quantityTargetName = document.querySelector("#quantityTargetName");
const quantityInputValue = document.querySelector("#quantityInputValue");
const quantityPad = document.querySelector("#quantityPad");
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
const confirmTotal = document.querySelector("#confirmTotal");
const confirmPayment = document.querySelector("#confirmPayment");
const confirmReceived = document.querySelector("#confirmReceived");
const confirmChange = document.querySelector("#confirmChange");
const confirmReceivedBlock = document.querySelector("#confirmReceivedBlock");
const confirmChangeBlock = document.querySelector("#confirmChangeBlock");
const confirmBack = document.querySelector("#confirmBack");
const confirmClose = document.querySelector("#confirmClose");
const confirmSettle = document.querySelector("#confirmSettle");
const cancelSaleDialog = document.querySelector("#cancelSaleDialog");
const cancelSaleSummary = document.querySelector("#cancelSaleSummary");
const cancelSaleNo = document.querySelector("#cancelSaleNo");
const cancelSalePayment = document.querySelector("#cancelSalePayment");
const cancelSaleTotal = document.querySelector("#cancelSaleTotal");
const cancelSaleStatus = document.querySelector("#cancelSaleStatus");
const cancelSaleNotice = document.querySelector("#cancelSaleNotice");
const cancelSaleBack = document.querySelector("#cancelSaleBack");
const cancelSaleClose = document.querySelector("#cancelSaleClose");
const cancelSaleConfirm = document.querySelector("#cancelSaleConfirm");
const printDialog = document.querySelector("#printDialog");
const printSaleNo = document.querySelector("#printSaleNo");
const printSaleTotal = document.querySelector("#printSaleTotal");
const printSaleMeta = document.querySelector("#printSaleMeta");
const printReceipt = document.querySelector("#printReceipt");
const printInvoice = document.querySelector("#printInvoice");
const printClose = document.querySelector("#printClose");
const printOutput = document.querySelector("#printOutput");
const toast = document.querySelector("#toast");
const clock = document.querySelector("#clock");
const openingAlert = document.querySelector("#openingAlert");
const weatherButton = document.querySelector("#weatherButton");
const weatherMenu = document.querySelector("#weatherMenu");

function yen(value) {
  return yenFormatter.format(value);
}

function productPrice(product) {
  if (product.tax === "exempt") {
    return product.price;
  }
  if (product.tax === "food" && state.serviceMode === "eatin") {
    return Math.round(product.price * 1.02);
  }
  return product.price;
}

function productTaxRate(product) {
  if (product.tax === "exempt") {
    return "exempt";
  }
  return product.tax === "food" && state.serviceMode === "takeout" ? 8 : 10;
}

function taxLabel(rate) {
  return rate === "exempt" ? "非課税" : `${rate}%`;
}

function confirmTaxLabel(rate) {
  return rate === "exempt" ? "（税）非課税" : `（税）${rate}％`;
}

function formatReceiptNo(number) {
  return `No.${REGISTER_NUMBER}${String(number).padStart(5, "0")}`;
}

function timeLabel(date = new Date()) {
  return new Intl.DateTimeFormat("ja-JP", { hour: "2-digit", minute: "2-digit" }).format(date);
}

function cartRows() {
  return state.cart
    .map((item) => {
      const product = productsById.get(item.id);
      const price = productPrice(product);
      return {
        ...product,
        quantity: item.quantity,
        unitPrice: price,
        taxRate: productTaxRate(product),
        lineTotal: price * item.quantity,
      };
    })
    .filter((row) => row.quantity > 0);
}

function totals() {
  return cartRows().reduce(
    (acc, row) => {
      acc.items += row.quantity;
      acc.amount += row.lineTotal;
      if (row.taxRate === 8) {
        acc.reduced += row.lineTotal;
      } else if (row.taxRate === 10) {
        acc.standard += row.lineTotal;
      } else {
        acc.exempt += row.lineTotal;
      }
      return acc;
    },
    { items: 0, amount: 0, reduced: 0, standard: 0, exempt: 0 },
  );
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
      acc.items += record.items;
      acc.reduced += record.tax?.reduced || 0;
      acc.standard += record.tax?.standard || 0;
      acc.exempt += record.tax?.exempt || 0;
      if (record.payment === "現金") {
        acc.cash += record.amount;
      } else if (record.payment === "クレジット") {
        acc.credit += record.amount;
      } else if (record.payment === "電子マネー") {
        acc.emoney += record.amount;
      }
      return acc;
    },
    { amount: 0, items: 0, cash: 0, credit: 0, emoney: 0, reduced: 0, standard: 0, exempt: 0 },
  );
}

function productSalesRows() {
  const totalsByProduct = new Map(products.map((product) => [product.id, { ...product, quantity: 0, amount: 0 }]));
  activeSales().forEach((record) => {
    (record.rows || []).forEach((row) => {
      const current = totalsByProduct.get(row.id);
      if (!current) return;
      current.quantity += row.quantity;
      current.amount += row.lineTotal;
    });
  });
  return [...totalsByProduct.values()].filter((row) => row.quantity > 0);
}

function snapshot() {
  return JSON.stringify({
    cart: state.cart.map((item) => ({ ...item })),
    cashReceived: state.cashReceived,
    payment: state.payment,
    cashlessMethod: state.cashlessMethod,
    cashlessApproved: state.cashlessApproved,
    serviceMode: state.serviceMode,
  });
}

function restoreSnapshot(saved) {
  state.cart = saved.cart || [];
  state.cashReceived = saved.cashReceived || 0;
  state.payment = saved.payment || "cash";
  state.cashlessMethod = saved.cashlessMethod || "クレジット";
  state.cashlessApproved = Boolean(saved.cashlessApproved);
  state.serviceMode = saved.serviceMode || "takeout";
}

function pushUndo() {
  state.undoStack.push(snapshot());
  if (state.undoStack.length > 30) {
    state.undoStack.shift();
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove("hidden");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.add("hidden"), 1700);
}

function setScannerStatus(message, type = "normal") {
  scannerStatus.textContent = message;
  scannerStatus.dataset.type = type;
}

function normalizeScanCode(value) {
  return String(value || "")
    .replace(/\D/g, "")
    .slice(0, 13);
}

function syncScanCode(value) {
  state.scanCodeDraft = normalizeScanCode(value);
  barcodeInput.value = state.scanCodeDraft;
  if (!scanCodeDialog.classList.contains("hidden")) {
    renderScanCodeDialog();
  }
}

function renderScanCodeDialog() {
  scanCodeInputValue.textContent = state.scanCodeDraft || "0";
}

function openScanCodePad() {
  syncScanCode(barcodeInput.value);
  renderScanCodeDialog();
  scanCodeDialog.classList.remove("hidden");
  scanCodeApply.focus();
}

function closeScanCodePad() {
  scanCodeDialog.classList.add("hidden");
}

function appendScanCodeDigit(digit) {
  syncScanCode(`${state.scanCodeDraft}${digit}`);
}

function backspaceScanCodeDigit() {
  syncScanCode(state.scanCodeDraft.slice(0, -1));
}

function clearScanCode() {
  syncScanCode("");
}

function applyScanCodeDraft() {
  if (!state.scanCodeDraft) {
    showToast("コードが入力されていません");
    return;
  }
  closeScanCodePad();
  addScannedProduct();
}

function hasOpenInputDialog() {
  return [quantityDialog, cashCountDialog, confirmDialog, cancelSaleDialog, printDialog].some(
    (dialog) => !dialog.classList.contains("hidden"),
  );
}

function handleScanKeyboard(event) {
  if (event.ctrlKey || event.altKey || event.metaKey) {
    return false;
  }
  const scanDialogOpen = !scanCodeDialog.classList.contains("hidden");
  if (scanDialogOpen) {
    if (/^\d$/.test(event.key)) {
      event.preventDefault();
      appendScanCodeDigit(event.key);
      return true;
    }
    if (event.key === "Backspace") {
      event.preventDefault();
      backspaceScanCodeDigit();
      return true;
    }
    if (event.key === "Enter" || event.key === "Tab") {
      event.preventDefault();
      applyScanCodeDraft();
      return true;
    }
    return false;
  }
  if (hasOpenInputDialog()) {
    return false;
  }
  if (/^\d$/.test(event.key)) {
    event.preventDefault();
    appendScanCodeDigit(event.key);
    return true;
  }
  if (event.key === "Backspace" && state.scanCodeDraft) {
    event.preventDefault();
    backspaceScanCodeDigit();
    return true;
  }
  if ((event.key === "Enter" || event.key === "Tab") && state.scanCodeDraft) {
    event.preventDefault();
    addScannedProduct();
    return true;
  }
  return false;
}

function addProduct(product, source = "商品") {
  if (!product) return;
  pushUndo();
  const existing = state.cart.find((item) => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    state.cart.unshift({ id: product.id, quantity: 1 });
  }
  state.cashlessApproved = false;
  setScannerStatus(`${source}登録：${product.name}`, "success");
  clearScanCode();
  render();
  barcodeInput.focus();
}

function findScannedProduct(value) {
  const normalized = value.trim();
  return productsByBarcode.get(normalized) || productsByCode.get(normalized) || null;
}

function addScannedProduct() {
  syncScanCode(barcodeInput.value || state.scanCodeDraft);
  const rawValue = state.scanCodeDraft;
  const product = findScannedProduct(rawValue);
  if (!rawValue) {
    setScannerStatus("コード未入力", "error");
    showToast("コードが入力されていません");
    return;
  }
  if (!product) {
    setScannerStatus("商品が見つかりません", "error");
    showToast("商品が見つかりません");
    return;
  }
  addProduct(product, rawValue.length === 4 ? "短縮コード" : "バーコード");
}

function setQuantity(id, quantity) {
  pushUndo();
  if (quantity <= 0) {
    state.cart = state.cart.filter((item) => item.id !== id);
  } else {
    const existing = state.cart.find((item) => item.id === id);
    if (existing) {
      existing.quantity = quantity;
    }
  }
  state.cashlessApproved = false;
  render();
}

function openQuantityPad(id) {
  const cartItem = state.cart.find((item) => item.id === id);
  if (!cartItem) {
    return;
  }
  state.quantityEditingId = id;
  state.quantityDraft = String(cartItem.quantity || 0);
  renderQuantityDialog();
  quantityDialog.classList.remove("hidden");
  quantityApply.focus();
}

function closeQuantityPad() {
  state.quantityEditingId = null;
  state.quantityDraft = "0";
  quantityDialog.classList.add("hidden");
}

function renderQuantityDialog() {
  const product = productsById.get(state.quantityEditingId);
  quantityTargetName.textContent = product ? product.name : "商品";
  quantityInputValue.textContent = state.quantityDraft || "0";
}

function appendQuantityDigit(digit) {
  const base = state.quantityDraft === "0" ? "" : state.quantityDraft;
  const next = `${base}${digit}`.replace(/^0+(?=\d)/, "").slice(0, 3);
  state.quantityDraft = next || "0";
  renderQuantityDialog();
}

function backspaceQuantityDigit() {
  state.quantityDraft = state.quantityDraft.length > 1 ? state.quantityDraft.slice(0, -1) : "0";
  renderQuantityDialog();
}

function applyQuantityDraft() {
  const id = state.quantityEditingId;
  if (!id) {
    return;
  }
  const current = state.cart.find((item) => item.id === id)?.quantity || 0;
  const next = Math.max(0, Math.min(999, Number(state.quantityDraft) || 0));
  closeQuantityPad();
  if (next !== current) {
    setQuantity(id, next);
  }
}

function clearCart() {
  if (state.cart.length === 0 && state.cashReceived === 0) return;
  pushUndo();
  state.cart = [];
  state.cashReceived = 0;
  state.cashlessApproved = false;
  render();
}

function undo() {
  const saved = state.undoStack.pop();
  if (!saved) {
    showToast("取消できる操作がありません");
    return;
  }
  restoreSnapshot(JSON.parse(saved));
  render();
}

function setPayment(payment) {
  if (state.payment === payment) return;
  pushUndo();
  state.payment = payment;
  state.cashlessApproved = false;
  render();
}

function appendCashDigit(value) {
  pushUndo();
  const current = String(state.cashReceived || "");
  const next = Number(`${current}${value}`.slice(0, 7));
  state.cashReceived = Number.isFinite(next) ? next : 0;
  render();
}

function addCash(amount) {
  pushUndo();
  state.cashReceived = Math.min(9999999, state.cashReceived + amount);
  render();
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
    showToast("商品が登録されていません");
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

function openConfirm() {
  if (!validateSettlement()) return;
  renderConfirm();
  confirmDialog.classList.remove("hidden");
}

function closeConfirm() {
  confirmDialog.classList.add("hidden");
}

function renderRowsForDialog(rows) {
  return rows
    .map(
      (row) => `
        <div class="confirm-row">
          <strong class="confirm-row-name">${row.name}</strong>
          <strong class="confirm-line-total">${yen(row.lineTotal)}</strong>
          <span>${yen(row.unitPrice)} × ${row.quantity}</span>
          <span class="confirm-tax-label">${confirmTaxLabel(row.taxRate)}</span>
        </div>
      `,
    )
    .join("");
}

function renderConfirm() {
  const total = totals();
  const isCash = state.payment === "cash";
  confirmSummary.innerHTML = renderRowsForDialog(cartRows());
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
  const record = {
    id: globalThis.crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
    no: formatReceiptNo(state.nextReceiptNo),
    time: new Intl.DateTimeFormat("ja-JP", { hour: "2-digit", minute: "2-digit" }).format(new Date()),
    amount: total.amount,
    items: total.items,
    payment: state.payment === "cash" ? "現金" : state.cashlessMethod,
    staff: staffName,
    weather: state.weather,
    tax: {
      reduced: total.reduced,
      standard: total.standard,
      exempt: total.exempt,
    },
    rows: cartRows().map(({ id, name, unitPrice, quantity, taxRate, lineTotal }) => ({
      id,
      name,
      unitPrice,
      quantity,
      taxRate,
      lineTotal,
    })),
    cancelled: false,
    cancelledAt: null,
  };
  state.nextReceiptNo += 1;
  state.history.unshift(record);
  state.history = state.history.slice(0, 8);
  state.cart = [];
  state.cashReceived = 0;
  state.cashlessApproved = false;
  state.undoStack = [];
  closeConfirm();
  setScannerStatus("バーコード待機中");
  showToast(`${record.no} ${yen(record.amount)} 会計確定`);
  render();
}

function recordPaymentName(record) {
  return record.payment || "未記録";
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

function renderCancelSale(record) {
  cancelSaleSummary.innerHTML = renderRowsForDialog(record.rows || []);
  cancelSaleNo.textContent = record.no || "";
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
  showToast(`${record.no || ""} ${yen(record.amount)} 取消済み`);
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
  printSaleNo.textContent = `${record.no || ""} ${record.time}`.trim();
  printSaleTotal.textContent = yen(record.amount);
  printSaleMeta.textContent = `${recordPaymentName(record)} / ${record.items}点 / 天候:${record.weather || "未記録"} / 担当:${record.staff || "未記録"}`;
  printOutput.classList.add("hidden");
  printOutput.textContent = "";
}

function issuePrint(kind) {
  const record = state.history.find((item) => item.id === state.printTargetId);
  if (!record || record.cancelled) {
    closePrintDialog();
    return;
  }
  const label = kind === "receipt" ? "レシート" : "領収書";
  printOutput.innerHTML = `
    <strong>${label}を出力しました</strong>
    <span>${record.no || ""} / ${recordPaymentName(record)} / ${yen(record.amount)}</span>
  `;
  printOutput.classList.remove("hidden");
  showToast(`${record.no || ""} ${label}発行`);
}

function renderCategories() {
  const rows = cartRows();
  categoryTabs.innerHTML = categories
    .map((category) => {
      const count = rows.filter((row) => row.category === category.id).reduce((sum, row) => sum + row.quantity, 0);
      return `
        <button type="button" class="${category.id === state.activeCategory ? "active" : ""}" data-category="${category.id}">
          <span>${category.label}</span>
          <span class="category-count">${count}点</span>
        </button>
      `;
    })
    .join("");
}

function renderProducts() {
  const category = categories.find((item) => item.id === state.activeCategory) || categories[0];
  activeCategoryLabel.textContent = category.label;
  categoryContextLabel.textContent = category.label;
  productGrid.innerHTML = products
    .filter((product) => product.category === state.activeCategory)
    .map(
      (product) => `
        <button type="button" class="product-card" data-product="${product.id}">
          <span class="product-name">${product.name}</span>
          <strong class="product-price">${yen(productPrice(product))}</strong>
        </button>
      `,
    )
    .join("");
}

function renderServiceMode() {
  serviceMode.querySelectorAll("[data-service]").forEach((button) => {
    const active = button.dataset.service === state.serviceMode;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });
  serviceNote.textContent =
    state.serviceMode === "takeout" ? "食品は軽減税率 8% で計算" : "食品も標準税率 10% で計算";
}

function renderCart() {
  const rows = cartRows();
  cartList.innerHTML =
    rows.length === 0
      ? `<div class="empty-state">商品未登録</div>`
      : rows
          .map(
            (row) => `
              <div class="cart-row">
                <strong class="cart-name">${row.name}</strong>
                <span class="cart-meta">${row.code} / ${taxLabel(row.taxRate)}</span>
                <strong class="cart-line-total">${yen(row.lineTotal)}</strong>
                <div class="cart-controls">
                  <button type="button" class="minus" data-cart-minus="${row.id}">−</button>
                  <button type="button" class="quantity-pill" data-cart-quantity="${row.id}" aria-label="${row.name}の数量を入力">${row.quantity}</button>
                  <button type="button" class="plus" data-cart-plus="${row.id}">＋</button>
                  <button type="button" class="remove-item" data-cart-remove="${row.id}">削除</button>
                </div>
              </div>
            `,
          )
          .join("");
  const total = totals();
  cartCount.textContent = `${total.items}点`;
  itemTotal.textContent = String(total.items);
  taxSummary.innerHTML = `
    <div><span>8%</span><strong>${yen(total.reduced)}</strong></div>
    <div><span>10%</span><strong>${yen(total.standard)}</strong></div>
    <div><span>非課税</span><strong>${yen(total.exempt)}</strong></div>
  `;
  grandTotal.textContent = yen(total.amount);
}

function renderPayment() {
  const total = totals();
  paymentTabs.querySelectorAll("[data-payment]").forEach((button) => {
    const active = button.dataset.payment === state.payment;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });
  paymentModeLabel.textContent = state.payment === "cash" ? "現金" : "キャッシュレス";
  cashPanel.classList.toggle("hidden", state.payment !== "cash");
  cashlessPanel.classList.toggle("hidden", state.payment !== "cashless");
  cashReceived.textContent = yen(state.cashReceived);
  changeAmount.textContent = yen(Math.max(0, state.cashReceived - total.amount));
  cashlessTotal.textContent = yen(total.amount);
  cashlessStatus.textContent = state.cashlessApproved ? `${state.cashlessMethod} 承認済み` : "未処理";
  cashlessMethods.querySelectorAll("[data-cashless]").forEach((button) => {
    button.classList.toggle("active", button.dataset.cashless === state.cashlessMethod);
  });
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
                <strong>${record.no} ${record.time} ${record.payment}</strong>
                <strong class="history-total">${yen(record.amount)}</strong>
                <button type="button" class="history-print" data-print-sale="${record.id}" ${record.cancelled ? "disabled" : ""}>印刷</button>
                <button type="button" class="history-cancel" data-cancel-sale="${record.id}" ${record.cancelled ? "disabled" : ""}>取消</button>
                <span class="history-meta">${record.items}点 / ${record.weather || "未記録"} / 担当：${record.staff}</span>
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

function renderOpeningAlert() {
  openingAlert.classList.toggle("hidden", Boolean(state.openingRegisteredAt));
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
  closingItemTotal.textContent = `${sales.items}点`;
  cashSalesBreakdown.textContent = yen(sales.cash);
  creditSalesTotal.textContent = yen(sales.credit);
  emoneySalesTotal.textContent = yen(sales.emoney);
  grossSalesTotal.textContent = yen(sales.amount);
  openingSavedAt.textContent = state.openingRegisteredAt ? `登録 ${state.openingRegisteredAt}` : "未登録";
  closingSavedAt.textContent = state.closingRegisteredAt ? `登録 ${state.closingRegisteredAt}` : "未登録";
  renderOpeningAlert();
}

function renderClosingTaxSummary() {
  const sales = salesSummary();
  closingTaxSummary.innerHTML = `
    <div><span>8%</span><strong>${yen(sales.reduced)}</strong></div>
    <div><span>10%</span><strong>${yen(sales.standard)}</strong></div>
    <div><span>非課税</span><strong>${yen(sales.exempt)}</strong></div>
  `;
}

function renderClosingProductSummary() {
  const rows = productSalesRows();
  closingProductSummary.innerHTML =
    rows.length === 0
      ? `<div class="empty-state">売上なし</div>`
      : rows
          .map(
            (row) => `
              <div class="product-sales-row">
                <strong>${row.name}</strong>
                <span>${row.code}</span>
                <strong>${row.quantity}点</strong>
                <strong>${yen(row.amount)}</strong>
              </div>
            `,
          )
          .join("");
}

function renderClosing() {
  renderCashCountRows("opening", openingCashRows);
  renderCashCountRows("closing", closingCashRows);
  renderClosingTotals();
  renderClosingTaxSummary();
  renderClosingProductSummary();
}

function render() {
  renderCategories();
  renderProducts();
  renderServiceMode();
  renderCart();
  renderPayment();
  renderHistory();
  renderWeather();
  renderOpeningAlert();
  if (state.screen === "closing") {
    renderClosing();
  }
}

function showClosingScreen() {
  state.screen = "closing";
  registerScreen.classList.add("hidden");
  closingScreen.classList.remove("hidden");
  closeConfirm();
  closeCancelSale();
  closePrintDialog();
  closeScanCodePad();
  closeQuantityPad();
  closeCashCountPad();
  renderClosing();
}

function showRegisterScreen() {
  state.screen = "register";
  closingScreen.classList.add("hidden");
  registerScreen.classList.remove("hidden");
  closeScanCodePad();
  closeQuantityPad();
  closeCashCountPad();
  closeCancelSale();
  closePrintDialog();
  render();
}

categoryTabs.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  state.activeCategory = button.dataset.category;
  render();
});

productGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-product]");
  if (!button) return;
  addProduct(productsById.get(button.dataset.product), "分類選択");
});

addBarcodeButton.addEventListener("click", addScannedProduct);
barcodeInput.addEventListener("click", openScanCodePad);

serviceMode.addEventListener("click", (event) => {
  const button = event.target.closest("[data-service]");
  if (!button || state.serviceMode === button.dataset.service) return;
  pushUndo();
  state.serviceMode = button.dataset.service;
  state.cashlessApproved = false;
  render();
});

cartList.addEventListener("click", (event) => {
  const minus = event.target.closest("[data-cart-minus]");
  if (minus) {
    const item = state.cart.find((row) => row.id === minus.dataset.cartMinus);
    setQuantity(minus.dataset.cartMinus, (item?.quantity || 0) - 1);
    return;
  }
  const plus = event.target.closest("[data-cart-plus]");
  if (plus) {
    const item = state.cart.find((row) => row.id === plus.dataset.cartPlus);
    setQuantity(plus.dataset.cartPlus, (item?.quantity || 0) + 1);
    return;
  }
  const quantity = event.target.closest("[data-cart-quantity]");
  if (quantity) {
    openQuantityPad(quantity.dataset.cartQuantity);
    return;
  }
  const remove = event.target.closest("[data-cart-remove]");
  if (remove) {
    setQuantity(remove.dataset.cartRemove, 0);
  }
});

document.querySelector("#undoButton").addEventListener("click", undo);
document.querySelector("#clearCart").addEventListener("click", clearCart);
openClosing.addEventListener("click", showClosingScreen);
backRegister.addEventListener("click", showRegisterScreen);

weatherButton.addEventListener("click", () => {
  const isOpen = !weatherMenu.classList.contains("hidden");
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

document.querySelector(".ticket-actions").addEventListener("click", (event) => {
  const button = event.target.closest("[data-ticket-action]");
  if (!button) return;
  showToast(`${button.textContent} のイメージです`);
});

historyList.addEventListener("click", (event) => {
  const printButton = event.target.closest("[data-print-sale]");
  if (printButton) {
    openPrintDialog(printButton.dataset.printSale);
    return;
  }
  const cancelButton = event.target.closest("[data-cancel-sale]");
  if (cancelButton) {
    openCancelSale(cancelButton.dataset.cancelSale);
  }
});

paymentTabs.addEventListener("click", (event) => {
  const button = event.target.closest("[data-payment]");
  if (!button) return;
  setPayment(button.dataset.payment);
});

document.querySelector(".quick-money").addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.dataset.cash === "exact") {
    pushUndo();
    state.cashReceived = totals().amount;
    render();
  }
  if (button.dataset.cashAdd) {
    addCash(Number(button.dataset.cashAdd));
  }
});

document.querySelector("#moneyPad").addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.dataset.action === "clearCash") {
    pushUndo();
    state.cashReceived = 0;
    render();
    return;
  }
  if (button.dataset.digit) {
    appendCashDigit(button.dataset.digit);
  }
});

cashlessMethods.addEventListener("click", (event) => {
  const button = event.target.closest("[data-cashless]");
  if (!button) return;
  state.cashlessMethod = button.dataset.cashless;
  state.cashlessApproved = false;
  render();
});

approveCashless.addEventListener("click", () => {
  if (totals().items === 0) {
    showToast("商品が登録されていません");
    return;
  }
  state.cashlessApproved = true;
  state.payment = "cashless";
  openConfirm();
  render();
});

settleButton.addEventListener("click", openConfirm);

scanCodePad.addEventListener("click", (event) => {
  const digit = event.target.closest("[data-scan-code-digit]");
  if (digit) {
    appendScanCodeDigit(digit.dataset.scanCodeDigit);
    return;
  }
  const action = event.target.closest("[data-scan-code-action]");
  if (!action) return;
  if (action.dataset.scanCodeAction === "clear") {
    clearScanCode();
  }
  if (action.dataset.scanCodeAction === "back") {
    backspaceScanCodeDigit();
  }
});

scanCodeApply.addEventListener("click", applyScanCodeDraft);
scanCodeCancel.addEventListener("click", closeScanCodePad);
scanCodeClear.addEventListener("click", clearScanCode);
scanCodeDialog.addEventListener("click", (event) => {
  if (event.target === scanCodeDialog) {
    closeScanCodePad();
  }
});

quantityPad.addEventListener("click", (event) => {
  const digit = event.target.closest("[data-quantity-digit]");
  if (digit) {
    appendQuantityDigit(digit.dataset.quantityDigit);
    return;
  }
  const action = event.target.closest("[data-quantity-action]");
  if (!action) return;
  if (action.dataset.quantityAction === "clear") {
    state.quantityDraft = "0";
    renderQuantityDialog();
  }
  if (action.dataset.quantityAction === "back") {
    backspaceQuantityDigit();
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

confirmBack.addEventListener("click", closeConfirm);
confirmClose.addEventListener("click", closeConfirm);
confirmSettle.addEventListener("click", finalizeSettlement);
confirmDialog.addEventListener("click", (event) => {
  if (event.target === confirmDialog) {
    closeConfirm();
  }
});

cancelSaleBack.addEventListener("click", closeCancelSale);
cancelSaleClose.addEventListener("click", closeCancelSale);
cancelSaleConfirm.addEventListener("click", finalizeCancelSale);
cancelSaleDialog.addEventListener("click", (event) => {
  if (event.target === cancelSaleDialog) {
    closeCancelSale();
  }
});

printReceipt.addEventListener("click", () => issuePrint("receipt"));
printInvoice.addEventListener("click", () => issuePrint("invoice"));
printClose.addEventListener("click", closePrintDialog);
printDialog.addEventListener("click", (event) => {
  if (event.target === printDialog) {
    closePrintDialog();
  }
});

document.addEventListener("click", (event) => {
  if (event.target.closest(".weather-selector")) {
    return;
  }
  weatherMenu.classList.add("hidden");
  weatherButton.setAttribute("aria-expanded", "false");
});

document.addEventListener("keydown", (event) => {
  if (handleScanKeyboard(event)) {
    return;
  }
  if (event.key === "Escape") {
    closeScanCodePad();
    closeQuantityPad();
    closeCashCountPad();
    closeConfirm();
    closeCancelSale();
    closePrintDialog();
    weatherMenu.classList.add("hidden");
    weatherButton.setAttribute("aria-expanded", "false");
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

updateClock();
setInterval(updateClock, 1000 * 30);
render();
barcodeInput.focus();

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  navigator.serviceWorker.register("./service-worker.js").catch(() => {});
}
