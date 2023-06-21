const fs = require('fs');
const axios = require('axios');

class Busquedas {
  historial = [];
  dbPath = './database/db.json';

  constructor() {
    this.leerDB();
  }

  get historialCapitalizado(){
    return this.historial.map( lugar => {
      let palabras = lugar.split(' ')
      palabras = palabras.map( p => p[0].toUpperCase() + p.substring(1));

      return palabras.join(' ');
    })
  }

  getParamsMapBox(){
    return {
      access_token: process.env.MAPBOX_KEY,
      limit: 5,
      language: 'es',
    };
  }
  async buscarCiudad(lugar = '') {
    try {
      const instance = axios.create({
        baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
        params: this.getParamsMapBox(),
      });
      const resp = await instance.get();
      return resp.data.features.map( lugar =>({
        id:lugar.id,
        nombre: lugar.place_name,
        lng: lugar.center[0],
        lat: lugar.center[1],
      }));
    } catch (error) {
      return [];
    }
  }
  getParamsOpenWeather(lat, lon){
    return {
      units: 'metric',
      lat,
      lon,
      appid: process.env.OPENWEATHER_KEY,
      lang: 'es'
    };
  }
  async climaLugar (lat,lon) {
    try {
      const instance = axios.create({
        baseURL:'https://api.openweathermap.org/data/2.5/weather',
        params: this.getParamsOpenWeather(lat, lon)
      })
      const resp = await instance.get();
      const { weather, main } = resp.data;

      return {
      desc: weather[0].description,
      min:main.temp_min,
      max:main.temp_max,
      temp:main.temp
    }
      
    } catch (error) {
      console.error(error);
    }
  }

  agregarHistorial( lugar = ''){
    if (this.historial.includes(lugar.toLocaleLowerCase())) {
      return;
    }
    this.historial.push( lugar.toLocaleLowerCase() );
    this.guardarDB();
  }

  guardarDB(){
    const payload = {
      historial : this.historial
    }
    fs.writeFileSync(this.dbPath, JSON.stringify(payload));
  }

  leerDB(){
    if (!fs.existsSync(this.dbPath)) return;
    const info = fs.readFileSync(this.dbPath, {encoding:'utf-8'});
    const data = JSON.parse(info);
    this.historial = data.historial;
  }
}

module.exports = Busquedas;
