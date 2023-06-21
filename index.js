require('dotenv').config();
const { inquirerMenu, pausa, leerInput, listarLugares } = require('./helpers/inquirer');
const Busquedas = require('./models/busquedas');

const main = async() => {
  let opt;
  const busquedas = new Busquedas();

  do {
    opt = await inquirerMenu();

    switch (opt) {
      case 1:
        const busqueda = await leerInput('Ciudad: ');
        const lugares = await busquedas.buscarCiudad(busqueda);
        const idSeleccionado = await listarLugares(lugares);

        if (idSeleccionado === '0') continue;

        const { lng, lat, nombre } = lugares.find( lugar => lugar.id === idSeleccionado);
        busquedas.agregarHistorial(nombre);
        const { temp, min, max, desc } = await busquedas.climaLugar(lat, lng);

        console.clear();

        console.log('\nInformación de la ciudad\n'.green);
        console.log('Ciudad: ',nombre.green);
        console.log('Lat: ',lat);
        console.log('Long: ',lng);
        console.log('Temperatura: ', temp);
        console.log('Mínima: ', min);
        console.log('Máxima: ', max);
        console.log('Como esta el clima: ', desc.green);
      break;

      case 2:
        busquedas.historialCapitalizado.forEach((lugar, i) => {
          const idx = `${ i + 1 }. `.green;
          console.log(`${idx} ${lugar}`);
        })
      break;
    
    }

    if (opt != 0) await pausa();

  } while (opt != 0);
} 

main()