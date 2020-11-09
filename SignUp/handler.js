'use strict';

const AWS = require('aws-sdk');
const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider({apiVersion: '2016-04-18'});
const cognitoClientId = process.env.clientId

 var mysql = require('mysql');
 
exports.CognitoAuthMethod = (event, context, callback) => {
    const userParams = JSON.parse(event.body);
    userParams.ClientId = cognitoClientId
    if (userParams.type == 'SignUp') {
        delete userParams['type']
        RegisterUser(userParams, callback);
    } else if (userParams.type == 'confirmSignUp') {
        delete userParams['type']
        console.log(JSON.stringify(userParams))
        confirmSignUp(userParams, callback);
    }else if (userParams.type == 'resendConfirmationCode') {
        delete userParams['type']
        console.log(JSON.stringify(userParams))
        resendConfirmationCode(userParams, callback);
    }
    ;
}

function RegisterUser(userParams, callback) {

    var param = {
        ClientId: userParams.ClientId,
        Password: userParams.Password,
        Username: userParams.Username
    }
    cognitoidentityserviceprovider.signUp(param, function (err, data) {
        if (err) {
            console.log(err, err.stack);
            sendResponse(err.statusCode || 400, JSON.stringify(err.stack), callback);
        } else {
            console.log('start db operation  : ' + JSON.stringify(data));
            SetUser(userParams.Name, userParams.Email, userParams.Address, userParams.Type, userParams.Data, userParams.Phone, callback);
            console.log('end db operation end');
            sendResponse(200, JSON.stringify(data), callback);
            // resp200ok.body = JSON.stringify(data); callback(null, resp200ok);
        }
    });

}

async function SetUser(name, email, address, type, data,phone, callback){
    var connection = mysql.createConnection({
   host     : 'om1ju5yxcgpbl1k.ceugutguvx3t.us-east-1.rds.amazonaws.com',
     port      :  '3306',
   user     : 'admin',
  password : 'Qwert123456',
   database : 'MyDatabase'
 });
    connection.connect();
    connection.query('INSERT INTO Clients (Name, Email, Address, Type,Data, Phone) Values (? , ? ,? ,? ,?,?)' , [name, email,address,type,data,phone] , function (error, results, fields) {
    if (error){
       console.log(error, error.stack);
        sendResponse(error.statusCode || 400, JSON.stringify(error.stack), callback);
    }
    console.log('Data entered successfully');
    connection.end();
    callback(true);
});
 

}

function confirmSignUp(userParams, callback) {

    cognitoidentityserviceprovider.confirmSignUp(userParams, function (err, data) {
        if (err) {
            console.log(err, err.stack);
            sendResponse(err.statusCode || 400, JSON.stringify(err.stack), callback);
        } else {
            sendResponse(200, JSON.stringify(data), callback);
        }
    });

}

function resendConfirmationCode(userParams, callback) {
         var params = {
            ClientId: cognitoClientId, /* required */
            Username: userParams.Username,
        }
    
        cognitoidentityserviceprovider.resendConfirmationCode(params, function (err, data) {
            if (err) {
                console.log(err, err.stack);
                sendResponse(err.statusCode || 400, JSON.stringify(err.stack), callback);
            } else {
                sendResponse(200, JSON.stringify(data), callback);
            }
        });
    
    }

function sendResponse(statusCode, message, callback) {
    const response = {
        statusCode: statusCode,
        body: message,
        isBase64Encoded: true,
        headers: {
            "X-Requested-With": "*",
            "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,x-requested-with",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS, DELETE",
        },
    };
    callback(null, response);
}