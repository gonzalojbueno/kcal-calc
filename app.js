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

// =======================
// FORMATEAR FECHA
// =======================

function formatDate(dateString) {
  const [day, month, year] = dateString.split("-");

  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day)
  );

  return date.toLocaleDateString("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

// =======================
// AGREGAR ALIMENTO
// =======================

function addFood() {
  const food = document.getElementById("food").value.trim();
  const kcal100 = parseFloat(document.getElementById("kcal100").value);
  const grams = parseFloat(document.getElementById("grams").value);

  if (!food || isNaN(kcal100) || isNaN(grams)) {
    alert("Completa todos los campos");
    return;
  }

  const kcal = (grams * kcal100) / 100;
  const now = new Date();

  const item = {
    food,
    grams,
    kcal100,
    kcal,
    date: now.toLocaleDateString("es-CL"),
    time: now.toLocaleTimeString("es-CL")
  };

  const exists = foods.find(
    f => f.food.toLowerCase() === food.toLowerCase()
  );

  if (!exists) {
    foods.push({
      food,
      kcal100
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
  const registrosPorFecha = {};

  registros.forEach((r, index) => {
    totalGeneral += r.kcal;

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

    registrosPorFecha[fecha].forEach(r => {
      totalFecha += r.kcal;
    });

    list.innerHTML += `
      <details class="dayGroup" open>
        <summary>
          <i class="bi bi-calendar3"></i>
          ${formatDate(fecha)} — ${totalFecha.toFixed(1)} kcal
        </summary>

        <div class="dayItems">
          ${registrosPorFecha[fecha].map(r => `
            <div class="item">
              <div>
                <strong>${r.food}</strong><br>

                Cantidad: ${r.grams} g<br>

                100 g = ${r.kcal100} kcal<br>

                Consumidas:
                <strong>${r.kcal.toFixed(1)} kcal</strong><br>

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

  totalDiv.innerText = totalGeneral.toFixed(1) + " kcal";
}

// =======================
// RENDER FOODS
// =======================

function renderFoods() {

  const foodList =
    document.getElementById(
      "foodList"
    );

  const suggestions =
    document.getElementById(
      "foodSuggestions"
    );

  const foodsSummary =
    document.getElementById(
      "foodsSummary"
    );

  if (
    !foodList ||
    !suggestions
  ) return;

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
          ${food.kcal100} kcal / 100g
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

  document.getElementById("kcal100").value = found.kcal100;
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

window.addEventListener("load", () => {
  setTodayDate();

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