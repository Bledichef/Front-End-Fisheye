//Mettre le code JavaScript lié à la page photographer.html

const urlPhotographer = window.location.search;
const urlSearchParams = new URLSearchParams(urlPhotographer);
const idPhotographer = Number(urlSearchParams.get("id"));

let tableauLike = [];
const arrayLikes = [];

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
		//	forEach qui execute une fonction pour chaque media sur false et qui changeras au like 
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


class Lightbox {
	
	//altAttribut = tous les alts
	//altCurrent = alt de l'image cliquée
	static init() {
		// transforme objet en tableau et y met toutes les balises médias de la page(vidéos + photos)
		const links = Array.from(document.querySelectorAll(".media"));
		// créé un nouveau tableau et y met tous les liens vers les médias (récupère l'attribut src)
		const gallery = links.map(link => link.getAttribute("src"));
		// créé un tableau avec tous les alt
		const altAttribut = links.map(link => link.getAttribute("alt"));

		const listTitle = links.map(link => link.dataset.title);


		//pour chaque balise média on créé une instance de Lightbox
		links.forEach(link => {
			link.addEventListener("click", e =>{
				e.preventDefault();
				const altCurrent = e.currentTarget.getAttribute("alt"); //récupère le alt de l'image cliquée
				const titleCurrent = e.currentTarget.dataset.title;
				new Lightbox(e.currentTarget.getAttribute("src"), gallery, altAttribut, altCurrent,  listTitle, titleCurrent); //récupère l'url de l'image cliquée
				
			});	

			link.addEventListener("keydown", e => {
				if(e.key === "Enter"){
					e.preventDefault();
					const altCurrent = e.currentTarget.getAttribute("alt"); //récupère le alt de l'image cliquée
					const titleCurrent = e.currentTarget.dataset.title;
					new Lightbox(e.currentTarget.getAttribute("src"), gallery, altAttribut, altCurrent,  listTitle, titleCurrent);
				}
			});

		});
	}

	constructor (url, gallery, altAttribut, altCurrent, listTitle, titleCurrent) {
		this.element = this.buildDOM(url); // construction du DOM à partir de l'url
		this.gallery = gallery;		
		this.altCurrent = altCurrent; //alt de l'image cliquée
		this.altAttribut = altAttribut; //tous les alts
		this.titleCurrent = titleCurrent;
		this.listTitle = listTitle;
		
		document.body.appendChild(this.element); // insertion dans le body des éléments

		this.loadMedia(url, altCurrent, titleCurrent);
		this.onKeyUp = this.onKeyUp.bind(this);
		document.addEventListener("keyup", this.onKeyUp); // écoute le keyup
	}
	
	/*
	Créé la balise qui contient les éléments de la ligthbox
	Permet de charger à l'intérieur les médias, différencie si image ou vidéo et créé les balises adaptées et met dans la balise l'attribut src qui correspond à l'image sur laquelle on a cliqué
	*/
	loadMedia(url, altCurrent, titleCurrent) {

		this.url = null;	
		const container = this.element.querySelector(".media-container");
		container.innerHTML = "";	
		this.url = url; //pour cibler l'image
		this.altCurrent = altCurrent; // pour cibler le alt
		this.titleCurrent = titleCurrent;
	
		if (this.url.includes("jpg")) {
			const image = new Image(); 
			let title = document.createElement("p");
			container.appendChild(image);
			container.appendChild(title);
			
			title.innerHTML = titleCurrent;
			image.src = url;
			image.alt = altCurrent; //rajoute le alt ciblé
			
		}
	
		if (this.url.includes("mp4")) {
			const video = document.createElement("video");
			let title = document.createElement("p");
			container.appendChild(video);
			container.appendChild(title);
			title.innerHTML = titleCurrent;
			video.src = url;
			video.setAttribute("alt", altCurrent);
			video.setAttribute("controls", "");
			title.innerHTML = titleCurrent;
			video.focus();
		}
	}
	/*
	méthode qui prend en paramètre un évenement de type Keyboard event = 
	fermer lightbox avec esc clavier
	touche fleche droite = media suivant
	touche fleche gauche = media précédent
	*/
	onKeyUp(e) {
		if (e.key === "Escape") {
			this.close(e); // si la clé pressée est la touche esc -> appel de la méthode close
		} else if (e.key === "ArrowLeft") {
			this.prev(e); // si la clé pressée est la touche fleche gauche-> appel de la méthode prev
		} else if (e.key === "ArrowRight") {
			this.next(e); // si la clé pressée est la touche fleche droite -> appel de la méthode next
		}
	}

	//méthode qui prend en paramètre un évenement de type mouse event
	close(e) {
		e.preventDefault();
		this.element.parentElement.removeChild(this.element);
		document.removeEventListener("keyup", this.onKeyUp);

	}
	//méthode qui prend en paramètre un évenement de type mouse event ou keyboard event
	next(e) {
		e.preventDefault();
		let i = this.gallery.findIndex(image => image === this.url); //pour cibler l'url de l'image
		let n = this.altAttribut.findIndex(alt => alt === this.altCurrent); //pour cibler le alt
		let x = this.listTitle.findIndex(title => title === this.titleCurrent);

		if(i === this.gallery.length - 1 ) { //si c'est la dernière image
			i = -1; // on revient à 0
		}

		if(n === this.altAttribut.length - 1){ //si dernier alt
			n = -1;
		}

		if(x === this.listTitle.length - 1) {
			x = -1;
		}

		this.loadMedia(this.gallery[i + 1], this.altAttribut[n + 1], this.listTitle[x + 1]);
	}

	//méthode qui prend en paramètre un évenement de type mouse event ou keyboard event
	prev(e) {
		e.preventDefault();
		let i = this.gallery.findIndex(image => image === this.url);
		let n = this.altAttribut.findIndex(alt => alt === this.altCurrent);
		let x = this.listTitle.findIndex(title => title === this.titleCurrent);

		if(i === 0 ) { // si c'est la première image
			i = this.gallery.length; // on passe à la dernière image
		}

		if(n === 0) {
			n = this.altAttribut.length;
		}

		if(x === 0){
			x = this.listTitle.length;
		}

		this.loadMedia(this.gallery[i - 1], this.altAttribut[n - 1], this.listTitle[x - 1]);
	}

	// création des éléments HTML + return 
	buildDOM (url) {
		const domLightbox = document.createElement("section");
		domLightbox.classList.add("lightbox");
		domLightbox.setAttribute("aria-label", "image closeup view");
		domLightbox.setAttribute("aria-hidden", "false");
		domLightbox.innerHTML = 
			`<button type="button" aria-label="Close dialog" class="lightbox-close"><i class="fa-solid fa-xmark"></i></button>
			<button type="button" aria-label="Next image" class="lightbox-next"><i class="fa-sharp fa-solid fa-chevron-right"></i></button>
			<button type="button" aria-label="Previous image" class="lightbox-prev"><i class="fa-sharp fa-solid fa-chevron-left"></button>
			<div class="media-container" aria-label="media open view"></div>
			`;

		domLightbox.querySelector(".lightbox-close").addEventListener("click", this.close.bind(this));
		domLightbox.querySelector(".lightbox-next").addEventListener("click", this.next.bind(this));
		domLightbox.querySelector(".lightbox-prev").addEventListener("click", this.prev.bind(this));
		return domLightbox;
	}
}


/*
Créé la carte avec total des likes et prix
Créé les balises et utilise reducer pour calcul du total
*/
function cardLikesAndPrice(photographers, media) {
	const tagPriceTotalLike = document.querySelector(".price-total-like");
	// création span prix
	const tagPrice = document.createElement("span");
	tagPriceTotalLike.appendChild(tagPrice);

	//création div globale nb likes + icone
	const tagContainer = document.createElement("div");
	tagPriceTotalLike.appendChild(tagContainer);
	tagContainer.className = "likes";

	// création span total des likes
	let tagTotalLike = document.createElement("span");
	tagContainer.appendChild(tagTotalLike);
	tagTotalLike.className = "number-likes";

	const like = document.createElement("i");
	tagContainer.appendChild(like);
	like.className = "fas fa-heart";

	// boucle sur chaque photographe pour récupérer dans le Json le prix
	for(const photographer of photographers) {
		if (idPhotographer === photographer.id){ //cible le photographe
			tagPrice.innerHTML = photographer.price + "€ / jour";
		}
	}

	for(item of media) {
		if (idPhotographer === item.photographerId){ //cible le photographe
			//récupère toutes les balises avec le nombre de likes
			const tagNumberLike = document.getElementById(`${item.id}`);
			let numberLikes = Number(tagNumberLike.innerHTML); //isole le chiffre
			arrayLikes.push(numberLikes);	//ajoute le chiffre dans le tableau pour chaque media	
		}
	}
	// calcule le total des likes de la page et l'affiche
	const reducer = (previousValue, currentValue) => previousValue + currentValue;
	let totalLikes = arrayLikes.reduce(reducer);
	tagTotalLike.innerHTML = Number(totalLikes);
}


/*
Gestion des likes - incrémente le nombre 
id du chiffre des likes = id du media
id du coeur = like-id du media
si les 2 chiffres sont identiques -> permet de cibler et d'augmenter le bon chiffre au clic sur le coeur = on incrémente le chiffre
*/
function addLike(media){

	const tagTotalLike = document.querySelector(".number-likes");
	for (item of media) {
		if (idPhotographer === item.photographerId){ //cible le photographe
			const tagNumberLike = document.getElementById(`${item.id}`);
			
			//const idTagNumberLike = tagNumberLike.id;

			const iconLike = document.getElementById(`like-${item.id}`); // les balises des coeurs
			//const idIconLike = iconLike.id.split("-"); //retourne une tableau autour du - le 2ème élément du tableau est l'id 
		
			iconLike.addEventListener("click", () => {
				
				// Modifié la verification par If"dejaliké"

				if(!tableauLike.includes(item.id)  ){
					tagNumberLike.innerHTML++; //ajoute au like du media
					tableauLike.push(item.id);
					
					


					totalLikes++; //ajoute au total
					//affiche le nouveau chiffre sur la page
					tagTotalLike.innerHTML = Number(totalLikes);
				}else{
					console.log(item);
					console.log(tableauLike);
					tableauLike.splice(0,1);
					tagNumberLike.innerHTML--; 
					totalLikes--;
					tagTotalLike.innerHTML = Number(totalLikes);
				}
			});
			iconLike.addEventListener("keydown", e => {
				if(!tableauLike.includes(item.id)  ){
					tagNumberLike.innerHTML++; //ajoute au like du media
					tableauLike.push(item.id);
					
					


					totalLikes++; //ajoute au total
					//affiche le nouveau chiffre sur la page
					tagTotalLike.innerHTML = Number(totalLikes);
				}else{
					console.log(item);
					console.log(tableauLike);
					tableauLike.splice(0,1);
					tagNumberLike.innerHTML--; 
					totalLikes--;
					tagTotalLike.innerHTML = Number(totalLikes);
				}
			});
		}
	}
	//valeur initiale = avant clic sur like
	const reducer = (previousValue, currentValue) => previousValue + currentValue;
	let totalLikes = arrayLikes.reduce(reducer);
}

/*
Trie les médias par popularité / date / titre
*/
function sort(media) {
	const containerMedia = document.querySelector(".photograph-galery");
	const select = document.querySelector("#select-sort");

	select.addEventListener("change", () => {
		let valueSelect = select.value; // récupération de la valeur sélectionnée
				
		if (valueSelect === "popularity") {
			//vide les médias
			containerMedia.innerHTML = "";
			/*
					Méthode sort qui prend en paramètre une fonction de calcul par ordre inversé - retourne un nouveau tableau classé du plus petit au plus grand
					Trie tous les médias du + grand au + petit like
					*/
			media.sort((a, b) =>{
				return b.likes - a.likes;
			});
			//appel de la fonction qui affiche les médias
			displayMediaPhotographers(media);
			Lightbox.init();
			addLike(media);
					
		} else if (valueSelect === "date") {
			containerMedia.innerHTML = "";
			
			media.sort((a,b) => { //tri par date
				return new Date(a.date) - new Date(b.date);
			});
			displayMediaPhotographers(media);
			Lightbox.init();
			addLike(media);

		} else if(valueSelect === "title") {
			containerMedia.innerHTML = "";
	
			media.sort((a,b) => {
				if (a.title < b.title)
					return -1;
			});
			displayMediaPhotographers(media);
			Lightbox.init();
			addLike(media);
		}
	});
}



async function init() {
	// Récupère les datas des photographes
	const { photographers } = await getElementsPhotographers();
	const { media } = await getMediaPhotographers();
	displayDataPhotographers(photographers);
	displayMediaPhotographers(media);
	Lightbox.init();
	cardLikesAndPrice(photographers, media);
	addLike(media);
	sort(media);
	

}

init();