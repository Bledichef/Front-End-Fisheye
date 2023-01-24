//Mettre le code JavaScript lié à la page photographer.html

const urlPhotographer = window.location.search;
const urlSearchParams = new URLSearchParams(urlPhotographer);
const idPhotographer = Number(urlSearchParams.get("id"));

/*
Fetch vers le json pour récupérer les données des photographes
Met dans photographers les données et les retourne
*/
async function getElementsPhotographers(){
	let photographers = [];
	
	await fetch("./data/photographers.json")
		.then(response => response.json())
		.then(data => photographers = data.photographers)
		.catch(error => error);

	return ({
		photographers: [...photographers]});
}
/*
Fetch vers le json pour récupérer les données medias des photographes
Met dans media les données et les retourne
*/
async function getMediaPhotographers(){
	let media = [];
	
	await fetch("./data/photographers.json")
		.then(response => response.json())
		.then(data => {
			media = data.media;
			media.sort((a, b) =>{
				return b.likes - a.likes;
			});
		})
		.catch(error => error);

	return ({
		media: [...media]});
}

/*
Affiche les données des photographes
Paramètre photographers retourné par getElementsPhotographers
Boucle sur chaque photographe 
Cible la page du photographe sur laquelle on est grâce aux paramètres de l'url
Créé les éléments et y met dynamiquement les infos
*/
function displayDataPhotographers(photographers) {
	const photographHeader = document.querySelector(".photograph-header");
	const containerButtonInfos = document.querySelector(".container-button-infos");

	for (const photographer of photographers) {
		if (idPhotographer === photographer.id) { // cible le photographe avec l'id dans l'url 
			const divHeader = document.createElement("div");
			containerButtonInfos.appendChild(divHeader);
			divHeader.className = "container-infos";

			const tagH1 = document.createElement("h1");
			divHeader.appendChild(tagH1);
			tagH1.innerHTML = photographer.name; 

			const tagCity = document.createElement("span");
			divHeader.appendChild(tagCity);
			tagCity.innerHTML = photographer.city + ", ";
			tagCity.className = "city-country";
      
			const tagCountry = document.createElement("span");
			divHeader.appendChild(tagCountry);
			tagCountry.innerHTML = photographer.country;
			tagCountry.className = "city-country";

			const tagLine = document.createElement("p");
			divHeader.appendChild(tagLine);
			tagLine.innerHTML = photographer.tagline;

			const tagImg = document.createElement("img");
			photographHeader.appendChild(tagImg);
			tagImg.src = `assets/photographers/Photographers/${photographer.portrait}`; //chemin pour la photo du portrait + le nom de la photo récupéré du fetch
			tagImg.className = "photo-page-photographe"; //ajout de la classe pour le style
			tagImg.setAttribute("alt", photographer.name);

			//insertion du nom du photographe dans LS pour récupération pour formulaire
			const namePhotographer = photographer.name;
			localStorage.setItem("name", namePhotographer);
		}
	}
}
/*
Affiche les media des photographes
Paramètre media retourné par getMediaPhotographers
Boucle sur chaque media 
Cible la page du photographe sur laquelle on est grâce aux paramètres de l'url
Appelle la factory methode -> si image créé balise image - si video créé balise video en appelant chaque fonction de la factory methode
*/
function displayMediaPhotographers(media) {
	for (item of media) {
		if (idPhotographer === item.photographerId) { // cible le photographe avec l'id dans l'url 
			
			const factoryModel = displayPictureVideoFactory(item); //appel de la factory qui créé toutes les balises sauf img et video
			
			if(item.image) { //s'il y a une image, appelle la fonction qui créé balise img dans la factory
				factoryModel.createPicture(item);
			} else if(item.video) { // sinon = vidéo, appelle la fonction qui créé balise video dans la factory
				factoryModel.createVideo(item);
			} else {
				console.error("Problème de remontée des données back-end");
			}
		}
	}
}


async function init() {
	// Récupère les datas des photographes
	const { photographers } = await getElementsPhotographers();
	const { media } = await getMediaPhotographers();
	displayDataPhotographers(photographers);
	displayMediaPhotographers(media);
//	cardLikesAndPrice(photographers, media);
//	addLike(media);
	sort(media);
//	Lightbox.init();//

}

init();