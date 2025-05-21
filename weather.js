"use strict";

async function getWeatherData(lat, long) {
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&daily=temperature_2m_mean,weather_code&current=temperature_2m,weather_code&timezone=auto`
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

// console.log(processData(getWeatherData(43.470861, 143.314163)));

const searchInput = document.getElementById("search");
const select = document.querySelector("select");

function searchHandler(e) {
    if (e.key === "Enter") {
        if (searchInput.value !== "") {
            const coordData = getLocationCoord(searchInput.value);

            coordData.then((coordObject) => {
                console.log(coordObject);
            })
        }
    }
}

searchInput.addEventListener("keydown", searchHandler);

const currentButton = document.getElementById("current");
const dailyButton = document.getElementById("daily");
const weatherDisplay = document.getElementById("weather-display");

function emptyDisplay() {
    while (weatherDisplay.firstChild) {
        weatherDisplay.firstChild.remove();
    }
}

async function displayWeatherData(lat, long) {
    const weatherData = await processData(getWeatherData(lat, long));

    if (currentButton.classList.contains("selected")) {
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

    if (dailyButton.classList.contains("selected")) {
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

displayWeatherData(43.470861, 143.314163);