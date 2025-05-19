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

    return object;
}

console.log(processData(getWeatherData(43.470861, 143.314163)));

