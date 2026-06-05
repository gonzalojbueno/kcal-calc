// =======================
// LOGIN SIMPLE
// =======================

const USERS = [
  {
    username: "gonzalo",
    password: "1234"
  }
];

function login() {
  const user = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value.trim();

  const found = USERS.find(
    u => u.username === user && u.password === pass
  );

  if (!found) {
    document.getElementById("loginError").innerText = "Login incorrecto";
    return;
  }

  localStorage.setItem("user", user);

  document.getElementById("loginScreen").classList.add("hidden");
  document.getElementById("appScreen").classList.remove("hidden");
}

function logout() {
  localStorage.removeItem("user");
  location.reload();
}

// =======================
// DATA
// =======================

let registros =
  JSON.parse(localStorage.getItem("registros")) || [];

let foods =
  JSON.parse(localStorage.getItem("foods")) || [];

// =======================
// GUARDAR DATA
// =======================

function saveFoods() {
  localStorage.setItem("foods", JSON.stringify(foods));
}

function saveRegistros() {
  localStorage.setItem("registros", JSON.stringify(registros));
}

async function loadDefaultFoods() {

  const hasFoods =
    localStorage.getItem("foods");

  if (hasFoods) {
    return;
  }

  try {

    const response =
      await fetch("foods.json");

    const defaultFoods =
      await response.json();

    foods = defaultFoods;

    saveFoods();

    renderFoods();

  } catch (error) {

    console.error(
      "Error cargando foods.json:",
      error
    );
  }
}

// =======================
// FORMATEAR FECHA
// =======================

function formatDate(dateString) {

  const [day, month, year] =
    dateString.split("-");

  const months = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic"
  ];

  return `${Number(day)} ${months[month - 1]} ${year}`;
}

// =======================
// AGREGAR ALIMENTO
// =======================

function addFood() {
  const food = document.getElementById("food").value.trim();

  const kcal100 = parseFloat(document.getElementById("kcal100").value);
  const protein100 = parseFloat(document.getElementById("protein100").value);
  const carbs100 = parseFloat(document.getElementById("carbs100").value);
  const fiber100 = parseFloat(document.getElementById("fiber100").value);
  const grams = parseFloat(document.getElementById("grams").value);

  if (
    !food ||
    isNaN(kcal100) ||
    isNaN(protein100) ||
    isNaN(carbs100) ||
    isNaN(fiber100) ||
    isNaN(grams)
  ) {
    alert("Completa todos los campos");
    return;
  }

  const kcal = (grams * kcal100) / 100;
  const protein = (grams * protein100) / 100;
  const carbs = (grams * carbs100) / 100;
  const fiber = (grams * fiber100) / 100;

  const now = new Date();

  const item = {
    food,
    grams,
    kcal100,
    protein100,
    carbs100,
    fiber100,
    kcal,
    protein,
    carbs,
    fiber,
    date: now.toLocaleDateString("es-CL"),
    time: now.toLocaleTimeString("es-CL")
  };

  const exists = foods.find(
    f => f.food.toLowerCase() === food.toLowerCase()
  );

  if (!exists) {
    foods.push({
      food,
      kcal100,
      protein100,
      carbs100,
      fiber100
    });

    saveFoods();
    renderFoods();
  }

  registros.push(item);

  saveRegistros();
  render();
  clearInputs();
}

// =======================
// LIMPIAR
// =======================

function clearInputs() {
  document.getElementById("food").value = "";
  document.getElementById("kcal100").value = "";
  document.getElementById("protein100").value = "";
  document.getElementById("carbs100").value = "";
  document.getElementById("fiber100").value = "";
  document.getElementById("grams").value = "";
}

// =======================
// BORRAR REGISTRO
// =======================

function deleteItem(index) {
  registros.splice(index, 1);

  saveRegistros();
  render();
}

// =======================
// RENDER REGISTROS
// =======================

function render() {
  const list = document.getElementById("list");
  const totalDiv = document.getElementById("total");

  list.innerHTML = "";

  let totalGeneral = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFiber = 0;

  const registrosPorFecha = {};

  registros.forEach((r, index) => {
    totalGeneral += r.kcal || 0;
    totalProtein += r.protein || 0;
    totalCarbs += r.carbs || 0;
    totalFiber += r.fiber || 0;

    if (!registrosPorFecha[r.date]) {
      registrosPorFecha[r.date] = [];
    }

    registrosPorFecha[r.date].push({
      ...r,
      originalIndex: index
    });
  });

  const fechas = Object.keys(registrosPorFecha).reverse();

  fechas.forEach(fecha => {
    let totalFecha = 0;
    let proteinFecha = 0;
    let carbsFecha = 0;
    let fiberFecha = 0;

    registrosPorFecha[fecha].forEach(r => {
      totalFecha += r.kcal || 0;
      proteinFecha += r.protein || 0;
      carbsFecha += r.carbs || 0;
      fiberFecha += r.fiber || 0;
    });

    const totalItems = registrosPorFecha[fecha].length;

    list.innerHTML += `
      <details class="dayGroup">
        <summary>
          <i class="bi bi-calendar3"></i>
          ${formatDate(fecha)} —
          ${totalFecha.toFixed(1)} kcal ·
          ${proteinFecha.toFixed(1)} g proteína ·
          ${totalItems} registros
        </summary>

        <div class="dayItems">
          ${registrosPorFecha[fecha].map(r => `
            <div class="item">
              <div>
                <strong>${r.food}</strong><br>

                Cantidad: ${r.grams} g<br>

                Kcal:
                <strong>${(r.kcal || 0).toFixed(1)}</strong><br>

                Proteína:
                <strong>${(r.protein || 0).toFixed(1)} g</strong><br>

                Carbohidratos:
                <strong>${(r.carbs || 0).toFixed(1)} g</strong><br>

                Fibra:
                <strong>${(r.fiber || 0).toFixed(1)} g</strong><br>

                <small>${r.time}</small>
              </div>

              <button
                class="deleteBtn"
                onclick="deleteItem(${r.originalIndex})">
                <i class="bi bi-trash3"></i>
              </button>
            </div>
          `).join("")}
        </div>
      </details>
    `;
  });

  totalDiv.innerHTML = `
    <div>${totalGeneral.toFixed(1)} kcal</div>
    <div class="fs-6 fw-normal">
      Proteína: ${totalProtein.toFixed(1)} g / 160 g<br>
      Restante proteína: ${(160 - totalProtein).toFixed(1)} g<br>
      Carbohidratos: ${totalCarbs.toFixed(1)} g<br>
      Fibra: ${totalFiber.toFixed(1)} g
    </div>
  `;
}

// =======================
// RENDER FOODS
// =======================

function renderFoods() {
  const foodList = document.getElementById("foodList");
  const suggestions = document.getElementById("foodSuggestions");
  const foodsSummary = document.getElementById("foodsSummary");

  if (!foodList || !suggestions) return;

  foodList.innerHTML = "";
  suggestions.innerHTML = "";

  if (foodsSummary) {
    foodsSummary.innerHTML = `
      <i class="bi bi-basket"></i>
      Mis alimentos (${foods.length})
    `;
  }

  foods.forEach((food, index) => {
    suggestions.innerHTML += `
      <option value="${food.food}">
    `;

    foodList.innerHTML += `
      <div class="item">
        <div>
          <strong>${food.food}</strong><br>
          ${food.kcal100 ?? 0} kcal / 100g<br>
          Proteína: ${food.protein100 ?? 0} g<br>
          Carbohidratos: ${food.carbs100 ?? 0} g<br>
          Fibra: ${food.fiber100 ?? 0} g
        </div>

        <button
          class="deleteBtn"
          onclick="deleteFood(${index})">
          <i class="bi bi-trash3"></i>
        </button>
      </div>
    `;
  });
}

// =======================
// BORRAR FOOD
// =======================

function deleteFood(index) {
  const foodName = foods[index].food;

  if (!confirm(`¿Eliminar ${foodName}?`)) {
    return;
  }

  foods.splice(index, 1);

  saveFoods();
  renderFoods();
}

// =======================
// AUTOCOMPLETE
// =======================

function fillFoodData() {
  const foodName = document.getElementById("food").value;

  const found = foods.find(
    f => f.food.toLowerCase() === foodName.toLowerCase()
  );

  if (!found) return;

  document.getElementById("kcal100").value = found.kcal100 ?? "";
  document.getElementById("protein100").value = found.protein100 ?? "";
  document.getElementById("carbs100").value = found.carbs100 ?? "";
  document.getElementById("fiber100").value = found.fiber100 ?? "";
}

// =======================
// FECHA
// =======================

function setTodayDate() {
  const el = document.getElementById("todayDate");

  if (!el) return;

  el.innerText = new Date().toLocaleDateString("es-CL", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

// =======================
// INIT
// =======================

window.addEventListener("load", async () => {
  setTodayDate();

  await loadDefaultFoods();
  render();
  renderFoods();

  document
    .getElementById("food")
    ?.addEventListener("change", fillFoodData);

  const user = localStorage.getItem("user");

  const loginScreen = document.getElementById("loginScreen");
  const appScreen = document.getElementById("appScreen");

  if (!loginScreen || !appScreen) return;

  if (user) {
    loginScreen.classList.add("hidden");
    appScreen.classList.remove("hidden");
  } else {
    loginScreen.classList.remove("hidden");
    appScreen.classList.add("hidden");
  }
});