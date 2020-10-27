'use strict';

const AmazonCognitoIdentity = require('amazon-cognito-identity-js');

global.fetch = require('node-fetch');

const userPool = new AmazonCognitoIdentity.CognitoUserPool({
    UserPoolId: process.env.poolId, // Your user pool id here
    ClientId: process.env.clientId
});

exports.ForgetPasswordMethod = (event, context, callback) => {
    switch (event.httpMethod) {
        case 'POST':
            ForgetPassword(event, callback);
            break;
        case 'PUT':
            resetpassword(event, callback);
            break;
        default:
            sendResponse(404, `Unsupported method "${event.httpMethod}"`, callback);
    }

}

function ForgetPassword(event, callback) {
    const userParams = JSON.parse(event.body);
    var userData = {
        Username: userParams["Username"],
        Pool: userPool
    };
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    cognitoUser.forgotPassword({
        onSuccess: function (result) {

            sendResponse(200, JSON.stringify(result), callback);
        },
        onFailure: function (err) {
            console.log(err);
            sendResponse(err.statusCode || 400, JSON.stringify(err), callback)
        },

    });
}

function resetpassword(event, callback) {
    const userParams = JSON.parse(event.body);
    var userData = {
        Username: userParams["Username"],
        Pool: userPool
    };
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    cognitoUser.confirmPassword(userParams["ConfirmationCode"], userParams["Password"], {
        onSuccess: function (result) {

            sendResponse(200, JSON.stringify(result), callback);
        },
        onFailure: function (err) {
            console.log(err);
            sendResponse(err.statusCode || 400, JSON.stringify(err), callback)
        },

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