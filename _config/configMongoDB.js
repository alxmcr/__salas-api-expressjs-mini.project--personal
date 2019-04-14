const serverDB = {
	user: 'reynaldo',
	host: 'localhost',
	database: 'reservas-salas',
	password: 'reynaldo',
	port: 27017,
}

const connectionStringMongoDB = `mongodb://${serverDB.host}:${serverDB.port}/${serverDB.database}`;

exports.connectionString = process.env.MONGODB_URI || connectionStringMongoDB;