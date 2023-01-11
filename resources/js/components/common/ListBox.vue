<template>
<div class="ListBox">
    <div class="ListItem" v-for="(item,index) in items" :key=index>
        <input @change="e => updateColor(item.name, e)" :value="rgbToHex(item.color)" class="Color" type="color">
        <p>{{item.name}}</p>
        <div v-on:click="() => onRemoveItem(item.name, index)" class="Remove">
        </div>
    </div>
</div>
</template>

<script>
import colorHelper from "../../assets/js/utils/color"

export default {
    name: "ListBox",
    props: {
        items: Array,
        onRemoveItem: Function,
        onUpdateColor: Function
    },
    data() {
        return {}
    },
    methods: {
        updateColor(item, e) {
            // Calls updatecolor functions if defined
            if (this.onUpdateColor !== undefined) this.onUpdateColor(item, e.target.value)
        },
        rgbToHex(color) {
            // Converts rgb to hex
            return colorHelper.rgbToHex(color)
        }
    }
}
</script>

<style scoped>
.ListBox {
    width: 100%;
}

.Color {
    margin-right: 10px;
}

.ListItem {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
    height: 25px;
    margin: 15px 0;
}

.Remove {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 15px;
    height: 100%;
    margin-left: auto;
}

.Remove::after {
    display: block;
    content: "";
    width: 15px;
    height: 3px;
    background: red;
}

.Remove:hover {
    cursor: pointer;
}
</style>
