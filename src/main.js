import { Damaged } from "./Damaged.js";

window.addEventListener("DOMContentLoaded", () => main());

function main() {
  const storageInput = document.getElementById("storage-input");
  const damagedInput = document.getElementById("damaged-input");
  const btnAnalysis = document.getElementById("btn-analysis");
  const table = document.getElementById("table-damaged");

  const damaged = new Damaged(table);

  storageInput.addEventListener("input", (e) => {
    const file = e.target.files[0];
    damaged.clearStorage();
    damaged.storageReader(file);

    e.target.value = null;
  });

  damagedInput.addEventListener("input", (e) => {
    const file = e.target.files[0];
    damaged.clearDamaged();
    damaged.damagedReader(file);

    e.target.value = null;
  });

  btnAnalysis.addEventListener("click", () => {
    damaged.fillTable();

    document.getElementById("damaged-goods").hidden = false;
  });
}
