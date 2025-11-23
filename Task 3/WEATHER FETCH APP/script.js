/* Advanced Weather Dashboard
   Features:
   - geocoding via open-meteo geocoding API
   - forecast via open-meteo forecast API (current, hourly, daily)
   - hourly chart (Chart.js)
   - 7-day cards, weather icons mapping
   - GPS auto-detect
   - loader and localStorage (last searched city)
*/

const API = {
  geocode: (q) => `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=5&language=en&format=json`,
  forecast: (lat, lon) => `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,precipitation&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`
};

// DOM
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const gpsBtn = document.getElementById('gpsBtn');
const clearBtn = document.getElementById('clearBtn');

const loader = document.getElementById('loader');

const cityNameEl = document.getElementById('cityName');
const localTimeEl = document.getElementById('localTime');
const currentTempEl = document.getElementById('currentTemp');
const currentDescEl = document.getElementById('currentDesc');
const currentIconEl = document.getElementById('currentIcon');
const feelsEl = document.getElementById('feels');
const windEl = document.getElementById('wind');
const windDirEl = document.getElementById('windDir');
const pressureEl = document.getElementById('pressure');
const humidityEl = document.getElementById('humidity');
const visibilityEl = document.getElementById('visibility');
const updatedEl = document.getElementById('updated');

const dailyGrid = document.getElementById('dailyGrid');
const hourlyCtx = document.getElementById('hourlyChart').getContext('2d');

let hourlyChart = null;

// helpers
function showLoader() { loader.classList.remove('hidden'); }
function hideLoader() { loader.classList.add('hidden'); }

function saveLastCity(name){ localStorage.setItem('weather_last_city', name); }
function loadLastCity(){ return localStorage.getItem('weather_last_city') || null; }
function clearLastCity(){ localStorage.removeItem('weather_last_city'); }

function mapWeatherCode(code){
  // simplified mapping based on Open-Meteo weather codes
  // returns { icon, text }
  if (code === 0) return {icon:'☀️', text:'Clear sky'};
  if (code === 1 || code === 2) return {icon:'🌤️', text:'Partly cloudy'};
  if (code === 3) return {icon:'☁️', text:'Overcast'};
  if (code === 45 || code === 48) return {icon:'🌫️', text:'Fog'};
  if (code >= 51 && code <= 57) return {icon:'🌦️', text:'Drizzle'};
  if (code >= 61 && code <= 67) return {icon:'🌧️', text:'Rain'};
  if (code >= 71 && code <= 77) return {icon:'❄️', text:'Snow'};
  if (code >= 80 && code <= 82) return {icon:'🌦️', text:'Showers'};
  if (code >= 95 && code <= 99) return {icon:'⛈️', text:'Thunderstorm'};
  return {icon:'🌈', text:'Weather'};
}

function degreesToCompass(num){
  const val = Math.floor((num / 22.5) + 0.5);
  const arr = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
  return arr[(val % 16)];
}

function utcToLocalString(dtStr, timezone){
  try {
    const d = new Date(dtStr);
    return d.toLocaleString([], { hour: '2-digit', minute:'2-digit', weekday:'short', month:'short', day:'numeric' });
  } catch {
    return dtStr;
  }
}

// fetch functions
async function fetchCoordinates(city){
  const url = API.geocode(city);
  const res = await fetch(url);
  if (!res.ok) throw new Error('Geocoding request failed');
  const data = await res.json();
  if (!data.results || data.results.length === 0) throw new Error('City not found');
  // pick first result
  return data.results[0]; // has latitude, longitude, name, country, timezone
}

async function fetchForecast(lat, lon){
  const url = API.forecast(lat, lon);
  const res = await fetch(url);
  if (!res.ok) throw new Error('Forecast request failed');
  const data = await res.json();
  return data;
}

// renderers
function renderCurrent(location, forecast){
  const cw = forecast.current_weather;
  const tz = forecast.timezone;

  const weatherInfo = mapWeatherCode(cw.weathercode);

  cityNameEl.textContent = `${location.name}, ${location.country}`;
  localTimeEl.textContent = `Timezone: ${tz}`;
  currentTempEl.textContent = `${cw.temperature.toFixed(1)}°C`;
  currentDescEl.textContent = weatherInfo.text;
  currentIconEl.textContent = weatherInfo.icon;
  feelsEl.textContent = `${cw.temperature.toFixed(1)}°C`;

  windEl.textContent = `${cw.windspeed} km/h`;
  windDirEl.textContent = `${degreesToCompass(cw.winddirection)} (${cw.winddirection}°)`;
  pressureEl.textContent = '—'; // open-meteo current doesn't provide pressure in that endpoint
  humidityEl.textContent = '—'; // not directly in current_weather (we use hourly for humidity)
  visibilityEl.textContent = '—';
  updatedEl.textContent = utcToLocalString(cw.time);
}

function renderHourly(forecast){
  // hourly.temperature_2m has many hours — pick next 24 from current index
  const times = forecast.hourly.time; // ISO strings
  const temps = forecast.hourly.temperature_2m;
  const humidity = forecast.hourly.relativehumidity_2m || [];
  // build next 24 entries from now
  const now = new Date();
  const labels = [];
  const data = [];
  for (let i=0; i<24; i++){
    const idx = i; // use sequential from start — timezone=auto ensures alignment
    if (times[idx] === undefined) break;
    const t = new Date(times[idx]);
    labels.push(t.getHours() + ':00');
    data.push(temps[idx]);
  }

  // render Chart.js
  if (hourlyChart) hourlyChart.destroy();

  hourlyChart = new Chart(hourlyCtx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Temperature (°C)',
        data,
        fill: true,
        backgroundColor: 'rgba(90,200,255,0.12)',
        borderColor: 'rgba(90,200,255,0.9)',
        pointRadius: 3,
        tension: 0.35
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: '#cfeeff' } },
        y: { ticks: { color: '#cfeeff' } }
      }
    }
  });
}

function renderDaily(forecast){
  const dates = forecast.daily.time;
  const tmax = forecast.daily.temperature_2m_max;
  const tmin = forecast.daily.temperature_2m_min;
  const wcodes = forecast.daily.weathercode;
  dailyGrid.innerHTML = '';
  for (let i=0;i<dates.length;i++){
    const d = new Date(dates[i]);
    const day = d.toLocaleDateString([], { weekday: 'short' });
    const w = mapWeatherCode(wcodes[i] ?? 0);
    const el = document.createElement('div');
    el.className = 'day-card';
    el.innerHTML = `
      <div class="date">${day}</div>
      <div class="icon">${w.icon}</div>
      <div class="temps">${Math.round(tmax[i])}° / ${Math.round(tmin[i])}°</div>
      <div class="wtext" style="color:var(--muted);font-size:0.85rem">${w.text}</div>
    `;
    dailyGrid.appendChild(el);
  }
}

// main flow
async function searchCity(city){
  try {
    showLoader();
    const loc = await fetchCoordinates(city);
    saveLastCity(loc.name);
    const forecast = await fetchForecast(loc.latitude, loc.longitude);
    renderEverything(loc, forecast);
  } catch (err) {
    alert(err.message || 'Error');
  } finally {
    hideLoader();
  }
}

async function useGeolocation(){
  try {
    showLoader();
    if (!navigator.geolocation) throw new Error('Geolocation not supported');
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      // reverse geocode: use geocoding API with lat/lon -> search by lat,lon not directly supported so call geocoding with nearby search by name empty
      // Open-Meteo geocoding supports 'reverse' param: ?latitude=...&longitude=...
      const url = `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&language=en`;
      const r = await fetch(url);
      if (!r.ok) throw new Error('Reverse geocoding failed');
      const data = await r.json();
      const loc = data || {};
      const locObj = {
        name: loc.name || 'Your location',
        country: loc.country || '',
        latitude: lat,
        longitude: lon
      };
      saveLastCity(locObj.name);
      const forecast = await fetchForecast(lat, lon);
      renderEverything(locObj, forecast);
      hideLoader();
    }, (err) => {
      hideLoader();
      alert('Unable to get location: ' + err.message);
    }, { enableHighAccuracy: false, timeout: 10000 });
  } catch(err){
    hideLoader();
    alert(err.message);
  }
}

function renderEverything(location, forecast){
  renderCurrent(location, forecast);
  renderHourly(forecast);
  renderDaily(forecast);
}

// wire events
searchBtn.addEventListener('click', () => {
  const v = cityInput.value.trim();
  if (!v) { alert('Type a city name'); return; }
  searchCity(v);
});

cityInput.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') searchBtn.click();
});

gpsBtn.addEventListener('click', () => useGeolocation());

clearBtn.addEventListener('click', () => {
  clearLastCity();
  alert('Saved city cleared');
});

// on load: check saved city
window.addEventListener('load', async () => {
  const last = loadLastCity();
  if (last) {
    cityInput.value = last;
    searchCity(last);
  }
});
