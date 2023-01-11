<template>
<div class="MainPage">
    <CitySearch :onUpdateColor="updateCityColor" :onRemoveItem="removeCity" :onAddItem="addCity" :updateGraph="updateGraph"></CitySearch>
    <div id="graphParent">
        <LineGraph id="lineGraph" :xAxisTitle="xAxisTitle" :yAxisTitle="yAxisTitle" title="Daytime lengths 2022" :xAxisPoints="xAxisPoints" :yAxisPoints="yAxisPoints" canvasRef="dayLightCanvas" :onMouseLeave="hideLengthOfDay" :onCoordinateHover="showLengthOfDay" :coordinates="dayLengths" :xMin="xMin" :xMax="xMax" :yMin="yMin" :yMax="yMax"></LineGraph>
    </div>
    <div ref="ShowInfo" :style='{top: infoTop + "px", left:infoLeft +"px"}' :class="'InfoBox ' + showInfo">
        <h3 class="Date">{{selectedDate}}</h3>
        <div v-for="(info, index) in infos" :key="index">
            <p>{{info.city}}: {{info.dayLength}}</p>
        </div>
    </div>
</div>
</template>

<script>
import CitySearch from '../city/CitySearch.vue'
import LineGraph from '../common/LineGraph.vue'
import daylengthService from '../../services/daylengthService'
import dateUtils from "../../assets/js/utils/date"

export default {
    name: "MainPage",
    components: {
        CitySearch,
        LineGraph
    },
    data() {
        return {
            infos: [], // Used for showing day lengths of cities
            selectedDate: "", // What date the user is hovering on
            showInfo: "Hide", // Hide means that the info box isn't shown
            showInfoWidth: 300, // Used for not allowing the info box go outside of screen
            infoTop: 0, // Used for moving the infobox where the mouse is
            infoLeft: 0, // Used for moving the infobox where the mouse is
            xMin: 1,
            xMax: 365,
            yMin: 0,
            yMax: 1440,
            xAxisTitle: "Day",
            yAxisTitle: "Daytime (Min)",
            yAxisPoints: {
                split: 12,

            },
            xAxisPoints: {
                split: 365,
                ignoreEmpty: true,
                titles: this.getMonthTitles()
            },
            dayLengths: [], // Contains all information about graphs
            tempDayLengths: [] // With this the graph doesn't update everytime cities are added or removed
        }
    },
    methods: {
        getMonthTitles() {
            // Returns names of months based on how many days have passed since the Jan 1, for example: 0 = Jan, 31 = Feb, 59 = Mar, ...
            let months = dateUtils.getDaysInAllMonths();
            let titles = {} // Contains the months and days on which they change
            let incrementDays = 0 // How many days it has looped
            for (let days of months) {
                // Gets the name of a month
                let name = new Date(new Date().getFullYear(), 0, incrementDays + 1).toLocaleString('en-US', {
                    month: 'short'
                });
                // Saves it into an object
                titles[incrementDays] = name
                incrementDays += days
            }
            // This is to show Jan at the end of the month since December would not be at the very right
            titles[incrementDays] = new Date(new Date().getFullYear() + 1, 0).toLocaleString('en-US', {
                month: 'short'
            });
            return titles
        },
        hideLengthOfDay() {
            // Hides info box
            this.showInfo = "Hide";
        },
        showLengthOfDay(e, x) {
            // Adds each city's day's length to the infobox and shows them
            // Also moves the info box where the cursor is

            // Checks if there are days to show
            if (this.dayLengths.length == 0) return
            this.showInfo = ""; // Removes the 'Hide' class so infobox is shown
            this.infos = []; // Resets what the infobox is showing already

            // Calculates where the infobox should be
            if (e.clientX + this.showInfoWidth + 20 > window.innerWidth) {
                this.infoLeft = e.clientX - this.showInfoWidth - 20;
            } else {
                this.infoLeft = e.clientX + 20;
            }
            this.infoTop = e.pageY - 50;

            let day = Math.round(x) // Gets the day by rounding the x coordinate of cursor, so there are no decimals
            this.selectedDate = new Date(2022, 0, day).toLocaleDateString(); // Gets what date user is hovering on

            // Loops through each line drawn and assigns the correct daylengths and such to the infobox
            for (let graph of this.dayLengths) {
                let name = graph.name; // Name of the city
                let graphCoords = graph.coords; // Coordinates of the city
                // Loops through each coordinate to find the correct one and get that day's information
                for (let i = 0; i < graphCoords.length; i++) {
                    let coord = graphCoords[i]
                    let coordDay = coord[0]

                    // Checks if coordinate's day matches the selected day
                    if (day == coordDay) {
                        // Gets info about the day and adds it to the infobox
                        let minutes = coord[1]
                        let lengthDate = new Date()
                        lengthDate.setHours(0)
                        lengthDate.setMinutes(0)
                        lengthDate.setSeconds(minutes * 60)
                        let lengthTimeString = lengthDate.getHours() + " Hours " + lengthDate.getMinutes() + " Min " + lengthDate.getSeconds() + " Sec"

                        this.infos.push({
                            city: name,
                            dayLength: lengthTimeString
                        })
                    }
                }
            }
        },
        addCity(city, lat, long, color) {
            // Called when user has added a city
            
            // Checks if the city doesn't already exist
            let existsAlready = this.tempDayLengths.find(data => data.name == city)
            if (existsAlready !== undefined) return

            // Gets the daylight data for that city
            daylengthService.fetchDayLightData(lat, long).then(coords => {
                this.tempDayLengths.push({
                    color: color,
                    name: city,
                    coords: coords
                })
            })
        },
        updateCityColor(city, color) {
            // Updates the color of a city
            this.tempDayLengths.filter(data => data.name == city)[0].color = color
        },
        removeCity(city) {
            // Removes a city
            let newDayLengths = this.tempDayLengths.filter(data => data.name !== city) // Filters the city
            this.tempDayLengths = newDayLengths // Assigns the filtered array 
        },
        updateGraph() {
            // Updates the graph by changing the real dayLengths and not the temporary one
            let newDayLengths = []

            // Needs to copy each field so they are not linked to the temporary one
            for (let day of this.tempDayLengths) {
                newDayLengths.push({})
                let index = newDayLengths.length - 1
                newDayLengths[index].color = day.color
                newDayLengths[index].name = day.name
                newDayLengths[index].coords = day.coords
            }
            this.dayLengths = newDayLengths
        }
    },
    mounted() {
        this.hideLengthOfDay(); // Hides showInfo-box (Needs to be shown so it's width can be taken)
        let showInfo = this.$refs["ShowInfo"] // Gets the element
        this.showInfoWidth = showInfo.getBoundingClientRect().width // Saves the element's width
    },
}
</script>

<style scoped>
.MainPage {
    display: flex;
    flex-direction: row;
    width: 100%;
    height: 100%;
}

.MainPage .InfoBox {
    width: 300px;
    min-height: 150px;
    background: rgba(0, 12, 37, 0.7);
    padding: 10px;
    border-radius: 10px;
    position: absolute;
    z-index: 10;
    pointer-events: none;
    opacity: 1;
    transition: opacity 0.2s;
}

.Hide {
    opacity: 0 !important;
}

.MainPage #graphParent {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100vh;
}

#lineGraph {
    width: 800px;
    height: 600px;
}

@media all and (max-width: 1400px) {
    #lineGraph {
        width: 600px;
        height: 500px;
    }
}

@media all and (max-width: 1200px) {
    .MainPage {
        flex-direction: column;
    }

    #graphParent {
        width: initial !important;
        height: 700px !important;

        align-items: initial !important;
        margin-top: 50px;
    }

    #lineGraph {
        width: 75%;
        height: 56.25vw;
    }

}

@media all and (max-width: 700px) {
    .MainPage .InfoBox {
        width: 150px;
    }
}

@media all and (max-width: 400px) {
    .MainPage {
        flex-direction: column;
    }

    #lineGraph {
        width: 65%;
        max-height: 80vw;
        height: 500px;
    }

}
</style>
