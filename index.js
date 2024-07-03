const STAGES = [
  {
    icon: "package_2",
    color: "#1B85F4",
    title: "Objeto Postado",
    daysAfter: 1,
  },
  {
    icon: "settings",
    color: "#1B85F4",
    title: "Pedido em preparação",
    daysAfter: 2,
  },
  {
    icon: "local_shipping",
    color: "#1B85F4",
    title: "Pedido coletado pela transportadora",
    daysAfter: 4,
  },
  {
    icon: "local_shipping",
    color: "#1B85F4",
    title: "Pedido em transporte para o centro de distribuição",
    daysAfter: 7,
  },
  {
    icon: "inventory",
    color: "#1B85F4",
    title: "Pedido no centro de distribuição",
    daysAfter: 9,
  },
  {
    icon: "local_shipping",
    color: "#1B85F4",
    title: "Pedido em transporte para a cidade de destino",
    daysAfter: 12,
  },
  {
    icon: "place",
    color: "#1B85F4",
    title: "Pedido chegou a cidade destino",
    daysAfter: 14,
  },
  {
    icon: "currency_exchange",
    color: "#1B85F4",
    title: "Aguardando pagamento",
    daysAfter: 16,
  },
];

// constroi a div do icone
function getIconCard(iconDescription, color) {
  const div = document.createElement("div");
  const icon = document.createElement("span");

  div.className = "icon-container"; // Adicione esta linha
  icon.className = "material-symbols-outlined";
  icon.style = `margin-right: 20px; font-size: 38px; color: ${color}`;
  icon.innerText = ` ${iconDescription} `;

  div.appendChild(icon);

  return div;
}

// constroi a div da informação do card
function getInformation(title, subtitle, postedIn) {
  const container = document.createElement("div");
  const divTitle = document.createElement("div");
  const divSubTitle = document.createElement("div");
  const divPostedIn = document.createElement("div");

  container.className = "info-container"; // Adicione esta linha
  container.style =
    "display: flex; flex-direction: column; align-items: center; width: auto; margin-top: 15px; margin-bottom: 15px";

  divTitle.style = "font-weight: 800; margin-bottom: 5px;";
  divTitle.innerText = title;

  divSubTitle.innerText = subtitle;
  divSubTitle.style = "font-size: 1.0rem";

  if (postedIn) {
    divPostedIn.innerText = postedIn;
    divPostedIn.style = "font-size: 1.0rem";
  }

  container.appendChild(divTitle);
  container.appendChild(divSubTitle);

  if (postedIn) {
    container.appendChild(divPostedIn);
  }

  return container;
}

// constroi a div do card
function setCard(iconDescription, iconColor, title, subtitle, postedIn) {
  const container = document.getElementById("create-cards");
  const div = document.createElement("div");
  div.className = "card-container"; // Adicione esta linha
  div.style =
    "display: flex; flex-direction: column; overflow-x: hidden; align-items: start; padding-top: 25px;";

  const iconDiv = document.createElement("div");
  iconDiv.style = "display: flex; align-items: center;";

  const icon = getIconCard(iconDescription, iconColor);
  const info = getInformation(title, subtitle, postedIn);
  info.style = "width: 100%; overflow-x: hidden; text-align: start";
  iconDiv.appendChild(icon);
  iconDiv.appendChild(info);
  div.appendChild(iconDiv);

  container.appendChild(div);
}

function getFormatDate(postedIn, noHour) {
  const day = String(postedIn.getDate()).padStart(2, "0");
  const month = String(postedIn.getMonth() + 1).padStart(2, "0");
  const year = postedIn.getFullYear();
  const hour = String(postedIn.getHours()).padStart(2, "0");
  const minutes = String(postedIn.getMinutes()).padStart(2, "0");

  // formato da data apresentada no card
  if (noHour) {
    return `${day}/${month}/${year}`;
  }
  return `${day}/${month}/${year} ${hour}:${minutes}`;
}

function parseDate(dateString) {
  const [day, month, year] = dateString.split("/");
  //return new Date(`${year}-${month}-${day}`);
  return new Date(year, month - 1, day, 0, 0);
}

function addDaysInDate(datein, days) {
  const date = new Date(datein);
  date.setDate(date.getDate() + days);
  return date;
}

function differenceInDays(initialDate, finalDate) {
  const diffInMs = finalDate - initialDate;

  const diffInSeconds = diffInMs / 1000;
  const diffInMinutes = diffInSeconds / 60;
  const diffInHours = diffInMinutes / 60;
  const diffInDays = diffInHours / 24;

  return diffInDays;
}

// controi todos os cards
function appendCards(postedIn) {
  // Converte a data recebida do servidor para o formato correto
  postedIn = parseDate(postedIn);

  // Itera sobre os estágios e define os cards
  for (let i = 0; i < STAGES.length; i++) {
    const stage = STAGES[i];

    let date = addDaysInDate(postedIn, stage.daysAfter);
    if (i === 0) {
      date = addDaysInDate(postedIn + 1, stage.daysAfter);
    }
    //console.log(date, postedIn);
    const isLastStage = stage.title === "Aguardando pagamento"; // Verifica se é a última etapa

    if (differenceInDays(date, new Date(Date.now())) > 0 && date < Date.now()) {
      const stageDate = getFormatDate(
        addDaysInDate(postedIn, stage.daysAfter),
        true
      );
      setCard(stage.icon, stage.color, stage.title, "", stageDate, isLastStage);
    }
  }
}

function removeContainer(container) {
  if (!container.hasChildNodes()) return;
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
}

document
  .getElementById("trackingForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const trackingNumber = document.getElementById("tracking-number").value;
    let resultElement = document.getElementById("tracking-result");

    const url =
      "https://webhook.incaivelestrutura.com/webhook/f411fdb3-eb85-4d18-8e29-a209d485a241";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nome: trackingNumber }),
    });

    if (response.ok) {
      const resultJson = await response.json();
      const { code, data } = resultJson;

      removeContainer(document.getElementById("create-cards"));

      if (code !== "200") {
        resultElement.className = "tracking-result-error";
        resultElement.innerText = "Código inválido!";
      } else {
        resultElement.innerText = "";
        appendCards(data);
      }
    } else {
      resultElement.innerText = "Erro ao obter resposta";
    }
  });

document.head.appendChild(style);
