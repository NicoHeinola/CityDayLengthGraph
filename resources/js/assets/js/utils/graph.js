/**
 * Returns scale of a canvas based on max and min values on each axis
 * @param {*} canvas referenced canvas
 * @param {Number} xMin min x-axis value
 * @param {Number} xMax max x-axis value
 * @param {Number} yMin min y-axis value
 * @param {Number} yMax max y-axis value
 * @returns 
 */
const getUnitsOfCanvas = (canvas, xMin, xMax, yMin, yMax) => {
	let dimensions = canvas.getBoundingClientRect()
	let widthPerUnit = dimensions.width / (xMax - xMin) // Scale of width
	let heightPerUnit = dimensions.height / (yMax - yMin) // Scale of height
	return [widthPerUnit, heightPerUnit]
}

/**
 * Updates canvas' width and height
 * @param {*} canvas 
 */
const initGraph = (canvas) => {
	let dimensions = canvas.getBoundingClientRect()
	canvas.width = dimensions.width;
	canvas.height = dimensions.height;
}

/**
 * Clears a canvas
 * @param {*} canvas 
 */
const clearGraph = (canvas) => {
	const context = canvas.getContext('2d');

	context.clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * Draws a line between two points
 * @param {*} ctx 
 * @param {*} ax x of point a
 * @param {*} ay y of point a
 * @param {*} bx x of point b
 * @param {*} by y of point b
 */
const drawSingleLine = (ctx, ax, ay, bx, by) => {
	ctx.beginPath();
	ctx.lineWidth = 4;
	ctx.moveTo(ax, ay);
	ctx.lineTo(bx, by);
	ctx.stroke();
}

/**
 * Draws a circle on canvas
 * @param {*} ctx 
 * @param {*} x x position
 * @param {*} y y position
 * @param {*} r radius
 */
const drawDot = (ctx, x, y, r) => {
	ctx.beginPath();
	ctx.arc(x, y, r, 2 * Math.PI, 0, true);
	ctx.fill();
}



export default {
	getUnitsOfCanvas, initGraph, clearGraph, drawSingleLine, drawDot
}