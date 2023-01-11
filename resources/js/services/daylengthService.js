import axios from 'axios'


/**
 * Returns a promise containing all the daylength data from a particular city
 * @param {Number} lat latitude 
 * @param {Number} long longitude
 * @returns A promise
 */
const fetchDayLightData = (lat, long) => {
	const promise = axios.get("/daylengthsofcoordinates?lat=" + lat + "&long=" + long)
	const dataPromise = promise.then((response) => {
		// Corrects -1 values (Meaning day length is either 24 hours or 0 hours)

		let rising = false; // Keeps track if it is summer or winter (true: summer, false: winter), Doesn't check which side of globe the city is on since Finland is on the northern side
		for (let i = 0; i < response.data.length - 1; i++) {
			let currentDayLength = response.data[i][1]; // Selected day
			let nextDayLength = response.data[i + 1][1]; // Next day from selected

			// Fixes day length if it's -1 (makes it 24 or 0 hours)
			if (currentDayLength == -1) {
				if (rising) currentDayLength = 24 * 60;
				else currentDayLength = 0;

				response.data[i][1] = currentDayLength;
			} else if (nextDayLength !== -1) { // Checks if day length is rising or lowering
				if (nextDayLength > currentDayLength) rising = true;
				else if (nextDayLength < currentDayLength) rising = false;
			}
		}

		return response.data;
	})

	return dataPromise
}

export default {
	fetchDayLightData
}