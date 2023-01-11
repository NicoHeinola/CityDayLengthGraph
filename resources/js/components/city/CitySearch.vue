<template>
<div class="CitySearch">
    <form @submit.prevent="addItem">
        <input type="text" v-model="item" placeholder="Type a name of a city" />
        <div class="Buttons">
            <input type="submit" value="Add City" />
            <input type="button" v-on:click="updateGraph" value="Update Graph" />
        </div>
    </form>
    <div class="Line"></div>
    <h1>Cities</h1>
    <ListBox :onUpdateColor="onUpdateColor" :items="items" :onRemoveItem="removeItem" />
</div>
</template>

<script>
import ListBox from "../common/ListBox"
import Random from "../../assets/js/utils/random"
import cityUtils from "../../assets/js/utils/city"

export default {
    name: "CitySearch",
    props: {
        updateGraph: Function,
        onRemoveItem: Function,
        onAddItem: Function,
        onUpdateColor: Function
    },
    components: {
        ListBox
    },
    data() {
        return {
            item: "", // What user types into the city input
            items: [] // Contains all cities
        }
    },
    methods: {
        addItem() {
            // Called when adding an item onto the list of cities

            // Checks if there are duplicates
            if (this.items.filter(i => this.item == i.name).length === 0 && this.item !== "") {

                // Gets coordinates of a city
                cityUtils.getCoordinatesOfCity(this.item).then(coordinates => {
                    if (coordinates.length == 0) return

                    let cityname = coordinates.label.split(",")[0] // Corrects the name of the city (if user only typed it partially)
                    let color = `rgb(${Random.randomBetween(0,255)},${Random.randomBetween(0,255)},${Random.randomBetween(0,255)})`; // Color of the line in graph
                    this.items.push({
                        name: cityname,
                        color: color
                    })
                    if (this.onAddItem !== undefined) this.onAddItem(cityname, coordinates.y, coordinates.x, color) // Calls parent's addItem function if defined
                    this.item = "" // Clears the city input
                })

            }
        },
        removeItem(item, index) {
            // Removes a city from the list
            this.items.splice(index, 1)
            if (this.onRemoveItem !== undefined) this.onRemoveItem(item, index) // Calls paren't removeItem function if defined
        }
    }
}
</script>

<style scoped>
.CitySearch {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 400px;
    max-width: 100%;
    min-height: 100vh;
    padding: 40px;
    background: var(--lightBG);
}

.Line {
    width: 100%;
    height: 5px;
    margin: 15px 0;
    background: rgb(34, 36, 39);
}

input {
    margin-bottom: 20px;
    width: 100%;
}

form {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
}

form input {
    width: 100%;
}

.Buttons {
    display: flex;
    justify-content: space-between;
    width: 100%;
}

input[type="button"],
input[type="submit"] {
    width: 45%
}

@media all and (max-width: 1400px) {
    form {
        width: 300px;
    }

    .CitySearch {
        min-width: initial;
    }
}
</style>
