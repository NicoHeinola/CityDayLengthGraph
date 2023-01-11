<template>
<div id="app">
    <MainPage></MainPage>
</div>
</template>

<script>
import MainPage from './components/pages/MainPage.vue'

export default {
    name: 'App',
    components: {
        MainPage
    },
    mounted() {}
}
</script>

<style>
:root {
    --bgGradient1: rgb(22, 22, 22);
    --bgGradient2: rgb(15, 15, 15);
    --inputBG: rgb(230, 230, 230);
    --buttonBG: rgb(0, 175, 0);
    --lightBG: rgb(45, 46, 54);
}

* {
    position: relative;
    box-sizing: border-box;
    padding: 0;
    margin: 0;
    font-size: 15px;
    color: white;
    font-family: 'Open Sans', sans-serif;
}

body:before {
    content: "";
    z-index: -1;
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    background: rgb(61, 61, 61);
    background: linear-gradient(173deg, var(--bgGradient1) 0%, var(--bgGradient1) 50%, var(--bgGradient2) 50%, var(--bgGradient2) 100%);
}

h1 {
    font-size: 40px;
}

h2 {
    font-size: 30px;
}

h3 {
    font-size: 25px;
}

/* Inputs */

input:not([type="color"]) {
    width: 250px;
    height: 45px;
    padding: 0 15px;
    background: var(--inputBG);
    border: none;
    /*border-radius: 50px;*/
    color: black;
}

input[type="color"] {
    width: 15px;
    height: 15px;
    border: none;
    outline: none;
    background: none;
    padding: 0;
}

button,
input[type="button"],
input[type="submit"] {
    background: var(--buttonBG);
    color: white;
    min-width: 50px;
    width: initial;
}

button:hover,
input[type="button"]:hover,
input[type="submit"]:hover {
    cursor: pointer;
}

@media all and (max-width: 800px) {
    h1 {
        font-size: 25px !important;
    }

    h2 {
        font-size: 20px !important;
    }

    h3 {
        font-size: 12px !important;
    }

    p {
        font-size: 10px !important;
    }
}
</style>
