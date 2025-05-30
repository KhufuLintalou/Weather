"use strict";

async function getWeatherData(coord) {
    const coordArray = coord.split("|");
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${coordArray[0]}&longitude=${coordArray[1]}&daily=temperature_2m_mean,weather_code&current=temperature_2m,weather_code&timezone=auto`

    let data;
    let dataPromise;

    try {
        data = await fetch(apiUrl, { mode: "cors" });
        dataPromise = await data.json();
    } catch (error) {
        alert("Fetching Failed.");

        throw error;
    }

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

    return object;
}

async function getLocationCoord(location) {
    const apiUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${location}&count=10&language=en&format=json`

    let data;
    let dataPromise;

    try {
        data = await fetch(apiUrl, { mode: "cors" });
        dataPromise = await data.json();
    } catch (error) {
        alert("Fetching Failed.");

        throw error;
    }

    return dataPromise;
}

function emptyElement(element) {
    while (element.firstChild) {
        element.firstChild.remove();
    }
}

const currentButton = document.getElementById("current");
const dailyButton = document.getElementById("daily");
const weatherDisplay = document.getElementById("weather-display");
const searchInput = document.getElementById("search");
const select = document.querySelector("select");

function displayLoadingStatus() {
    if (!weatherDisplay.firstChild) {
        const load = document.createElement("div")

        load.textContent = "Loading...";
        load.id = "load";

        document.body.appendChild(load);
    }

    weatherDisplay.className = "loading";
}

function removeLoadingStatus() {
    const load = document.getElementById("load");
    
    if (load) {
        load.remove();
    }

    weatherDisplay.removeAttribute("class");
}

function searchHandler(e) {
    if (e.key === "Enter") {
        displayLoadingStatus();

        if (searchInput.value !== "") {
            emptyElement(select);

            const coordData = getLocationCoord(searchInput.value);

            coordData.then((coordObject) => {
                if (coordObject.results) {
                    emptyElement(select);

                    coordObject.results.forEach((result) => {
                        const searchOption = document.createElement("option");

                        searchOption.textContent = `${result.name} (${result.country})`;
                        searchOption.value = `${result.latitude}|${result.longitude}`;

                        select.appendChild(searchOption);
                    })

                    displayWeatherData(select.value);
                } else {
                    alert("Search Failed: No results available.");

                    removeLoadingStatus();
                }
            })
        }
    }
}

function callDisplayFunction() {
    displayLoadingStatus();
    displayWeatherData(select.value);
}

searchInput.addEventListener("keydown", searchHandler);
select.addEventListener("change", callDisplayFunction);

function interpretWeatherCode(code) {
    if (code === 0) {
        return "Clear Sky";
    }

    if (code >= 1 && code <= 3) {
        return "Cloudy";
    }

    if (code === 45 || code === 48) {
        return "Foggy";
    }

    if (code >= 51 && code <= 67 || code >= 80 && code <= 82) {
        return "Rain Or Some Form Of It";
    }

    if (code >= 71 && code <= 75) {
        return "Snow Fall";
    }

    if (code === 95 || code === "95*") {
        return "Thunderstorm";
    }

    return `Code: ${code}`;
}

async function displayWeatherData(coord) {
    const weatherData = await processData(getWeatherData(coord));

    removeLoadingStatus();

    emptyElement(weatherDisplay);

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

        temp.textContent = weatherData.current.temp + "°C";
        date.textContent = weatherData.current.time.split("T").reverse().join(" | ");
        codeDescript.textContent = interpretWeatherCode(weatherData.current.weatherCode);

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

            temp.textContent = weatherData.daily.meanTemp[i] + "°C";
            date.textContent = weatherData.daily.time[i];
            codeDescript.textContent = interpretWeatherCode(weatherData.daily.weatherCode[i]);

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

function toggleData(e) {
    if (e.target.className !== "selected") {
        selectButton();

        if (select.value !== "") {
            displayLoadingStatus();
            displayWeatherData(select.value);
        }
    }
}

currentButton.addEventListener("click", toggleData);
dailyButton.addEventListener("click", toggleData);