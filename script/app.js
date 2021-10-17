const apikey = "2c640e66083c20ab5ae4a699c49e1a01";

// _ = helper functions
function _parseMillisecondsIntoReadableTime(timestamp) {
	//Get hours from milliseconds
	const date = new Date(timestamp * 1000);
	// Hours part from the timestamp
	const hours = '0' + date.getHours();
	// Minutes part from the timestamp
	const minutes = '0' + date.getMinutes();
	// Seconds part from the timestamp (gebruiken we nu niet)
	// const seconds = '0' + date.getSeconds();

	// Will display time in 10:30(:23) format
	return hours.substr(-2) + ':' + minutes.substr(-2); //  + ':' + s
}

// 5 TODO: maak updateSun functie
const updateSun = (sun, left, bottom, today) => {
	sun.style.left = `${left}%`;
	sun.style.bottom = `${bottom}%`;
	sun.setAttribute('data-time', `${today.getHours().toString().padStart(2, '0')}:${today.getMinutes().toString().padStart(2, '0')}`);
	// sun.setAttribute('data-time', ('0' + today.getHours()).slice(-2) + ':' + ('0' + today.getMinutes()).slice(-2));
};

let itBeNight = () => {
	document.querySelector('html').classList.add('is-night');
};
// 4 Zet de zon op de juiste plaats en zorg ervoor dat dit iedere minuut gebeurt.
const placeSunAndStartMoving = (totalMinutes, sunrise) => {
	// In de functie moeten we eerst wat zaken ophalen en berekenen.
	// Haal het DOM element van onze zon op en van onze aantal minuten resterend deze dag.
	const sun = document.querySelector('.js-sun'),
		minutesLeft = document.querySelector('.js-time-left');
	let today = new Date();
	
	// Bepaal het aantal minuten dat de zon al op is.
	let dateUp = new Date(today.getTime() - sunrise * 1000);
	let minutesSunUp = dateUp.getHours() * 60 + dateUp.getMinutes();
	// const sunriseDate = new Date(sunrise * 1000);
	// let minutesSunUp = today.getHours() * 60 + today.getMinutes() -	(sunriseDate.getHours() * 60 + sunriseDate.getMinutes());

	// Nu zetten we de zon op de initiële goede positie ( met de functie updateSun ). Bereken hiervoor hoeveel procent er van de totale zon-tijd al voorbij is.
	const percentage = (100 / totalMinutes) * minutesSunUp,
		sunLeft = percentage,
		sunBottom = percentage < 50 ? percentage * 2 : (100 - percentage) * 2;

	updateSun(sun, sunLeft, sunBottom, today);

	// We voegen ook de 'is-loaded' class toe aan de body-tag.
	// Vergeet niet om het resterende aantal minuten in te vullen.
	//TODO incorrecte tijdverschil
	minutesLeft.innerHTML = totalMinutes - minutesSunUp;
	document.querySelector('html').classList.add('is-loaded');

	// Nu maken we een functie die de zon elke minuut zal updaten
	const t = setInterval(() => {
		today = new Date();

	// Bekijk of de zon niet nog onder of reeds onder is
	// Anders kunnen we huidige waarden evalueren en de zon updaten via de updateSun functie.
	// PS.: vergeet weer niet om het resterend aantal minuten te updaten en verhoog het aantal verstreken minuten.
		if (minutesSunUp < 0 || minutesSunUp > totalMinutes) {
			// Sun is down or set
			clearInterval(t);
			itBeNight();
		} else {
			// Anders kunnen we huidige waarden evalueren en ...
			const leftPercentage = (100 / totalMinutes) * minutesSunUp;
			const bottomPercentage = leftPercentage < 50 ? leftPercentage * 2 : (100 - leftPercentage) * 2;
			// de zon updaten via de updateSun functie.
			updateSun(sun, leftPercentage, bottomPercentage, today);

			// PS.: vergeet weer niet om het resterend aantal minuten te updaten en ...
			minutesLeft.innerHTML = totalMinutes - minutesSunUp;
		}
		minutesSunUp++;
	}, 60000);
};

// 3 Met de data van de API kunnen we de app opvullen
const showResult = (queryResponse) => {
	const sunRise = document.querySelector(".js-sunrise"),
		sunSet = document.querySelector(".js-sunset"),
		location = document.querySelector(".js-location");
	// We gaan eerst een paar onderdelen opvullen
	// Zorg dat de juiste locatie weergegeven wordt, volgens wat je uit de API terug krijgt.
	// Toon ook de juiste tijd voor de opkomst van de zon en de zonsondergang.
	sunRise.innerHTML = _parseMillisecondsIntoReadableTime(queryResponse.city.sunrise);
	sunSet.innerHTML = _parseMillisecondsIntoReadableTime(queryResponse.city.sunset);
	location.innerHTML = `${queryResponse.city.name}, ${queryResponse.city.country}`;

	// Hier gaan we een functie oproepen die de zon een bepaalde positie kan geven en dit kan updaten.
	const timeDifference = new Date(queryResponse.city.sunset * 1000 - queryResponse.city.sunrise * 1000);
	// Geef deze functie de periode tussen sunrise en sunset mee en het tijdstip van sunrise.
	placeSunAndStartMoving(timeDifference.getHours() * 60 + timeDifference.getMinutes(), queryResponse.city.sunrise);
};

const get = (url) => fetch(url).then((r) => r.json());

// 2 Aan de hand van een longitude en latitude gaan we de yahoo wheater API ophalen.
const getAPI = async (lat, lon) => {
	// Eerst bouwen we onze url op
	const url = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apikey}&units=metric&lang=nl&cnt=1`;
	// Met de fetch API proberen we de data op te halen.
	const response = await get(url);
	// Als dat gelukt is, gaan we naar onze showResult functie.
	showResult(response);
};

document.addEventListener('DOMContentLoaded', function() {
	// 1 We will query the API with longitude and latitude.
	getAPI(50.8027841, 3.2097454);
});
