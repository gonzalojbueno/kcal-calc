// =======================
// LOGIN SIMPLE (SIMULADO)
// =======================

const USERS = [
  { username: "gonzalo", password: "1234" }
];

function login() {
  const user = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value.trim();

  const found = USERS.find(u => u.username === user && u.password === pass);

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
// DATA LOCAL (TEMPORAL)
// =======================

let registros = [];

// =======================
// AGREGAR ALIMENTO
// =======================

function addFood() {
  const food = document.getElementById("food").value.trim();
  const kcal100 = parseFloat(document.getElementById("kcal100").value);
  const grams = parseFloat(document.getElementById("grams").value);

  // VALIDACIÓN
  if (!food || isNaN(kcal100) || isNaN(grams)) {
    alert("Completa todos los campos correctamente");
    return;
  }

  const kcal = (grams * kcal100) / 100;

  registros.push({
    food,
    kcal,
    grams
  });

  render();
  clearInputs();
}

// =======================
// LIMPIAR INPUTS
// =======================

function clearInputs() {
  document.getElementById("food").value = "";
  document.getElementById("kcal100").value = "";
  document.getElementById("grams").value = "";
}

// =======================
// ELIMINAR ITEM
// =======================

function deleteItem(index) {
  registros.splice(index, 1);
  render();
}

// =======================
// RENDER LISTA + TOTAL
// =======================

function render() {
  const list = document.getElementById("list");
  const totalDiv = document.getElementById("total");

  list.innerHTML = "";

  let total = 0;

  registros.forEach((r, index) => {
    total += r.kcal;

    list.innerHTML += `
      <div class="item">
        <div>
          <strong>${r.food}</strong><br/>
          ${r.grams}g - ${r.kcal.toFixed(1)} kcal
        </div>

        <button class="deleteBtn" onclick="deleteItem(${index})">❌</button>
      </div>
    `;
  });

  totalDiv.innerText = total.toFixed(1) + " kcal";
}

// =======================
// AUTO LOGIN (SESSION)
// =======================

window.addEventListener("load", () => {
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