/**
 * Returns how many days are in each month
 * @returns list of days in months 1-12
 */
const getDaysInAllMonths = () => {
	let months = [] // List of days in each month, january = 1, february 2, ...
	for (let i = 0; i < 12; i++) {
		let days = new Date(new Date().getFullYear(), i + 1, 0).getDate(); // Gets the days in a month
		months.push(days)
	}
	return months
}

export default {
	getDaysInAllMonths
}