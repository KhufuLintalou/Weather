"use strict";

async function getWeatherData(coord) {
    const coordArray = coord.split("|");

    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${coordArray[0]}&longitude=${coordArray[1]}&daily=temperature_2m_mean,weather_code&current=temperature_2m,weather_code&timezone=auto`
    const data = await fetch(apiUrl, { mode: "cors" });
    const dataPromise = await data.json();

    return dataPromise;
}

async function processData(dataPromise) {
    const dataObject = await dataPromise;

    const object = {
        current: {
            time: dataObject.current.time,
            temp: dataObject.current.temperature_2m,
            weatherCode: dataObject.current.weather_code,
        },
        daily: {
            meanTemp: dataObject.daily.temperature_2m_mean,
            time: dataObject.daily.time,
            weatherCode: dataObject.daily.weather_code,
        },
    }

    console.log(object);
    return object;
}

async function getLocationCoord(location) {
    const apiUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${location}&count=10&language=en&format=json`
    const data = await fetch(apiUrl, { mode: "cors" });
    const dataPromise = await data.json()

    return dataPromise;
}

function emptyElement(element) {
    while (element.firstChild) {
        element.firstChild.remove();
    }
}

const searchInput = document.getElementById("search");
const select = document.querySelector("select");

function searchHandler(e) {
    if (e.key === "Enter") {
        if (searchInput.value !== "") {
            emptyElement(select);

            const coordData = getLocationCoord(searchInput.value);

            coordData.then((coordObject) => {
                coordObject.results.forEach((result) => {
                    const searchOption = document.createElement("option");

                    searchOption.textContent = `${result.name} (${result.country})`;
                    searchOption.value = `${result.latitude}|${result.longitude}`;

                    select.appendChild(searchOption);
                })

                displayWeatherData(select.value);
            })
        }
    }
}

function callDisplayFunction() {
    displayWeatherData(select.value);
} 

searchInput.addEventListener("keydown", searchHandler);
select.addEventListener("change", callDisplayFunction);

const currentButton = document.getElementById("current");
const dailyButton = document.getElementById("daily");
const weatherDisplay = document.getElementById("weather-display");

async function displayWeatherData(coord) {
    emptyElement(weatherDisplay);

    const weatherData = await processData(getWeatherData(coord));

    if (currentButton.className === "selected") {
        const data = document.createElement("div");
        const mainInfo = document.createElement("div");
        const temp = document.createElement("h1");
        const date = document.createElement("p");
        const codeDescript = document.createElement("p");

        data.className = "data";
        mainInfo.className = "main";
        temp.className = "temp";
        date.className = "date";
        codeDescript.className = "code-desc";

        temp.textContent = weatherData.current.temp;
        date.textContent = weatherData.current.time;
        codeDescript.textContent = weatherData.current.weatherCode;

        weatherDisplay.appendChild(data);
        data.append(mainInfo, codeDescript);
        mainInfo.append(temp, date);
    }

    if (dailyButton.className === "selected") {
        for (let i = 0; i < 7; i++) {
            const data = document.createElement("div");
            const mainInfo = document.createElement("div");
            const temp = document.createElement("h1");
            const date = document.createElement("p");
            const codeDescript = document.createElement("p");

            data.className = "data";
            mainInfo.className = "main";
            temp.className = "temp";
            date.className = "date";
            codeDescript.className = "code-desc";

            temp.textContent = weatherData.daily.meanTemp[i];
            date.textContent = weatherData.daily.time[i];
            codeDescript.textContent = weatherData.daily.weatherCode[i];

            weatherDisplay.appendChild(data);
            data.append(mainInfo, codeDescript);
            mainInfo.append(temp, date);
        }
    }
}

function selectButton() {
    if (currentButton.className === "selected") {
        currentButton.removeAttribute("class");

        dailyButton.className = "selected";
    } else {
        dailyButton.removeAttribute("class");

        currentButton.className = "selected";
    }
}

function toggleData() {
    selectButton();

    if (select.value !== "") {
        displayWeatherData(select.value);
    }
}

currentButton.addEventListener("click", toggleData);
dailyButton.addEventListener("click", toggleData);