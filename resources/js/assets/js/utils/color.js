const componentToHex = (c) => {
	var hex = Number(c).toString(16);
	return hex.length == 1 ? "0" + hex : hex;
}
const rgbToHex = (rgbString) => {
	// Remove unnecessary letters such as, rgb, ( ) etc. Also split it by commas to get the colors
	let colors = rgbString.substr(3, rgbString.length - 1).replaceAll("(", "").replaceAll(")", "").replaceAll(" ", "").split(",")
	return "#" + componentToHex(colors[0]) + componentToHex(colors[1]) + componentToHex(colors[2]);
}


export default {
	rgbToHex
}