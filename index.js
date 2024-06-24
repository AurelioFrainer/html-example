// BR368703360147BR

const BOX_ICON = "package_2";
const TRUCK_ICON = "local_shipping";
const TROLLEY_ICON = "trolley";

const COLOR_BLUE_ICON = "#1B85F4";
const COLOR_RED_ICON = "#1B85F4";
const COLOR_ORANGE_ICON = "#1B85F4";

const POSTED_OBJECT = "Objeto postado";
const IN_TRANSFER = "Objeto em transferência";
const TROLLEY = "Chegada no centro de distribuição";

// constroi a div do icone
function getIconCard(iconDescription, color) {
  const div = document.createElement("div");
  const icon = document.createElement("span");

  div.style = "padding-left: 20px; padding-right: 32px";

  icon.className = "material-symbols-outlined";
  icon.style = `font-size: 48px; color: ${color}`;
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

  container.style =
    "display: flex; flex-direction: column; align-items: center; width: auto; margin-top: 15px; margin-bottom: 15px";

  divTitle.style = "font-weight: 800";
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
  div.style = "display: flex; align-items: center; padding-top: 18px";

  const icon = getIconCard(iconDescription, iconColor);
  const info = getInformation(title, subtitle, postedIn);
  info.style = "width: 100%; text-align: start";
  div.appendChild(icon);
  div.appendChild(info);

  container.appendChild(div);
}

function getFormatDate(postedIn, noHour) {
  const day = postedIn.getDate();
  const month = postedIn.getMonth() + 1;
  const year = postedIn.getFullYear();
  const hour = postedIn.getHours();
  const minutes = postedIn.getMinutes();

  // formato da data apresentada no card
  if (noHour) {
    return `${day}/${month}/${year}`;
  }
  return `${day}/${month}/${year} ${hour}:${minutes}`;
}

function addDaysInDare(datein, days) {
  const date = new Date(datein);
  date.setDate(date.getDate() + days);
  return date;
}

// controi todos os cards
// postedIn = data vinda do servidor
function appendCards(postedIn, city) {
  postedIn = new Date(postedIn);

  const today = Date.now();

  // postedIn = new Date("2024-06-15 15:30");
  const timeDiff = Math.abs(today - postedIn);

  // quantidade de dias desde a compra
  const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  // formato da data apresentada no card
  const formatDate = getFormatDate(postedIn);

  if (daysDiff === 0) {
    setCard(BOX_ICON, COLOR_BLUE_ICON, POSTED_OBJECT, city, formatDate);
    return;
  }

  for (let i = 0; i < daysDiff - 1; i++) {
    // card no primeiro dia
    if (i === 0) {
      setCard(BOX_ICON, COLOR_BLUE_ICON, POSTED_OBJECT, city, formatDate);
    }

    // card no segundo dia
    if (i === 1) {
      setCard(
        TRUCK_ICON,
        COLOR_RED_ICON,
        IN_TRANSFER,
        "",
        getFormatDate(addDaysInDare(postedIn, i), true)
      );
    }

    // card no quarto dia
    if (i === 3) {
      setCard(
        TROLLEY_ICON,
        COLOR_ORANGE_ICON,
        TROLLEY,
        "",
        getFormatDate(addDaysInDare(postedIn, i), true),
        true
      );
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
