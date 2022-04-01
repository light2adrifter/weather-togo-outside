// pulls weather information for particular area using lattitude and longitude coordinates, grabs our weather data
var getWeather = function (lon, lat, name) {
    var apiUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly&appid=840b68ab7f22c971cd6b63d53b3d68b4&units=imperial`;

    fetch(apiUrl).then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
                console.log(data, name);
                displayWeather(data, name);
                displayForcast(data);
            })
        }
        else {
            console.log("error")
        }
    })
};
//  required to get lat, lon, for above api call
var getCoords = function (city) {
    var apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=840b68ab7f22c971cd6b63d53b3d68b4&units=imperial`;

    fetch(apiUrl).then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
                getWeather(data.coord.lon, data.coord.lat, data.name);
                getSaveHistory(city);
            })
        }
        else {
            console.log("error")
        }
    })
};

// uses weather api call to create html
var displayWeather = function (weather, name) {
    var currentWeatherEl = document.querySelector(".currentWeather");

    currentWeatherEl.innerHTML = `
        <h2>
            <span>${name} ${moment().format('l')}</span>
            <img src="http://openweathermap.org/img/wn/${weather.current.weather[0].icon}@2x.png" alt="Sky">
        </h2>
        <ul>
            <li>Temp: ${weather.current.temp}\u00B0F</li>
            <li>Wind: ${weather.current.wind_speed} MPH</li>
            <li>Humidity: ${weather.current.humidity} %</li>
            <li>UV Index: <span class="index-uv">${weather.current.uvi}</span></li>
        </ul>
    `;

    indexUVColor(weather);
};

// changes UV color based on UV number
var indexUVColor = function (weather) {
    var indexUV = weather.current.uvi;
    var indexUVEl = $(".index-uv");

    switch (true) {
        case (indexUV <= 2): indexUVEl.css("background-color", "rgba(0, 250, 0, .5)")
            break;
        case (indexUV <=5): indexUVEl.css("background-color", "rgba(250, 250, 0, 0.5)")
            break;
        case (indexUV <=7): indexUVEl.css("background-color", "rgba(250, 100, 0, 0.5)")
            break;
        case (indexUV >7): indexUVEl.css("background-color", "rgba(250, 0, 0, .5)")
            break;
    }
}

// for loop for future day forecast
var displayForcast = function (weather) {
    var forcast = $(".forcast");
    var date = moment();

    for (var i = 1; i < 6; i++) {
        date.add(1, 'days');

        forcast.children('li').eq(i - 1).html(`
            <h4>${date.format('l')}</h4>
            <div><img src="http://openweathermap.org/img/wn/${weather.daily[i].weather[0].icon}@2x.png" alt="Sky"></div>
            <div>Temp: ${weather.daily[i].temp.day}\u00B0F</div>
            <div>Wind: ${weather.daily[i].wind_speed} MPH</div>
            <div>Humidity: ${weather.daily[i].humidity} %</div>
        `);
    }
}

// retrieves input on button submission
var getInput = function (event) {
    event.preventDefault();

    cityInput = $(".cityInput").val();
    if (cityInput) {
        getCoords(cityInput);
        $(".cityInput").val('');
    }
};

// Sets local storage, if none creates it, limits to 4 held 
var getSaveHistory = function (cityInput) {
    cityInputList = localStorage.getItem('key');

    if (!cityInput && cityInputList) {
        cityInputList = JSON.parse(cityInputList);
    }
    else if (cityInputList) {
        cityInputList = JSON.parse(cityInputList);
        if (cityInputList[0] != cityInput) {
            cityInputList.unshift(cityInput);
        }
    }
    else if (cityInput) {
        cityInputList = [cityInput];
    }

    if (cityInputList) {
        if (cityInputList.length > 4) {
            cityInputList.splice(4);
        }

        localStorage.setItem('key', JSON.stringify(cityInputList));

        console.log(cityInputList);
        displayHistory(cityInputList);
    }
};

// Shows previous searches on left side
var displayHistory = function (cityInputList) {
    var historyItem = $(".history");
    for (var i = 0; i < cityInputList.length; i++) {
        historyItem.children().eq(i).html(cityInputList[i]);
        historyItem.children().eq(i).css("display", "list-item");
    }
};

// Inputs history info into getCords()
var clickHistory = function (event) {
    var city = $(event.target);

    if (city.is('li')) {
        getCoords(city.html());
    }
};

// Array holding our history
var cityInputList = [];

// startup showing city
getCoords('Amsterdam');

// used actions for search submission and history selection.
$("form").on("submit", getInput);
$(".history").on("click", clickHistory);