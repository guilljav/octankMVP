'use strict';

const AWS = require('aws-sdk');
const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider({apiVersion: '2016-04-18'});
const poolId = process.env.poolId;

exports.GetUserPoolDataMethod = (event, context, callback) => {
    var params = {
        UserPoolId: poolId
      };
      cognitoidentityserviceprovider.describeUserPool(params, function(err, data) {
        if (err) {
            console.log(err, err.stack); // an error occurred
            sendResponse(err.statusCode || 400, JSON.stringify(err), callback)
        }
        else {
                console.log(data);           // successful response
                sendResponse(200, JSON.stringify(data), callback)
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