const mysql = require('mysql');

exports.handle = function (event, context) {

    // Provide MySQL Connection Details from the AWS Lambda env vars
    const connection = mysql.createConnection({
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        multipleStatements: true
    });

    // Start Database Connection
    connection.connect();

    // This use case check whether email, phone number or Username already associated with an another account on the database
    var isEmailExist = false;
    var isPhoneNumberExist = false;
    var isUsernameExist = false;

    event.userName = event.userName.trim().toLocaleLowerCase();
    event.request.userAttributes.email = event.request.userAttributes.email.trim().toLocaleLowerCase();

    getUsernameEmailAndPhoneNumberExistForDriverPromise(event, connection)
        .then(function (results) {

            if (results[0].result == 1) {
                isEmailExist = true;
            }

            if (results[1].result == 1) {
                isPhoneNumberExist = true;
            }

            if (results[2].result == 1) {
                isUsernameExist = true;
            }

            if (isEmailExist == true && isPhoneNumberExist == true) {

                var error = new Error("EMAIL_PHONE_BOTH_EXIST");
                context.done(error, event);

            } else if (isEmailExist == true) {

                var error = new Error("EMAIL_EXIST");
                context.done(error, event);

            } else if (isPhoneNumberExist == true) {

                var error = new Error("PHONE_EXIST");
                context.done(error, event);

            } else if (isUsernameExist == true) {

                var error = new Error("USERNAME_EXIST");
                context.done(error, event);

            } else {

                const driverUsername = event.userName;
                const email = event.request.userAttributes.email;
                const phoneNumber = event.request.userAttributes.phone_number;

                return insertNewDriverInfoToDb(driverUsername, phoneNumber, email, connection);
            }

        })
        .then(function (result) {

            connection.end();
            context.done(null, event);

        })
        .catch(function (error) {

            console.log(error);

            connection.end();
            var error = new Error("DATABASE_ERROR");
            context.done(error, event);
        })

}

// Check Email, Phone Number or Phone Number exists
function getUsernameEmailAndPhoneNumberExistForDriverPromise(event, connection) {

    return new Promise(function (resolve, reject) {
        const driverUsername = event.userName;
        const email = event.request.userAttributes.email;
        const phoneNumber = event.request.userAttributes.phone_number;

        var getEmailAndPhoneNumberExistForDriverPromiseQuery = "SELECT count(*) AS 'result' FROM Driver WHERE email = ? UNION ALL SELECT count(*) AS 'result' FROM Driver WHERE phone_number = ? UNION ALL SELECT count(*) AS 'result' FROM Driver WHERE driver_username = ?;";
        const query = connection.query(getEmailAndPhoneNumberExistForDriverPromiseQuery, [email, phoneNumber, driverUsername], function (error, results, fields) {
            console.log(query.sql);
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }

        });
    });
}

// Insert New Driver info the table
function insertNewDriverInfoToDb(driver_username, phone_number, email, connection) {

    return new Promise(function (resolve, reject) {
        var insertNewDriverQuery = `INSERT INTO Driver (driver_id, driver_username, phone_number, email, first_name, last_name, date_of_birth) VALUES (NULL, ?, ?, ?, "", "", "");`;
        const query = connection.query(insertNewDriverQuery, [driver_username, phone_number, email], function (error, results, fields) {
            console.log(query.sql);
            if (error != null) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}