import { OpenStreetMapProvider } from 'leaflet-geosearch';

/**
 * Returns coordinates of a city
 * @param {*} city Name of the city 
 * @returns 
 */
const getCoordinatesOfCity = (city) => {
	const provider = new OpenStreetMapProvider(); // API for getting the city
	
	// Tries to find a city with city-paramter's value in it
	return provider.search({ query: city }).then(response => {
		if (response.length > 0) {
			return response[0]
		} else {
			return []
		}
	})
}

export default {
	getCoordinatesOfCity
}