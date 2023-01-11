<template>
<div class="LineGraph">
    <h1 class="Title">{{title}}</h1>

    <div class="Wrapper">
        <div class="CursorLine" v-if="showYCursorLine" :style='{left:xCursorPos + "px"}'></div>
        <!-- Contains the grid lines and texts -->
        <div v-if="canvas !== null" class="Grid">
            <!-- Y axis -->
            <div class="yAxis">
                <h3 class="Title">
                    {{yAxisTitle}}
                </h3>
                <!-- Style: calculates positions (left or top) for each value and line so they are evenly spaced  -->
                <div class="Values" v-if="yAxisPoints.split > 0">
                    <div :style="{top: ((yMax - yMin) - (yMax - yMin) / yAxisPoints.split * (index - 1)) * getUnits()[1] + 'px'}" v-for="(index) in yAxisPoints.split + 1" :key="index" class="Value">
                        <p v-if="!yAxisPoints.ignoreEmpty && (yAxisPoints.titles === undefined || yAxisPoints.titles[index - 1] === undefined)">
                            {{calculateIndexNum(yMin,yMax,yAxisPoints.split, index)}}
                        </p>
                        <p v-else>
                            {{yAxisPoints.titles[index - 1]}}
                        </p>
                    </div>
                </div>
                <div class="Lines" v-if="yAxisPoints.split > 0">
                    <div v-for="(index) in yAxisPoints.split + 1" :key="index" class="Lines">
                        <div :style="{top: ((yMax - yMin) - (yMax - yMin) / yAxisPoints.split * (index - 1)) * getUnits()[1] + 'px'}" v-if="!yAxisPoints.ignoreEmpty || (yAxisPoints.titles !== undefined && yAxisPoints.titles[index - 1] !== undefined)" class="Line"></div>
                    </div>
                </div>
            </div>
            <!-- X axis -->
            <div class="xAxis">
                <h3 class="Title">
                    {{xAxisTitle}}
                </h3>
                <div v-if="yAxisPoints.split > 0" class="Values">
                    <div :style="{left: ((xMax - xMin) / xAxisPoints.split * (index - 1)) * getUnits()[0] + 'px'}" v-for="(index) in xAxisPoints.split + 1" :key="index" class="Value">
                        <p v-if="!xAxisPoints.ignoreEmpty && (xAxisPoints.titles === undefined || xAxisPoints.titles[index - 1] === undefined)">
                            {{calculateIndexNum(xMin, xMax, xAxisPoints.split, index)}}
                        </p>
                        <p v-else>
                            {{xAxisPoints.titles[index - 1]}}
                        </p>
                    </div>
                </div>
                <div v-if="xAxisPoints.split > 0" class="Lines">
                    <div v-for="(index) in xAxisPoints.split + 1" :key="index" class="Lines">
                        <div :style="{left: ((xMax - xMin) / xAxisPoints.split * (index - 1)) * getUnits()[0] + 'px'}" v-if="!xAxisPoints.ignoreEmpty || (xAxisPoints.titles !== undefined && xAxisPoints.titles[index - 1] !== undefined)" class="Line"></div>
                    </div>
                </div>
            </div>
        </div>
        <!-- Contains the line diagram and hotspots -->
        <div class="CanvasContainer">
            <!-- Overlay of what each line represents (for example a city name)-->
            <div class="Overlay">
                <div v-for="(graph, index) in coordinates" :key="index">
                    <p class="Text">{{graph.name}}</p>
                    <div class="Color" :style="{background: graph.color}"></div>
                </div>
            </div>
            <canvas @mousemove="mouseMove" @mouseleave="mouseLeave" v-bind:ref="canvasRef"></canvas>
            <canvas class="Hotspots" :ref="'hotspots' + canvasRef"></canvas>
        </div>
    </div>
</div>
</template>

<script>
import graphUtils from "../../assets/js/utils/graph"

export default {
    name: "LineGraph",
    computed: {},
    props: {
        canvasRef: String, // Used to be able to get the canvas element
        xMin: Number,
        xMax: Number,
        yMin: Number,
        yMax: Number,
        coordinates: Array,
        onCoordinateHover: Function,
        onMouseLeave: Function,
        title: String,
        yAxisTitle: String,
        xAxisTitle: String,
        xAxisPoints: Object,
        yAxisPoints: Object,
    },
    data() {
        return {
            canvas: null, // Contains lines
            hotspotcanvas: null, // Contains hotspots
            showYCursorLine: false, // The orange line that follows cursor
            xCursorPos: 0 // Cursor's x position. Cursor line uses this to move itself where the cursor is
        }
    },
    methods: {
        calculateIndexNum(min, max, count, index) {
            // Returns which position a line / text should be on the canvas. Used for spacing them apart evenly.
            return Math.round(min + ((max - min) / (count) * (index - 1)))
        },

        async drawGraph(canvas, xMin, xMax, yMin, yMax, coordinates, color) {
            let dimensions = canvas.getBoundingClientRect() // Canvas size

            let [widthPerUnit, heightPerUnit] = graphUtils.getUnitsOfCanvas(canvas, xMin, xMax, yMin, yMax) // Used for making the lines match differently sized canvases (aka. scale them)

            let ctx = canvas.getContext("2d")

            // Needs to be a promise so it can animate the lines properly
            await new Promise((resolve) => {
                const duration = 1.25; // Animation delay

                // Loop through each coordinate and draw a line between it and the next one
                for (let i = 0; i < coordinates.length - 1; i++) {
                    setTimeout(() => {
                        // Color
                        ctx.strokeStyle = color;
                        ctx.fillStyle = color;

                        // a = current coordinate
                        // b = next coordinate
                        let ax = (coordinates[i][0] - xMin) * widthPerUnit;
                        let bx = (coordinates[i + 1][0] - xMin) * widthPerUnit;
                        let ay = dimensions.height - (coordinates[i][1] - yMin) * heightPerUnit;
                        let by = dimensions.height - (coordinates[i + 1][1] - yMin) * heightPerUnit;

                        graphUtils.drawSingleLine(ctx, ax, ay, bx, by)
                        graphUtils.drawDot(ctx, ax, ay, 2)

                    }, duration * i)
                    setTimeout(resolve, duration * coordinates.length - 2); // Animation delay
                }
            })
        },

        drawOverlappingCoordinates(canvas, overlappingCoords, xMin, xMax, yMin, yMax, color = "rgba(180,0,0,0.3)", borderColor = "rgb(255,60,60,0.5)") {
            // Draws overlapping coordinates onto a canvas
            let ctx = canvas.getContext("2d")
            let [widthPerUnit, heightPerUnit] = graphUtils.getUnitsOfCanvas(canvas, xMin, xMax, yMin, yMax)

            let originalColor = ctx.fillStyle

            for (let coord of overlappingCoords) {
                ctx.fillStyle = borderColor
                this.drawDot(ctx, coord[0] * widthPerUnit - 3, (yMax - coord[1]) * heightPerUnit, 8)
                ctx.fillStyle = color
                this.drawDot(ctx, coord[0] * widthPerUnit - 3, (yMax - coord[1]) * heightPerUnit, 5)
            }

            ctx.fillStyle = originalColor
        },

        drawSingleLine(ctx, ax, ay, bx, by) {
            ctx.beginPath();
            ctx.lineWidth = 4;
            ctx.moveTo(ax, ay);
            ctx.lineTo(bx, by);
            ctx.stroke();
        },

        drawDot(ctx, x, y, r) {
            ctx.beginPath();
            ctx.arc(x, y, r, 2 * Math.PI, 0, true);
            ctx.fill();
        },

        findOverlappingPoints(arrays) {
            let points = [] // Overlapping points that are found
            let checked = [] // For optimizations, contains points that have already been checked

            // Loops through each point array
            for (let i = 0; i < arrays.length; i++) {
                let pArray = arrays[i]; // Gets an array (full of coordinates) to loop through
                for (let p of pArray) {
                    // P = Current coordinate
                    // Makes sure that the coordinate hasn't been checked yet (for optimization)
                    let checkedAlready = checked.find(([x, y]) => p[0] === x && p[1] === y);
                    if (checkedAlready) continue;

                    // Loops through the other arrays and checks if they contain the coordinate, skips the one it's already checking
                    for (let x = 0; x < arrays.length && i !== x; x++) {
                        let pArray2 = arrays[x] // A point array (contains coordinates)
                        let containsPoint = pArray2.find(([x, y]) => { // Checks if point is in another array
                            // Considers overlaps if there is, in this case, a 30 second difference
                            let maxDiff = 1 / 60 * 15; // x seconds
                            let xOverLap = (x >= p[0] - maxDiff && x <= p[0] + maxDiff)
                            let yOverLap = (y >= p[1] - maxDiff && y <= p[1] + maxDiff)
                            return xOverLap && yOverLap
                        });
                        // If found an overlap appends it to an array
                        if (containsPoint !== undefined) {
                            points.push(containsPoint)
                        }
                        checked.push(p)
                    }
                }
            }

            // Returns overlapping points
            return points
        },
        getUnits() {
            return graphUtils.getUnitsOfCanvas(this.canvas, this.xMin, this.xMax, this.yMin, this.yMax)
        },
        mouseMove(pos) {
            // Called when mouse moves on graphcanvas
            this.showYCursorLine = true; // Enables the cursor following line
            this.xCursorPos = pos.layerX // Gets cursor's position

            // Makes sure onCoordinateHover() is defined
            if (this.onCoordinateHover !== undefined && this.onCoordinateHover !== null) {
                // Scales the coordinates
                let [widthPerUnit, heightPerUnit] = graphUtils.getUnitsOfCanvas(this.canvas, this.xMin, this.xMax, this.yMin, this.yMax)
                let coordX = this.xMin + pos.layerX / widthPerUnit
                let coordY = this.yMax - pos.layerY / heightPerUnit
                this.onCoordinateHover(pos, coordX, coordY)

            }

        },
        mouseLeave(e) {
            // Called when mouse leaves the canvas
            this.showYCursorLine = false; // Hides cursor following line
            if (this.onMouseLeave !== undefined) this.onMouseLeave(e) // Calls onMouseLeave if it's defined
        },
        updateGraph() {
            // Redraws the graph
            graphUtils.clearGraph(this.canvas)
            graphUtils.clearGraph(this.hotspotcanvas)

            // Draws each coordinate as a line
            for (let coord of this.coordinates) {
                let coordsXY = coord.coords // Coordinate list
                let color = coord.color // Color of the lines
                this.drawGraph(this.canvas, this.xMin, this.xMax, this.yMin, this.yMax, coordsXY, color)
            }
            // Finds overlapping coordinates and draws them
            let coordinateArray = this.coordinates.map(coord => coord.coords)
            let overlappingCoords = this.findOverlappingPoints(coordinateArray)
            this.drawOverlappingCoordinates(this.hotspotcanvas, overlappingCoords, this.xMin, this.xMax, this.yMin, this.yMax)

        }
    },
    mounted() {
        // Gets canvas elements
        this.canvas = this.$refs[this.canvasRef]
        this.hotspotcanvas = this.$refs["hotspots" + this.canvasRef]

        // Initializes the canvases
        graphUtils.initGraph(this.canvas)
        graphUtils.initGraph(this.hotspotcanvas)

        // Updates canvases
        this.updateGraph()
    },
    watch: {
        // Redraws each canvas every time the coordinates are changed
        coordinates: function () { // watch it
            this.updateGraph()
        }
    }
}
</script>

<style scoped>
.LineGraph {
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
}

.LineGraph>.Title {
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    height: 100px;
}

.LineGraph .Wrapper {
    width: 100%;
    height: calc(100% - 100px);
    max-width: 100%;
    max-height: 100%;
}

.CanvasContainer {
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
    background: rgba(87, 87, 87, 0.527);
}

.Hotspots {
    pointer-events: none;
}

canvas {
    position: absolute;
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
}

#hidden {
    opacity: 0;
}

/* Cursor following line*/
.CursorLine {
    position: absolute;
    width: 1px;
    height: 100%;
    background: orange;
    z-index: 5;
    pointer-events: none;
}

/* Grid */

.Grid {
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: -1;
    pointer-events: none;
    outline: 1px solid rgb(119, 119, 119);
}

.Grid .Title {
    position: absolute;
    font-size: 16px;
    width: max-content;
}

.Grid .Lines {
    position: absolute;
    width: 100%;
    height: 100%;
}

.Grid .Lines .Line {
    position: absolute;
    background: rgb(119, 119, 119);
}

.Grid .Values {
    position: absolute;
}

.Grid .Values .Value {
    position: absolute;

}

.Grid .Values .Value * {
    font-size: 12px;
}

/* Y-Axis */

.Grid .yAxis {
    position: absolute;
    width: 100%;
    height: 100%;
}

.Grid .yAxis .Lines .Line {
    width: calc(100% + 10px);
    right: 0;
    height: 1px;
}

.Grid .yAxis .Values {
    left: calc(-10px - 5px);
    width: 0;
    height: 100%;
}

.Grid .yAxis .Value {
    transform: translateY(-50%);
    right: 100%;
}

.Grid .yAxis .Title {
    transform: translateY(-150%) translateX(-50%);
}

/* X-Axis */
.Grid .xAxis {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
}

.Grid .xAxis .Lines .Line {
    height: calc(100% + 10px);
    top: 0;
    width: 1px;
}

.Grid .xAxis .Values {
    bottom: calc(-15px - 5px);
    height: 10px;
    width: 100%;
}

.Grid .xAxis .Value {
    transform: translateX(-50%);
}

.Grid .xAxis .Title {
    right: 0;
    bottom: 0;
    transform: translateY(50%) translateX(150%);

}

/* Overlay (shows more info about the day) */

.Overlay {
    position: absolute;
    width: min-content;
    height: min-content;
    max-height: 100%;
    padding-top: 3%;
    padding-right: 3%;
    z-index: 10;
    right: 0;
    overflow-y: scroll;
    scrollbar-width: none;
}

.Overlay>div {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    width: min-content;
    margin-left: auto;

    margin-bottom: 5px;
    background: rgba(0, 0, 0, 0.411);
    border-radius: 5px;
    padding: 4px 0px 4px 10px;
}

.Overlay>div .Color {
    width: 10px;
    height: 10px;
    border: 1px solid black;
    margin: 0 10px;
}

/*
.XAxis {
    width: 100%;
    height: 100px;
    background: orange;
}
.YAxis {
    width: 100px;
    height: 100%;
    background: orange;
}
*/
</style>
