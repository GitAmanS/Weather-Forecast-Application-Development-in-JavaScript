const API_KEY = '44473efb7cb26143190f7d2899b22f68'; 

document.getElementById('search-btn').addEventListener('click', async () => {
  const city = document.getElementById('city-input').value.trim();
  if (city) {
    try {
      const data = await fetchWeather(city);
      displayWeather(data);
      const forecastData = await fetchExtendedForecast(city);
      displayExtendedForecast(forecastData);
      saveRecentCity(city);
    } catch (error) {
      displayError(error.message);
    }
  } else {
    displayError('Please enter a city name.');
  }
});

document.getElementById('current-location-btn').addEventListener('click', () => {
  navigator.geolocation.getCurrentPosition(async (position) => {
    const { latitude, longitude } = position.coords;
    try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`);
      const data = await response.json();
      if (response.ok) {
        displayWeather(data);
        const forecastData = await fetchExtendedForecastByCoordinates(latitude, longitude);
        displayExtendedForecast(forecastData);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      displayError(error.message);
    }
  }, () => {
    displayError('Unable to retrieve your location.');
  });
});

async function fetchExtendedForecastByCoordinates(latitude, longitude) {
  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`);
    const data = await response.json();
    if (response.ok) {
      return data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error fetching extended forecast:', error);
    throw error;
  }
}

async function fetchWeather(city) {
  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
    const data = await response.json();
    if (response.ok) {
      return data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
}

async function fetchExtendedForecast(city) {
  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`);
    const data = await response.json();
    if (response.ok) {
      return data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error fetching extended forecast:', error);
    throw error;
  }
}

function displayWeather(data) {
  const weatherDiv = document.getElementById('weather-data');
  weatherDiv.innerHTML = `
    <div id="weather-data-container">
      <h2 class="text-2xl font-bold">${data.name}</h2>
      
      <p>Temperature: ${data.main.temp} °C</p>
      <p>Humidity: ${data.main.humidity} %</p>
      <p>Wind Speed: ${data.wind.speed} m/s</p>
    </div>
    <div id="weather-icon" class="flex flex-col items-center justify-center">
      <img src="http://openweathermap.org/img/wn/${data.weather[0].icon}.png" alt="Weather icon" class="w-16 h-16">
      <p>${data.weather[0].description}</p>
    </div>

    
  `;
  weatherDiv.classList.remove('hidden');
}

function displayExtendedForecast(data) {
  const forecastDiv = document.getElementById('forecast-data');
  forecastDiv.innerHTML = data.list.slice(0, 5).map(forecast => `
    <div class="forecast-item mb-4 bg-gray-300 p-4 rounded-lg">
      <p>${new Date(forecast.dt_txt).toLocaleDateString()}</p>
      <img src="http://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" alt="Weather icon">
      <p>Temperature: ${forecast.main.temp} °C</p>
      <p>Wind: ${forecast.wind.speed} m/s</p>
      <p>Humidity: ${forecast.main.humidity} %</p>
    </div>
  `).join('');
  forecastDiv.classList.remove('hidden');
}

function displayError(message) {
  const weatherDiv = document.getElementById('weather-data');
  weatherDiv.innerHTML = `<p class="text-red-500">${message}</p>`;
  weatherDiv.classList.remove('hidden');
}

function saveRecentCity(city) {
  let recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
  if (!recentCities.includes(city)) {
    recentCities.push(city);
    localStorage.setItem('recentCities', JSON.stringify(recentCities));
    updateRecentCitiesDropdown();
  }
}

function updateRecentCitiesDropdown() {
  const dropdown = document.getElementById('recent-cities-dropdown');
  dropdown.innerHTML = '';
  const recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
  recentCities.forEach(city => {
    const option = document.createElement('option');
    option.value = city;
    option.textContent = city;
    dropdown.appendChild(option);
  });
}

document.getElementById('recent-cities-dropdown').addEventListener('change', async (event) => {
  const city = event.target.value;
  try {
    const data = await fetchWeather(city);
    displayWeather(data);
  } catch (error) {
    displayError(error.message);
  }
});
