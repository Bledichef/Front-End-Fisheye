async function getPhotographers() {
  let photographers = [];

  await fetch("./data/photographers.json")
    .then((response) => response.json())
    .then((data) => (photographers = data.photographers))
    .catch((error) => error);

  return {
    photographers: [...photographers],
  };
  //return {photographers};
}

/*
Fonction qui prend en paramètre le tableau des photographes et fait afficher toutes les informations
appelle fonction photographerFactory (factories/photographer.js)
appelle fonction getUserCardDOM(factories/photographer.js)
*/
async function displayData(photographers) {
  const photographersSection = document.querySelector(".photographer_section");
  photographers.forEach((photographer) => {
    const photographerModel = photographerFactory(photographer);
    const userCardDOM = photographerModel.getUserCardDOM();
    photographersSection.appendChild(userCardDOM); // pour injecter la balise A
  });
}

async function init() {
  // Récupère les datas des photographes
  const { photographers } = await getPhotographers();
  displayData(photographers);
}

init();
