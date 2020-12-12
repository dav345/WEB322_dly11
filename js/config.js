module.exports = {
	// database_connection_string: "mongodb+srv://<username>:<userpassword>@senecaweb.5iwr5.mongodb.net/<collectionname>?retryWrites=true&w=majority"
	dbconn: `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_URL}`,
};
