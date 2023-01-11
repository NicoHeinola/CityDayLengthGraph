/**
 * Returns a random number between two integers
 */
const randomBetween = (min, max) => {
	return Math.floor(Math.random() * (max - min + 1) + min)
}

export default {
	randomBetween
}