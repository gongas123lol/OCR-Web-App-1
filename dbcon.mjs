import pgPromise from 'pg-promise';

const pgp = pgPromise();

const db = pgp({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'postgres',
    port: '5432',
});

async function init(){
    let queryA = "CREATE TABLE cars ( marca VARCHAR(255),modelo VARCHAR(255), cor VARCHAR(255),  motor_cc INT, peso INT,  potencia_cv INT, binario_nm INT, matricula VARCHAR(255), vin VARCHAR(255) PRIMARY KEY);"
    const result = await db.query(queryA);

    console.log(result);
}

async function sendQuery(query){
    try {
        return await db.query(query);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

/*
a car object is like:
mycar = {
marca,
modelo,
motorcc,
peso,
potenciacv,
binarionm,
 matricula,
  vin
}
 */

async function addCar(car) {
    const carQuery = `
        INSERT INTO cars (marca, modelo, motor_cc, peso, potencia_cv, binario_nm, matricula, vin)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;

    try {
        await db.query(carQuery, [car.marca, car.modelo, car.motorcc, car.peso, car.potenciacv, car.binarionm, car.matricula, car.vin, 1]);


        console.log('Car added successfully!');
    } catch (error) {
        console.error('Error adding car:', error.message);
    }
}

async function removeCar(VIN) {
    const deleteQuery = `
        DELETE FROM cars
        WHERE vin = '${VIN}'
    `;

    try {
        await db.query(deleteQuery);


        console.log('Car removed successfully!');
    } catch (error) {
        console.error('Error removing car:', error.message);
    }
}

async function getallcars() {
    const query = 'SELECT * FROM cars';

    try {
        let response = await db.query(query);


        console.log('retreived sucessfully', response);

        return response;
    } catch (error) {
        console.error('Error retrieving:', error.message);
    }
}

async function getdetailsvin(VIN) {
    const query = 'SELECT * FROM cars ' +
        `   WHERE cars.vin = $'{vin}'`;

    try {
        let response = await db.query(query);


        console.log('retreived sucessfully', response);
        return response;
    } catch (error) {
        console.error('Error retrieving:', error.message);
    }
}

async function getdetailsmatricula(matricula) {
    const query = "SELECT * FROM cars  WHERE cars.matricula = ${matricula}"

    try {
        let response = await db.query(query);


        console.log('retreived sucessfully', response);
        return response;
    } catch (error) {
        console.error('Error retrieving:', error.message);
    }
}

const car2 = {
    marca: 'Honda',
    modelo: 'Civic',
    motorcc: 2000,
    peso: 1200,
    potenciacv: 150,
    binarionm: 200,
    matricula: 'PQR456',
    vin: 'FGHIJ67890'
};
// Call the async function
//await init()
//await addCar(car2)
//await getallcars()
//await removeCar(car2.vin);

//await sendQuery("DROP TABLE CARS;")

//db.query('DROP TABLE CARS;')

export{
    sendQuery,
    getdetailsvin,
    getallcars,
    getdetailsmatricula,
    addCar,
    removeCar
}