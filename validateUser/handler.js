'use strict';

const AWS = require('aws-sdk');
const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider({apiVersion: '2016-04-18'});
const cognitoClientId = process.env.clientId

exports.ValidateUserMethod = (event, context, callback) => {
    const userParams = JSON.parse(event.body);
    var params = {
        UserPoolId: process.env.poolId,
        AttributesToGet: [
            'username'
        ]
    };
    cognitoidentityserviceprovider.listUsers(params, function (err, data) {
        if (err) {
            console.log(err, err.stack); // an error occurred
            sendResponse(err.statusCode || 400, JSON.stringify(err), callback)
        }
        else {
            console.log(JSON.stringify(data));
            let userExists = false;
            for (let i = 0; i < data.Users.length; i++) {
                if (userExists)
                    break;
                console.log('user ' + i + ' : ' + JSON.stringify(data.Users[i]));
                for (let y = 0; y < data.Users[i].Attributes.length; y++) {
                    console.log('user ' + i + ' atribute ' + y + ' : ' + JSON.stringify(data.Users[i].Attributes[y]));
                    if (data.Users[i].Attributes[y].Name == 'email' && data.Users[i].Attributes[y].Value == userParams.Username) {
                        userExists = true;
                        console.log('user exists : ' + userExists)
                        break;
                    }
                }
            }
            if (userExists) {
                sendResponse(200, true, callback);
            } else {
                sendResponse(200, false, callback);
            }
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