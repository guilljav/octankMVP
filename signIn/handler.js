'use strict';

const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
global.fetch = require('node-fetch');
var mysql = require('mysql');
 var connection = mysql.createConnection({
   host     : 'om1ju5yxcgpbl1k.ceugutguvx3t.us-east-1.rds.amazonaws.com',
     port      :  '3306',
   user     : 'admin',
  password : 'Qwert123456',
   database : 'MyDatabase'
 });
const poolData = {
    UserPoolId: process.env.poolId, // Your user pool id here
    ClientId: process.env.clientId // Your client id here
};
const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

exports.SignInMethod = (event, context, callback) => {
    switch (event.httpMethod) {
        case 'POST':
            SignIn(event, callback);
            break;
        case 'PUT':
            RefreshToken(event, callback);
            break;
        default:
            sendResponse(404, `Unsupported method "${event.httpMethod}"`, callback);
    }
}

function SignIn(event, callback) {
    const userParams = JSON.parse(event.body);
    console.log(userParams);
    var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(userParams);

        var userData = {
            Username: userParams["Username"],
            Pool: userPool
        };
        var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
        cognitoUser.initiateAuth
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function (result) {
                const tokens = {
                    accessToken: result.getAccessToken().getJwtToken(),
                    //  payLoad:result.getAccessToken().getPayload(),
                    idToken: result.getIdToken(),
                    refreshToken: result.getRefreshToken().getToken()
                }
                 console.log('tokens : ' + JSON.stringify(tokens));
              getuserData(userParams["Username"], function(response){
                  console.log('response : ' + JSON.stringify(response));
                tokens.userData = response;
                console.log('tokens 2 : ' + JSON.stringify(tokens)); 
                sendResponse(200, JSON.stringify(tokens), callback);
              });

                
            },
            onFailure: function (err) {
                console.log(err);
                if(err.code == "NotAuthorizedException")
                    sendResponse(200, JSON.stringify(err), callback)
                else
                    sendResponse(err.statusCode || 400, JSON.stringify(err), callback)
            },

        });
    
}

function getuserData(email,callback){
try{
    connection.connect();
    connection.query('SELECT * FROM `Clients` WHERE `Email` = ?' , [email] , function (error, results, fields) {
    if (error){
       console.log(error, error.stack);
        sendResponse(error.statusCode || 400, JSON.stringify(error.stack), callback);
    }
    console.log('Data entered selected : ' + JSON.stringify(results[0]));
    connection.end();
    callback(results[0]);
});
}catch(err){
    console.log('error : ' + JSON.stringify(err))
}


}

function RefreshToken(event, callback) {
    const userParams = JSON.parse(event.body);
    const RefreshToken = new AmazonCognitoIdentity.CognitoRefreshToken({RefreshToken: userParams.refreshToken});


    const userData = {
        Username: userParams["Username"],
        Pool: userPool
    };

    const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

    cognitoUser.refreshSession(RefreshToken, (err, session) => {
        if (err) {
            sendResponse(err.statusCode || 400, JSON.stringify(err), callback)
        } else {
            let retObj = {
                "access_token": session.accessToken.jwtToken,
                "id_token": session.idToken,
                "refresh_token": session.refreshToken.token,
            }
            sendResponse(200, JSON.stringify(retObj), callback);
        }
    })

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