// Obtém os elementos do DOM pelos IDs
const btnInventory = document.getElementById("arquivoEstoqueAtual");
const btnDamaged = document.getElementById("arquivoAvaria");
const btnReport = document.getElementById("extraiAvaria");

const inventory = new Map(); // Mapa para armazenar o inventário
const damaged = new Map(); // Mapa para armazenar os itens avariados

// Lê o arquivo de inventário (estatistica central)
const inventoryReader = (event) => {
  const file = event.target.files[0];

  if (file) {
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = e.target.result;

      // Divide os dados do arquivo em linhas '\r\n'
      const rawLines = data.split(/\r?\n/);

      rawLines.forEach((line) => {
        const parsedLine = line.trim().split(/\s{2,}/);

        let [id, ...data] = parsedLine[1]
          ? parsedLine[1].split(" ")
          : [undefined, undefined];

        let quantity = parsedLine[2]
          ? Number.parseInt(parsedLine[2].replaceAll(".", ""))
          : undefined;

        let description = data.join(" ");

        if (id && description && quantity > 0) {
          inventory.set(id, { description, quantity });
        }
      });

      statusSet("Estoque Atual carregado!");
    };

    reader.readAsText(file);
  }
};

function statusSet(msg) {
  const boxStatus = document.getElementById("box-status");
  boxStatus.textContent = msg;
  boxStatus.style.opacity = "1";

  setTimeout(function () {
    boxStatus.style.opacity = "0";
  }, 5000);
}

// Lê o arquivo de itens avariados
const damagedReader = (event) => {
  const file = event.target.files[0];

  if (file) {
    damaged.clear();

    const reader = new FileReader();

    reader.onload = (e) => {
      const data = e.target.result;

      // Divide os dados do arquivo em linhas '\r\n'
      const rawLines = data.split(/\r?\n/);

      rawLines.forEach((line) => {
        const parsedLine = line.trim().split(/\s{2,}/);

        const id = parsedLine[0];
        const description = parsedLine[1];

        let quantity = parsedLine[2]
          ? Number.parseInt(parsedLine[2].replaceAll(".", ""))
          : undefined;

        if (id && description && quantity > 0) {
          if (damaged.has(id)) {
            const existingItem = damaged.get(id);
            quantity += existingItem.quantity;
          }

          damaged.set(id, { description, quantity });
        }
      });

      statusSet("Documento de Avaria carregado!");
    };

    reader.readAsText(file);
  }
};

// Adiciona event listeners para os botões de inventário e itens avariados
btnInventory.addEventListener("change", (e) => inventoryReader(e));
btnDamaged.addEventListener("change", (e) => damagedReader(e));

function clearScreen() {
  location.reload();
}

function addRow(
  table,
  codigo,
  descricao,
  estoqueAtual,
  qtdAvariada,
  qtdEditar,
  situation
) {
  const row = document.createElement("tr");
  row.className = situation;

  const codigoCell = document.createElement("td");
  codigoCell.textContent = codigo;
  row.appendChild(codigoCell);

  const descricaoCell = document.createElement("td");
  descricaoCell.textContent = descricao;
  row.appendChild(descricaoCell);

  const estoqueAtualCell = document.createElement("td");
  estoqueAtualCell.textContent = estoqueAtual;
  row.appendChild(estoqueAtualCell);

  const qtdAvariadaCell = document.createElement("td");
  qtdAvariadaCell.textContent = qtdAvariada;
  row.appendChild(qtdAvariadaCell);

  const qtdEditarCell = document.createElement("td");
  qtdEditarCell.textContent = qtdEditar;
  row.appendChild(qtdEditarCell);

  table.appendChild(row);
}

function fillTable() {
  const table = document.getElementById("less");
  const damagedTotalItems = document.getElementById("numberDamagedItems");

  damagedTotalItems.innerHTML = `${damaged.size} Itens Avariados`;
  damagedTotalItems.style.display = "block";

  table.innerHTML = "";

  const paraAlterar = [...damaged];
  const sortedInventario = [...inventory];

  // Ordena os itens danificados pela descrição
  paraAlterar.sort((a, b) => a[1].description.localeCompare(b[1].description));

  let totalItem = 0;

  for (const item of paraAlterar) {
    if (inventory.has(item[0])) {
      // Se o item está no inventário, calcula a diferença entre o estoque e a quantidade avariada
      const itemEmEstoque = inventory.get(item[0]);
      const itemEmEstoqueQuantidade = itemEmEstoque.quantity;
      const itemAvariadoQuantidade = item[1].quantity;

      const difference = itemEmEstoqueQuantidade - itemAvariadoQuantidade;

      if (difference < 0) {
        addRow(
          table,
          item[0],
          item[1].description,
          itemEmEstoqueQuantidade,
          itemAvariadoQuantidade,
          difference,
          "warning"
        );
        totalItem++;
      }
    } else {
      const index = sortedInventario.findIndex(
        (element) => element[1].description === item[1].description
      );

      if (index > -1 && inventory.has(sortedInventario[index][0])) {
        // Arrumar essa bagunça depois
        const itemEmEstoque = inventory.get(sortedInventario[index][0]);
        const itemEmEstoqueQuantidade = itemEmEstoque.estoque;
        const itemAvariadoQuantidade = item[1].quantity;

        const difference = itemEmEstoqueQuantidade - itemAvariadoQuantidade;

        if (difference < 0) {
          addRow(
            table,
            item[0],
            item[1].description,
            itemEmEstoqueQuantidade,
            itemAvariadoQuantidade,
            difference,
            "warning"
          );

          totalItem++;
        }
      } else {
        // Adiciona uma linha de erro se o item não estiver no inventário
        addRow(
          table,
          item[0],
          item[1].description,
          "Negativo",
          "Remova",
          "Remova",
          "danger"
        );

        totalItem++;
      }
    }
  }
}
