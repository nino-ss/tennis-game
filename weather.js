class WeatherApp {
    constructor() {
        // OpenWeatherMap API key (you'll need to get your own from openweathermap.org)
        this.apiKey = 'YOUR_API_KEY_HERE'; // Replace with your actual API key
        this.baseUrl = 'https://api.openweathermap.org/data/2.5';
        
        this.initElements();
        this.initEventListeners();
        this.updateDateTime();
        
        // デフォルト都市を読み込み
        this.getWeatherData('東京');
    }
    
    initElements() {
        this.cityInput = document.getElementById('cityInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.locationBtn = document.getElementById('locationBtn');
        this.loading = document.getElementById('loading');
        this.errorMessage = document.getElementById('errorMessage');
        this.errorText = document.getElementById('errorText');
        this.weatherContainer = document.getElementById('weatherContainer');
        
        // Weather display elements
        this.cityName = document.getElementById('cityName');
        this.country = document.getElementById('country');
        this.date = document.getElementById('date');
        this.temp = document.getElementById('temp');
        this.weatherIcon = document.getElementById('weatherIcon');
        this.description = document.getElementById('description');
        this.feelsLike = document.getElementById('feelsLike');
        this.visibility = document.getElementById('visibility');
        this.humidity = document.getElementById('humidity');
        this.windSpeed = document.getElementById('windSpeed');
        this.pressure = document.getElementById('pressure');
        this.uvIndex = document.getElementById('uvIndex');
        this.clouds = document.getElementById('clouds');
        this.forecastList = document.getElementById('forecastList');
    }
    
    initEventListeners() {
        this.searchBtn.addEventListener('click', () => {
            const city = this.cityInput.value.trim();
            if (city) {
                this.getWeatherData(city);
            }
        });
        
        this.cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const city = this.cityInput.value.trim();
                if (city) {
                    this.getWeatherData(city);
                }
            }
        });
        
        this.locationBtn.addEventListener('click', () => {
            this.getUserLocation();
        });
    }
    
    showLoading() {
        this.loading.style.display = 'block';
        this.errorMessage.style.display = 'none';
        this.weatherContainer.style.display = 'none';
    }
    
    hideLoading() {
        this.loading.style.display = 'none';
    }
    
    showError(message) {
        this.errorText.textContent = message;
        this.errorMessage.style.display = 'block';
        this.weatherContainer.style.display = 'none';
        this.hideLoading();
    }
    
    showWeatherData() {
        this.errorMessage.style.display = 'none';
        this.weatherContainer.style.display = 'block';
        this.hideLoading();
    }
    
    async getWeatherData(city) {
        if (this.apiKey === 'YOUR_API_KEY_HERE') {
            this.showMockData(city);
            return;
        }
        
        this.showLoading();
        
        try {
            const currentWeatherUrl = `${this.baseUrl}/weather?q=${city}&appid=${this.apiKey}&units=metric`;
            const forecastUrl = `${this.baseUrl}/forecast?q=${city}&appid=${this.apiKey}&units=metric`;
            
            const [currentResponse, forecastResponse] = await Promise.all([
                fetch(currentWeatherUrl),
                fetch(forecastUrl)
            ]);
            
            if (!currentResponse.ok || !forecastResponse.ok) {
                throw new Error('City not found');
            }
            
            const currentData = await currentResponse.json();
            const forecastData = await forecastResponse.json();
            
            this.displayCurrentWeather(currentData);
            this.displayForecast(forecastData);
            this.showWeatherData();
            
        } catch (error) {
            this.showError('都市が見つかりません。別の場所を試してください。');
        }
    }
    
    async getWeatherByCoords(lat, lon) {
        if (this.apiKey === 'YOUR_API_KEY_HERE') {
            this.showMockData('Your Location');
            return;
        }
        
        this.showLoading();
        
        try {
            const currentWeatherUrl = `${this.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`;
            const forecastUrl = `${this.baseUrl}/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`;
            
            const [currentResponse, forecastResponse] = await Promise.all([
                fetch(currentWeatherUrl),
                fetch(forecastUrl)
            ]);
            
            if (!currentResponse.ok || !forecastResponse.ok) {
                throw new Error('Unable to get weather data');
            }
            
            const currentData = await currentResponse.json();
            const forecastData = await forecastResponse.json();
            
            this.displayCurrentWeather(currentData);
            this.displayForecast(forecastData);
            this.showWeatherData();
            
        } catch (error) {
            this.showError('現在地の天気データを取得できません。');
        }
    }
    
    getUserLocation() {
        if (navigator.geolocation) {
            this.showLoading();
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    this.getWeatherByCoords(latitude, longitude);
                },
                (error) => {
                    this.showError('現在地を取得できません。都市名で検索してください。');
                }
            );
        } else {
            this.showError('このブラウザでは位置情報の取得がサポートされていません。');
        }
    }
    
    displayCurrentWeather(data) {
        this.cityName.textContent = data.name;
        this.country.textContent = data.sys.country;
        this.temp.textContent = `${Math.round(data.main.temp)}°C`;
        this.description.textContent = data.weather[0].description;
        this.feelsLike.textContent = `体感温度 ${Math.round(data.main.feels_like)}°C`;
        
        // Weather details
        this.visibility.textContent = `${(data.visibility / 1000).toFixed(1)} km`;
        this.humidity.textContent = `${data.main.humidity}%`;
        this.windSpeed.textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
        this.pressure.textContent = `${data.main.pressure} hPa`;
        this.clouds.textContent = `${data.clouds.all}%`;
        
        // Set weather icon
        this.setWeatherIcon(data.weather[0].main, data.weather[0].icon);
    }
    
    displayForecast(data) {
        this.forecastList.innerHTML = '';
        
        // Get one forecast per day (every 8th item since API returns 3-hour intervals)
        const dailyForecasts = data.list.filter((item, index) => index % 8 === 0).slice(0, 5);
        
        dailyForecasts.forEach(forecast => {
            const forecastItem = document.createElement('div');
            forecastItem.className = 'forecast-item';
            
            const date = new Date(forecast.dt * 1000);
            const dayName = date.toLocaleDateString('ja-JP', { weekday: 'short' });
            
            forecastItem.innerHTML = `
                <div class="day">${dayName}</div>
                <div class="forecast-icon">
                    <i class="${this.getWeatherIconClass(forecast.weather[0].main, forecast.weather[0].icon)}"></i>
                </div>
                <div class="forecast-temp">
                    <span class="high-temp">${Math.round(forecast.main.temp_max)}°</span>
                    <span class="low-temp">${Math.round(forecast.main.temp_min)}°</span>
                </div>
                <div class="forecast-desc">${forecast.weather[0].description}</div>
            `;
            
            this.forecastList.appendChild(forecastItem);
        });
    }
    
    setWeatherIcon(weatherMain, iconCode) {
        const iconClass = this.getWeatherIconClass(weatherMain, iconCode);
        this.weatherIcon.className = iconClass;
    }
    
    getWeatherIconClass(weatherMain, iconCode) {
        const iconMap = {
            'Clear': 'fas fa-sun',
            'Clouds': 'fas fa-cloud',
            'Rain': 'fas fa-cloud-rain',
            'Drizzle': 'fas fa-cloud-drizzle',
            'Thunderstorm': 'fas fa-bolt',
            'Snow': 'fas fa-snowflake',
            'Mist': 'fas fa-smog',
            'Smoke': 'fas fa-smog',
            'Haze': 'fas fa-smog',
            'Dust': 'fas fa-smog',
            'Fog': 'fas fa-smog',
            'Sand': 'fas fa-smog',
            'Ash': 'fas fa-smog',
            'Squall': 'fas fa-wind',
            'Tornado': 'fas fa-tornado'
        };
        
        return iconMap[weatherMain] || 'fas fa-cloud';
    }
    
    updateDateTime() {
        const now = new Date();
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        this.date.textContent = now.toLocaleDateString('ja-JP', options);
        
        // Update every minute
        setTimeout(() => this.updateDateTime(), 60000);
    }
    
    // 都市ごとの天気データベース
    getCityWeatherData() {
        return {
            '東京': {
                current: {
                    name: '東京',
                    sys: { country: '日本' },
                    main: { temp: 25, feels_like: 28, humidity: 70, pressure: 1015 },
                    weather: [{ main: 'Clear', description: '晴れ', icon: '01d' }],
                    visibility: 12000,
                    wind: { speed: 3.2 },
                    clouds: { all: 15 }
                },
                forecast: [
                    { temp_max: 27, temp_min: 20, weather: { main: 'Clear', description: '晴れ', icon: '01d' } },
                    { temp_max: 24, temp_min: 18, weather: { main: 'Clouds', description: '曇り', icon: '02d' } },
                    { temp_max: 22, temp_min: 16, weather: { main: 'Rain', description: '雨', icon: '10d' } },
                    { temp_max: 26, temp_min: 19, weather: { main: 'Clear', description: '晴れ', icon: '01d' } },
                    { temp_max: 28, temp_min: 21, weather: { main: 'Clear', description: '晴れ', icon: '01d' } }
                ],
                uvIndex: '7'
            },
            '大阪': {
                current: {
                    name: '大阪',
                    sys: { country: '日本' },
                    main: { temp: 23, feels_like: 26, humidity: 75, pressure: 1012 },
                    weather: [{ main: 'Clouds', description: '曇り', icon: '02d' }],
                    visibility: 9000,
                    wind: { speed: 2.8 },
                    clouds: { all: 60 }
                },
                forecast: [
                    { temp_max: 25, temp_min: 18, weather: { main: 'Clouds', description: '曇り', icon: '02d' } },
                    { temp_max: 22, temp_min: 16, weather: { main: 'Rain', description: '雨', icon: '10d' } },
                    { temp_max: 24, temp_min: 17, weather: { main: 'Clear', description: '晴れ', icon: '01d' } },
                    { temp_max: 26, temp_min: 19, weather: { main: 'Clear', description: '晴れ', icon: '01d' } },
                    { temp_max: 27, temp_min: 20, weather: { main: 'Clouds', description: '曇り', icon: '02d' } }
                ],
                uvIndex: '6'
            },
            '札幌': {
                current: {
                    name: '札幌',
                    sys: { country: '日本' },
                    main: { temp: 18, feels_like: 19, humidity: 60, pressure: 1020 },
                    weather: [{ main: 'Clear', description: '晴れ', icon: '01d' }],
                    visibility: 15000,
                    wind: { speed: 4.5 },
                    clouds: { all: 10 }
                },
                forecast: [
                    { temp_max: 20, temp_min: 12, weather: { main: 'Clear', description: '晴れ', icon: '01d' } },
                    { temp_max: 17, temp_min: 10, weather: { main: 'Clouds', description: '曇り', icon: '02d' } },
                    { temp_max: 15, temp_min: 8, weather: { main: 'Rain', description: '雨', icon: '10d' } },
                    { temp_max: 19, temp_min: 11, weather: { main: 'Clear', description: '晴れ', icon: '01d' } },
                    { temp_max: 21, temp_min: 13, weather: { main: 'Clear', description: '晴れ', icon: '01d' } }
                ],
                uvIndex: '4'
            },
            '沖縄': {
                current: {
                    name: '沖縄',
                    sys: { country: '日本' },
                    main: { temp: 29, feels_like: 34, humidity: 85, pressure: 1008 },
                    weather: [{ main: 'Rain', description: '雨', icon: '10d' }],
                    visibility: 8000,
                    wind: { speed: 6.2 },
                    clouds: { all: 80 }
                },
                forecast: [
                    { temp_max: 31, temp_min: 26, weather: { main: 'Rain', description: '雨', icon: '10d' } },
                    { temp_max: 30, temp_min: 25, weather: { main: 'Thunderstorm', description: '雷雨', icon: '11d' } },
                    { temp_max: 28, temp_min: 24, weather: { main: 'Clouds', description: '曇り', icon: '02d' } },
                    { temp_max: 32, temp_min: 27, weather: { main: 'Clear', description: '晴れ', icon: '01d' } },
                    { temp_max: 33, temp_min: 28, weather: { main: 'Clear', description: '晴れ', icon: '01d' } }
                ],
                uvIndex: '9'
            },
            'ニューヨーク': {
                current: {
                    name: 'ニューヨーク',
                    sys: { country: 'アメリカ' },
                    main: { temp: 20, feels_like: 22, humidity: 55, pressure: 1018 },
                    weather: [{ main: 'Clouds', description: '曇り', icon: '02d' }],
                    visibility: 11000,
                    wind: { speed: 5.1 },
                    clouds: { all: 45 }
                },
                forecast: [
                    { temp_max: 22, temp_min: 15, weather: { main: 'Clouds', description: '曇り', icon: '02d' } },
                    { temp_max: 19, temp_min: 12, weather: { main: 'Rain', description: '雨', icon: '10d' } },
                    { temp_max: 24, temp_min: 16, weather: { main: 'Clear', description: '晴れ', icon: '01d' } },
                    { temp_max: 26, temp_min: 18, weather: { main: 'Clear', description: '晴れ', icon: '01d' } },
                    { temp_max: 23, temp_min: 17, weather: { main: 'Clouds', description: '曇り', icon: '02d' } }
                ],
                uvIndex: '5'
            },
            'ロンドン': {
                current: {
                    name: 'ロンドン',
                    sys: { country: 'イギリス' },
                    main: { temp: 15, feels_like: 16, humidity: 80, pressure: 1010 },
                    weather: [{ main: 'Rain', description: '小雨', icon: '10d' }],
                    visibility: 7000,
                    wind: { speed: 3.8 },
                    clouds: { all: 90 }
                },
                forecast: [
                    { temp_max: 17, temp_min: 10, weather: { main: 'Rain', description: '小雨', icon: '10d' } },
                    { temp_max: 14, temp_min: 8, weather: { main: 'Clouds', description: '曇り', icon: '02d' } },
                    { temp_max: 18, temp_min: 11, weather: { main: 'Clear', description: '晴れ', icon: '01d' } },
                    { temp_max: 16, temp_min: 9, weather: { main: 'Rain', description: '雨', icon: '10d' } },
                    { temp_max: 19, temp_min: 12, weather: { main: 'Clouds', description: '曇り', icon: '02d' } }
                ],
                uvIndex: '3'
            },
            'パリ': {
                current: {
                    name: 'パリ',
                    sys: { country: 'フランス' },
                    main: { temp: 17, feels_like: 18, humidity: 65, pressure: 1015 },
                    weather: [{ main: 'Clear', description: '晴れ', icon: '01d' }],
                    visibility: 13000,
                    wind: { speed: 2.5 },
                    clouds: { all: 25 }
                },
                forecast: [
                    { temp_max: 20, temp_min: 12, weather: { main: 'Clear', description: '晴れ', icon: '01d' } },
                    { temp_max: 18, temp_min: 10, weather: { main: 'Clouds', description: '曇り', icon: '02d' } },
                    { temp_max: 16, temp_min: 9, weather: { main: 'Rain', description: '雨', icon: '10d' } },
                    { temp_max: 21, temp_min: 13, weather: { main: 'Clear', description: '晴れ', icon: '01d' } },
                    { temp_max: 23, temp_min: 15, weather: { main: 'Clear', description: '晴れ', icon: '01d' } }
                ],
                uvIndex: '4'
            }
        };
    }

    // Mock data for demonstration when API key is not provided
    showMockData(cityName) {
        setTimeout(() => {
            const weatherData = this.getCityWeatherData();
            const cityData = weatherData[cityName] || weatherData['東京']; // デフォルトは東京
            
            const mockCurrentData = cityData.current;
            
            const mockForecastData = {
                list: cityData.forecast.map((item, index) => ({
                    dt: Date.now() / 1000 + (index * 86400),
                    main: { temp_max: item.temp_max, temp_min: item.temp_min },
                    weather: [item.weather]
                }))
            };
            
            this.displayCurrentWeather(mockCurrentData);
            this.displayForecast(mockForecastData);
            this.uvIndex.textContent = cityData.uvIndex;
            this.showWeatherData();
        }, 1000);
    }
}

// Initialize the weather app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new WeatherApp();
});