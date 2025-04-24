export class Damaged {
  #storageMap;
  #damagedMap;
  #reportList;

  #table;
  #status;

  constructor(table, status) {
    this.#storageMap = new Map();
    this.#damagedMap = new Map();
    this.#table = table;
    this.#status = status;
  }

  storageReader(file) {
    if (!file) return;

    this.#readFile(file)
      .then((res) => this.#readStorageLines(res))
      .then(() => console.info("storage was read."))
      .catch((err) => console.error(err));
  }

  #readStorageLines(data) {
    const rawLines = data.split(/\r?\n/);

    rawLines.forEach((line) => {
      const parsedLine = line.split(/\t/);

      const order = this.#parseNumber(parsedLine[0]);
      const id = parsedLine[1];
      const description = parsedLine[2];
      const quantity = this.#parseNumber(parsedLine[3]);

      if (!isNaN(order) && id && description && !isNaN(quantity)) {
        this.#storageMap.set(id, { description, quantity });
      }
    });
  }

  damagedReader(file) {
    if (!file) return;

    this.#readFile(file)
      .then((res) => this.#readDamagedLines(res))
      .then(() => console.info("damaged was read"))
      .catch((err) => console.error(err));
  }

  #readDamagedLines(data) {
    const rawLines = data.split(/\r?\n/);

    rawLines.forEach((line) => {
      const parsedLine = line.trim().split(/\s{2,}/);

      const id = parsedLine[0];
      const description = parsedLine[1];
      const quantity = this.#parseNumber(parsedLine[2]);

      if (id && description && !isNaN(quantity)) {
        this.#damagedMap.set(id, { description, quantity });
      }
    });
  }

  #readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.addEventListener("load", (e) => resolve(e.target.result));

      reader.addEventListener("error", () => reject("error reading file"));

      reader.readAsText(file);
    });
  }

  #parseNumber(value) {
    const data = typeof value === "string" ? value.replace(".", "") : "";
    return Number.parseInt(data);
  }

  #addRow(table, item) {
    const row = document.createElement("tr");
    row.className = item.status;

    const idCell = document.createElement("td");
    idCell.textContent = item.id;
    row.appendChild(idCell);

    const descriptionCell = document.createElement("td");
    descriptionCell.textContent = item.description;
    row.appendChild(descriptionCell);

    const storageQuantityCell = document.createElement("td");
    storageQuantityCell.textContent = item.storageQuantity ?? "N/D";
    row.appendChild(storageQuantityCell);

    const damagedQuantityCell = document.createElement("td");
    damagedQuantityCell.textContent = item.quantity;
    row.appendChild(damagedQuantityCell);

    const quantityToRemoveCell = document.createElement("td");
    quantityToRemoveCell.textContent = item.difference ?? "N/D";
    row.appendChild(quantityToRemoveCell);

    table.appendChild(row);
  }

  #damagedHasStock(item) {
    const { id, description, quantity } = item;

    if (!this.#storageMap.has(id)) {
      return { id, description, quantity, status: "remove" };
    }

    if (this.#storageMap.has(id)) {
      const storageItem = this.#storageMap.get(id);
      const difference = storageItem.quantity - quantity;

      if (difference < 0) {
        return {
          id,
          description,
          quantity,
          storageQuantity: storageItem.quantity,
          difference,
          status: "edit",
        };
      }
    }

    return null;
  }

  #generateReport() {
    this.#reportList = new Array(this.#damagedMap.size);
    let counter = 0;

    for (const damagedItem of this.#damagedMap) {
      const id = damagedItem[0];
      const description = damagedItem[1].description;
      const quantity = damagedItem[1].quantity;

      const item = this.#damagedHasStock({ id, description, quantity });
      if (item) {
        this.#reportList[counter] = item;
        counter++;
      }
    }

    return counter;
  }

  fillTable() {
    this.clearTable();
    const containerAll = this.#status.querySelector("#status-all span");
    const containerToSolve = this.#status.querySelector(
      "#status-to-solve span"
    );

    containerAll.textContent = this.#damagedMap.size;
    containerToSolve.textContent = this.#generateReport();

    this.#reportList.forEach((item) => {
      this.#addRow(this.#table, item);
    });
  }

  clearDamaged() {
    this.#damagedMap.clear();
  }

  clearStorage() {
    this.#storageMap.clear();
  }

  clearTable() {
    this.#table.innerHTML = "";
  }
}
