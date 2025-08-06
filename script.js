
const container = document.getElementById("section-container");
const modal = document.getElementById("modal");
const modalForm = document.getElementById("modal-form");
const modalTitle = document.getElementById("modal-title");
const themeToggle = document.getElementById("theme-toggle");
const addSectionBtn = document.getElementById("add-section");
const cancelBtn = document.getElementById("cancel");
const totalDisplay = document.getElementById("total");

let data = JSON.parse(localStorage.getItem("budgetData")) || [];

let modalMode = null;
let modalContext = null;

const save = () => {
  localStorage.setItem("budgetData", JSON.stringify(data));
};

const parsePrice = (min, max) => {
  const minVal = parseFloat(min);
  const maxVal = max ? parseFloat(max) : minVal;
  return [isNaN(minVal) ? 0 : minVal, isNaN(maxVal) ? minVal : maxVal];
};

const calcTotals = (items) => {
  return items.reduce((acc, item) => {
    const [min, max] = parsePrice(item.min, item.max);
    acc[0] += min;
    acc[1] += max;
    return acc;
  }, [0, 0]);
};

const formatRange = (min, max) => {
  return min === max ? `$${min.toFixed(2)}` : `$${min.toFixed(2)} – $${max.toFixed(2)}`;
};

const openModal = (mode, context = null) => {
  modalMode = mode;
  modalContext = context;
  modal.classList.remove("hidden");
  modalForm.reset();
  document.getElementById("modal-title").textContent = `Add ${mode}`;
};

cancelBtn.onclick = () => {
  modal.classList.add("hidden");
};

modalForm.onsubmit = (e) => {
  e.preventDefault();
  const name = document.getElementById("modal-name").value.trim();
  const description = document.getElementById("modal-description").value.trim();
  const link = document.getElementById("modal-link").value.trim();
  const min = document.getElementById("modal-min").value.trim();
  const max = document.getElementById("modal-max").value.trim();

  if (!name) return;

  const item = { name, description, link, min, max };

  if (modalMode === "Section") {
    data.push({ name, subsections: [] });
  } else if (modalMode === "Subsection") {
    data[modalContext].subsections.push({ name, items: [] });
  } else if (modalMode === "Item") {
    const [sectionIdx, subsectionIdx] = modalContext;
    data[sectionIdx].subsections[subsectionIdx].items.push(item);
  }

  save();
  render();
  modal.classList.add("hidden");
};

const render = () => {
  container.innerHTML = "";
  let grandMin = 0, grandMax = 0;

  if (data.length === 0) {
    container.innerHTML = '<p class="no-data">No data yet. Tap “+ Section” to begin.</p>';
    totalDisplay.textContent = "$0.00 – $0.00";
    return;
  }

  data.forEach((section, sIdx) => {
    const sectionDiv = document.createElement("div");
    sectionDiv.className = "section";

    const sectionHeader = document.createElement("h2");
    sectionHeader.textContent = section.name;
    sectionHeader.onclick = () => sectionDiv.classList.toggle("collapsed");

    let sectionMin = 0, sectionMax = 0;
    const subDiv = document.createElement("div");

    section.subsections.forEach((sub, subIdx) => {
      const subsectionDiv = document.createElement("div");
      subsectionDiv.className = "subsection";

      const subsectionHeader = document.createElement("h3");
      subsectionHeader.textContent = sub.name;
      subsectionHeader.onclick = () => subsectionDiv.classList.toggle("collapsed");

      const itemList = document.createElement("ul");
      let subMin = 0, subMax = 0;

      sub.items.forEach(item => {
        const [min, max] = parsePrice(item.min, item.max);
        subMin += min;
        subMax += max;

        const li = document.createElement("li");
        li.className = "item";
        const link = item.link ? `<a href="${item.link}" target="_blank">🔗</a>` : "";
        li.innerHTML = `${item.name}: <strong>${formatRange(min, max)}</strong> ${link}`;
        itemList.appendChild(li);
      });

      sectionMin += subMin;
      sectionMax += subMax;

      const totalLabel = document.createElement("div");
      totalLabel.innerHTML = `<em>Total: ${formatRange(subMin, subMax)}</em>`;

      subsectionDiv.appendChild(subsectionHeader);
      subsectionDiv.appendChild(itemList);
      subsectionDiv.appendChild(totalLabel);
      subsectionDiv.appendChild(addButton("Item", () => openModal("Item", [sIdx, subIdx])));
      subDiv.appendChild(subsectionDiv);
    });

    grandMin += sectionMin;
    grandMax += sectionMax;

    const sectionTotal = document.createElement("div");
    sectionTotal.innerHTML = `<strong>Subtotal: ${formatRange(sectionMin, sectionMax)}</strong>`;
    sectionTotal.style.marginBottom = "1em";

    sectionDiv.appendChild(sectionHeader);
    sectionDiv.appendChild(subDiv);
    sectionDiv.appendChild(sectionTotal);
    sectionDiv.appendChild(addButton("Subsection", () => openModal("Subsection", sIdx)));
    container.appendChild(sectionDiv);
  });

  totalDisplay.textContent = formatRange(grandMin, grandMax);
};

const addButton = (label, action) => {
  const btn = document.createElement("button");
  btn.textContent = `+ ${label}`;
  btn.onclick = action;
  return btn;
};

addSectionBtn.onclick = () => openModal("Section");

themeToggle.onclick = () => {
  const theme = document.documentElement.getAttribute("data-theme");
  const newTheme = theme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
};

window.onload = () => {
  const storedTheme = localStorage.getItem("theme");
  if (storedTheme) {
    document.documentElement.setAttribute("data-theme", storedTheme);
  } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    document.documentElement.setAttribute("data-theme", "dark");
  }
  render();
};
