const apiKey = '1237a3bc9d0590251275f8d3a8816b24';//Replace with your OpenWeatherMap API Key
const weatherAPIBase = 'https://api.openweathermap.org/data/2.5';

//DOM Elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const currentLocationBtn = document.getElementById('currentLocationBtn');
const weatherInfo = document.getElementById('weatherInfo');
const extendedForecast = document.getElementById('extendedForecast');
const errorMsg = document.getElementById('errorMsg');
const recentCitiesDropdown = document.getElementById('recentCitiesDropdown');
const forecastCards = document.getElementById('forecastCards');

//Recent Cities Array
let recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];

// Display Recent Cities Dropdown
const updateRecentCitiesDropdown = () => {
  recentCitiesDropdown.innerHTML = '<option value="" disabled>Select a recent city</option>';
  if (recentCities.length) {
    recentCitiesDropdown.classList.remove('hidden');
    recentCities.forEach((city) => {
      const option = document.createElement('option');
      option.value = city;
      option.textContent = city;
      recentCitiesDropdown.appendChild(option);
    });

    recentCitiesDropdown.addEventListener('change', () => {
      const selectedCity = recentCitiesDropdown.value;
      if (selectedCity) {
        getWeather(selectedCity);
        cityInput.value = selectedCity; // Display the selected city in the input field
        recentCitiesDropdown.value = selectedCity; // Update the dropdown to show the selected city
      }
    });
  } else {
    recentCitiesDropdown.classList.add('hidden');
  }
};

// Save Recent Cities to Local Storage
const saveRecentCity = (city) => {
  if (!recentCities.includes(city)) {
    recentCities.push(city);
    if (recentCities.length > 5) recentCities.shift(); // Limit to 5 cities
    localStorage.setItem('recentCities', JSON.stringify(recentCities));
  }
  updateRecentCitiesDropdown();
  recentCitiesDropdown.value = city; // Automatically select the saved 
};

// Fetch Weather Data
const getWeather = async (city) => {
  try {
    const response = await axios.get(`${weatherAPIBase}/weather?q=${city}&appid=${apiKey}&units=metric`);
    const data = response.data;
    displayWeather(data);
    saveRecentCity(city); // Save city to recent searches and select it
  } 
  catch {
    weatherInfo.classList.add('hidden');
    errorMsg.classList.remove('hidden');
  }
};


//Fetch Weather for Current Location  
const getWeatherByLocation = async (lat, lon) => {
  try{
    const response = await axios.get(`${weatherAPIBase}/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
    displayWeather(response.data); 
  }
  catch{
    errorMsg.classList.remove('hidden');
  }
};

//Fetch 5-day Forecast
const getForecast = async (city) => {
  try{
    const response = await axios.get(`${weatherAPIBase}/forecast?q=${city}&appid=${apiKey}&units=metric`);
    displayForecast(response.data.list);
  }
  catch{
    errorMsg.classList.remove('hidden');
  }
}

// Display Weather Data

const displayWeather = (data) => {
  console.log("Weather icon data:", data.weather[0].icon);

  const { name, main, weather, wind } = data;

  document.getElementById('cityName').textContent = name;
  document.getElementById('temp').textContent = `Temperature: ${main.temp}°C`;
  document.getElementById('weatherDescription').textContent = weather[0].description;
  document.getElementById('humidity').textContent = `Humidity: ${main.humidity}%`;
  document.getElementById('windSpeed').textContent = `Wind Speed: ${wind.speed} m/s`;
  document.getElementById('weatherIcon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

  weatherInfo.classList.remove('hidden');
  errorMsg.classList.add('hidden');

  getForecast(name);
};

//Display Forecast Data
const displayForecast = (forecastList) => {
  forecastCards.innerHTML = '';
  const filteredList = forecastList.filter((_, index) => index % 8 === 0);

  filteredList.forEach((forecast) => {
    const { dt_txt, main, weather, wind } = forecast;

    const card = document.createElement('div');
    card.classList.add('p-4', 'bg-gray-200', 'rounded', 'shadow');

    card.innerHTML = `
    <h4 class="font-bold">${new Date(dt_txt).toLocaleDateString()}</h4>
    <img src="https://openweathermap.org/img/wn/${weather[0].icon}@2x.png" alt="Weather Icon">
    <p>Temp: ${main.temp}°C</p>
    <p>Wind: ${wind.speed} m/s</p>
    <p>Humidity: ${main.humidity}%</p>
     `;

     forecastCards.appendChild(card);
  });

  extendedForecast.classList.remove('hidden');
};

//Event Listeners
searchBtn.addEventListener('click', () => {
  const city = cityInput.value.trim();
  if (city) getWeather(city);
});
  currentLocationBtn.addEventListener('click', () => {
    navigator.geolocation.getCurrentPosition(
      (position) => getWeatherByLocation(position.coords.latitude, position.coords.longitude),
      () => errorMsg.classList.remove('hidden')
    );
    });

// Initialize
updateRecentCitiesDropdown();




