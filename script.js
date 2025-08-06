
const container = document.getElementById("section-container");
const modal = document.getElementById("modal");
const modalForm = document.getElementById("modal-form");
const modalTitle = document.getElementById("modal-title");
const themeToggle = document.getElementById("theme-toggle");
const addSectionBtn = document.getElementById("add-section");
const cancelBtn = document.getElementById("cancel");
const totalDisplay = document.getElementById("total");

let sections = JSON.parse(localStorage.getItem("budgetSections")) || [];

const openModal = (title, onSubmit) => {
  modal.classList.remove("hidden");
  modalTitle.textContent = title;
  modalForm.onsubmit = (e) => {
    e.preventDefault();
    const data = {
      name: document.getElementById("name").value,
      description: document.getElementById("description").value,
      link: document.getElementById("link").value,
      min: parseFloat(document.getElementById("min").value),
      max: parseFloat(document.getElementById("max").value || document.getElementById("min").value)
    };
    onSubmit(data);
    modal.classList.add("hidden");
    modalForm.reset();
  };
};

cancelBtn.onclick = () => {
  modal.classList.add("hidden");
  modalForm.reset();
};

const render = () => {
  container.innerHTML = "";
  let grandTotal = 0;

  if (sections.length === 0) {
    container.innerHTML = '<p class="no-data">No sections yet. Tap “Add Section” to begin.</p>';
    totalDisplay.textContent = "$0.00";
    return;
  }

  sections.forEach(section => {
    const div = document.createElement("div");
    const total = section.items.reduce((sum, item) => sum + item.max, 0);
    grandTotal += total;
    div.innerHTML = `<h2>${section.name} — <span style="color: var(--sub)">$${total.toFixed(2)}</span></h2>`;
    section.items.forEach(item => {
      const linkHTML = item.link ? `<a href="${item.link}" target="_blank">🔗</a>` : "";
      const range = item.min !== item.max ? `$${item.min.toFixed(2)} - $${item.max.toFixed(2)}` : `$${item.min.toFixed(2)}`;
      div.innerHTML += `<p>• ${item.name}: <strong>${range}</strong> ${linkHTML}</p>`;
    });
    container.appendChild(div);
  });

  totalDisplay.textContent = `$${grandTotal.toFixed(2)}`;
};

addSectionBtn.onclick = () => {
  openModal("Add Section", (data) => {
    sections.push({ name: data.name, items: [data] });
    localStorage.setItem("budgetSections", JSON.stringify(sections));
    render();
  });
};

themeToggle.onclick = () => {
  const theme = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
};

window.onload = () => {
  const theme = localStorage.getItem("theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", theme);
  render();
};
