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

var getLatAndLon = function (city) {
    var apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=840b68ab7f22c971cd6b63d53b3d68b4&units=imperial`;

    fetch(apiUrl).then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
                getWeather(data.coord.lon, data.coord.lat, data.name);
                getAndSaveHistory(city);
            })
        }
        else {
            console.log("error")
        }
    })
};


var displayWeather = function (weather, name) {
    var currentDayWeatherEl = document.querySelector(".currentDayWeather");

    currentDayWeatherEl.innerHTML = `
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


var indexUVColor = function (weather) {
    var indexUV = weather.current.uvi;
    var indexUVEl = $(".index-uv");

    if (indexUV <= 2) {
        indexUVEl.css("background-color", "green");
    }
    else if (indexUV <= 5) {
        indexUVEl.css("background-color", "yellow");
    }
    else if (indexUV <= 7) {
        indexUVEl.css("background-color", "orange");
    }
    else if (indexUV <= 10) {
        indexUVEl.css("background-color", "red");
    }
    else {
        indexUVEl.css("background-color", "purple");
    }
}


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


var getInput = function (event) {
    event.preventDefault();

    cityInput = $(".cityInput").val();
    if (cityInput) {
        getLatAndLon(cityInput);
        $(".cityInput").val('');
    }
};


var getAndSaveHistory = function (cityInput) {
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
        if (cityInputList.length > 8) {
            cityInputList.splice(8);
        }

        localStorage.setItem('key', JSON.stringify(cityInputList));

        console.log(cityInputList);
        displayHistory(cityInputList);
    }
};


var displayHistory = function (cityInputList) {
    var historyItem = $(".history");
    for (var i = 0; i < cityInputList.length; i++) {
        historyItem.children().eq(i).html(cityInputList[i]);
        historyItem.children().eq(i).css("display", "list-item");
    }
};


var clickHistory = function (event) {
    var city = $(event.target);

    if (city.is('li')) {
        getLatAndLon(city.html());
    }
};


var cityInputList = [];

getLatAndLon('Amsterdam');

$("form").on("submit", getInput);
$(".history").on("click", clickHistory);