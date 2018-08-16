//SPDX-License-Identifier: Apache-2.0

/*
  This code is based on code written by the Hyperledger Fabric community.
  Original code can be found here: https://github.com/hyperledger/fabric-samples/blob/release/fabcar/query.js
  and https://github.com/hyperledger/fabric-samples/blob/release/fabcar/invoke.js
 */

// call the packages we need
var express       = require('express');        // call express
var app           = express();                 // define our app using express
var bodyParser    = require('body-parser');
var http          = require('http')
var fs            = require('fs');
var Fabric_Client = require('fabric-client');
var path          = require('path');
var util          = require('util');
var os            = require('os');

var result_func = function(name, event, country, state, area, target, balance, flag, callBack){
	var result;
	var MongoClient = require('mongodb').MongoClient;
	var url = "mongodb://localhost:27017/";
	MongoClient.connect(url, function(err, db) {
	 if (err) {
	  	console.log("Issue connecting to database1!");
	  	result = 'false';
	  	return callBack(result);
	  }
	  	else if(flag == "creation") {
	  		var dbo = db.db("admin");
			var myobj = { Charity: name, Event: event, Country: country, State: state, Area: area, Target: target, Balance: balance};
			dbo.collection("charity").insertOne(myobj, function(err, res) {
			if (err) {
				console.log("Issue connecting to database or duplicate entry!");
				result = 'false';
				return callBack(result);
				}
				else{
					console.log("1 document inserted");
					result = 'true';
					db.close();
					return callBack(result);
				}
			});
	  	}

	  	else if(flag == 'donation'){
	  		var dbo = db.db("admin");
			var myquery = { Charity: name, Event: event };
			var newvalues = { $set: {Balance: balance } };
			dbo.collection("charity").updateOne(myquery, newvalues, function(err, res) {
			if (err) throw err;
			console.log("1 document updated");
			db.close();
			});
	  		console.log("Donation made.");
			result = 'true';
			db.close();
			return callBack(result);
	  	}
	});	
}

function mongo_query(name, event, callBack){
	var result;
	var MongoClient = require('mongodb').MongoClient;
	var url = "mongodb://localhost:27017/";
	MongoClient.connect(url, function(err, db) {
	 if (err) {
	  	console.log("Issue connecting to database!");
	  	result = 'false';
	  	return callBack(result);
	  }
	  	else {
	  		var dbo = db.db("admin");
			var query = { Charity: name, Event: event };
			var obj = dbo.collection("charity").find(query).toArray(function(error, documents) {
			
				var array = [];
				documents.forEach( function(myDoc) { array.push(myDoc); console.log(myDoc.Charity); } )
				db.close();
				return callBack(array);
			
    		});
	  	}
	});	
}

function main_func(key, name, event, country, state, area, date, target, donated, balance, flag, callBack){

	result_func(name, event, country, state, area, target, balance, flag, function(result) {
			//console.log("Result: " + result)
			if (result == 'true'){
				console.log("Result: " + result)
				var fabric_client = new Fabric_Client();

				// setup the fabric network
				var channel = fabric_client.newChannel('mychannel');
				var peer = fabric_client.newPeer('grpc://localhost:7051');
				channel.addPeer(peer);
				var order = fabric_client.newOrderer('grpc://localhost:7050')
				channel.addOrderer(order);

				var member_user = null;
				var store_path = path.join(os.homedir(), '.hfc-key-store');
				console.log('Store path:'+store_path);
				var tx_id = null;

				// create the key value store as defined in the fabric-client/config/default.json 'key-value-store' setting
				Fabric_Client.newDefaultKeyValueStore({ path: store_path
				}).then((state_store) => {
				    // assign the store to the fabric client
				    fabric_client.setStateStore(state_store);
				    var crypto_suite = Fabric_Client.newCryptoSuite();
				    // use the same location for the state store (where the users' certificate are kept)
				    // and the crypto store (where the users' keys are kept)
				    var crypto_store = Fabric_Client.newCryptoKeyStore({path: store_path});
				    crypto_suite.setCryptoKeyStore(crypto_store);
				    fabric_client.setCryptoSuite(crypto_suite);

				    // get the enrolled user from persistence, this user will sign all requests
				    return fabric_client.getUserContext('user1', true);
				}).then((user_from_store) => {
				    if (user_from_store && user_from_store.isEnrolled()) {
				        console.log('Successfully loaded user1 from persistence');
				        member_user = user_from_store;
				    } else {
				        throw new Error('Failed to get user1.... run registerUser.js');
				    }

				    // get a transaction id object based on the current user assigned to fabric client
				    tx_id = fabric_client.newTransactionID();
				    console.log("Assigning transaction_id: ", tx_id._transaction_id);

				    // recordCharity - requires 8 args, ID, name, category, country, state, city, date, director
				    // send proposal to endorser
				    const request = {
				        //targets : --- letting this default to the peers assigned to the channel
				        chaincodeId: 'charity-app',
				        fcn: 'recordEvent',
				        args: [key, name, event, country, state, area, date, target, donated, balance],
				        chainId: 'mychannel',
				        txId: tx_id
				    };

				    // send the transaction proposal to the peers
				    return channel.sendTransactionProposal(request);
				}).then((results) => {
				    var proposalResponses = results[0];
				    var proposal = results[1];
				    let isProposalGood = false;
				    if (proposalResponses && proposalResponses[0].response &&
				        proposalResponses[0].response.status === 200) {
				            isProposalGood = true;
				            console.log('Transaction proposal was good');
				        } else {
				            console.error('Transaction proposal was bad');
				        }
				    if (isProposalGood) {
				        console.log(util.format(
				            'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s"',
				            proposalResponses[0].response.status, proposalResponses[0].response.message));

				        // build up the request for the orderer to have the transaction committed
				        var request = {
				            proposalResponses: proposalResponses,
				            proposal: proposal
				        };

				        // set the transaction listener and set a timeout of 30 sec
				        // if the transaction did not get committed within the timeout period,
				        // report a TIMEOUT status
				        var transaction_id_string = tx_id.getTransactionID(); //Get the transaction ID string to be used by the event processing
				        var promises = [];

				        var sendPromise = channel.sendTransaction(request);
				        promises.push(sendPromise); //we want the send transaction first, so that we know where to check status

				        // get an eventhub once the fabric client has a user assigned. The user
				        // is required bacause the event registration must be signed
				        let event_hub = fabric_client.newEventHub();
				        event_hub.setPeerAddr('grpc://localhost:7053');

				        // using resolve the promise so that result status may be processed
				        // under the then clause rather than having the catch clause process
				        // the status
				        let txPromise = new Promise((resolve, reject) => {
				            let handle = setTimeout(() => {
				                event_hub.disconnect();
				                resolve({event_status : 'TIMEOUT'}); //we could use reject(new Error('Trnasaction did not complete within 30 seconds'));
				            }, 3000);
				            event_hub.connect();
				            event_hub.registerTxEvent(transaction_id_string, (tx, code) => {
				                // this is the callback for transaction event status
				                // first some clean up of event listener
				                clearTimeout(handle);
				                event_hub.unregisterTxEvent(transaction_id_string);
				                event_hub.disconnect();

				                // now let the application know what happened
				                var return_status = {event_status : code, tx_id : transaction_id_string};
				                if (code !== 'VALID') {
				                    console.error('The transaction was invalid, code = ' + code);
				                    resolve(return_status); // we could use reject(new Error('Problem with the tranaction, event status ::'+code));
				                } else {
				                    console.log('The transaction has been committed on peer ' + event_hub._ep._endpoint.addr);
				                    resolve(return_status);
				                }
				            }, (err) => {
				                //this is the callback if something goes wrong with the event registration or processing
				                reject(new Error('There was a problem with the eventhub ::'+err));
				            });
				        });
				        promises.push(txPromise);

				        return Promise.all(promises);
				    } else {
				        console.error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
				        throw new Error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
				    }
				}).then((results) => {
				    console.log('Send transaction promise and event listener promise have completed');
				    // check the results in the order the promises were added to the promise all list
				    if (results && results[0] && results[0].status === 'SUCCESS') {
				        console.log('Successfully sent transaction to the orderer.');
				        // return callBack(tx_id.getTransactionID());
				        console.log(tx_id.getTransactionID());
				    } else {
				        console.error('Failed to order the transaction. Error code: ' + response.status);
				    }

				    if(results && results[1] && results[1].event_status === 'VALID') {
				        console.log('Successfully committed the change to the ledger by the peer');
				        // return callBack(tx_id.getTransactionID());
				        console.log(tx_id.getTransactionID());
				    } else {
				        console.log('Transaction failed to be committed to the ledger due to ::'+results[1].event_status);
				    }
				}).catch((err) => {
				    console.error('Failed to invoke successfully :: ' + err);
				});
			}
			else{
				console.log('Duplicate data1 found.')
			}
		});
}

module.exports = (function() {
return{

	get_mongo: function(req, res){
		console.log("getting all events from mongodb: ");

		var MongoClient = require('mongodb').MongoClient;
		var url = "mongodb://localhost:27017/";

		MongoClient.connect(url, function(err, db) {
		  if (err) {
		  	console.log('Issue connecting to database!');
		  }
		  else{
		  	var dbo = db.db("admin");
		  	var obj = dbo.collection("charity").find({}).toArray(function(error, documents) {
    			if (err) {
    				console.log('Cannot find data.');
    			}
    			else{
    				res.send(documents);
    			}
    		});
		  } 
		});

	},

	get_all_events: function(req, res){
		console.log("getting all events from database: ");

		var fabric_client = new Fabric_Client();

		// setup the fabric network
		var channel = fabric_client.newChannel('mychannel');
		var peer = fabric_client.newPeer('grpc://localhost:7051');
		channel.addPeer(peer);

		//
		var member_user = null;
		var store_path = path.join(os.homedir(), '.hfc-key-store');
		console.log('Store path:'+store_path);
		var tx_id = null;

		// create the key value store as defined in the fabric-client/config/default.json 'key-value-store' setting
		Fabric_Client.newDefaultKeyValueStore({ path: store_path
		}).then((state_store) => {
		    // assign the store to the fabric client
		    fabric_client.setStateStore(state_store);
		    var crypto_suite = Fabric_Client.newCryptoSuite();
		    // use the same location for the state store (where the users' certificate are kept)
		    // and the crypto store (where the users' keys are kept)
		    var crypto_store = Fabric_Client.newCryptoKeyStore({path: store_path});
		    crypto_suite.setCryptoKeyStore(crypto_store);
		    fabric_client.setCryptoSuite(crypto_suite);

		    // get the enrolled user from persistence, this user will sign all requests
		    return fabric_client.getUserContext('user1', true);
		}).then((user_from_store) => {
		    if (user_from_store && user_from_store.isEnrolled()) {
		        console.log('Successfully loaded user1 from persistence');
		        member_user = user_from_store;
		    } else {
		        throw new Error('Failed to get user1.... run registerUser.js');
		    }

		    // queryAllCharities - requires no arguments , ex: args: [''],
		    const request = {
		        chaincodeId: 'charity-app',
		        txId: tx_id,
		        fcn: 'findEvents',
		        args: ['']
		    };

		    // send the query proposal to the peer
		    return channel.queryByChaincode(request);
		}).then((query_responses) => {
		    console.log("Query has completed, checking results");
		    // query_responses could have more than one  results if there multiple peers were used as targets
		    if (query_responses && query_responses.length == 1) {
		        if (query_responses[0] instanceof Error) {
		            console.error("error from query = ", query_responses[0]);
		        } else {
		            console.log("Response is ", query_responses[0].toString());
		            res.json(JSON.parse(query_responses[0].toString()));
		        }
		    } else {
		        console.log("No payloads were returned from query");
		    }
		}).catch((err) => {
		    console.error('Failed to query successfully :: ' + err);
		});
	},


	add_event: function(req, res){
		console.log("submit event of a charity: ");

		var array = req.params.event.split("-");
		console.log(array.length);

		var MongoClient = require('mongodb').MongoClient;
		var url = "mongodb://localhost:27017";

		if (array.length == 4){
			mongo_query(array[1], array[2], function(result) {

				console.log(result);

				var key = array[0]
				var name = result[0].Charity
				var event = result[0].Event
				var country = result[0].Country
				var state = result[0].State
				var area = result[0].Area
				var date = new Date().toLocaleString()
				var target = result[0].Target
				var donated = array[3]
				var balance = (Number(result[0].Balance)-Number(array[3])).toString()

				var flag = "donation";

				main_func(key, array[1], array[2], country, state, area, date, target, donated, balance, flag, function(result){
					res.send(result);
				});
		});

		}

		else{
			var key = array[0]
			var name = array[1]
			var event = array[2]
			var country = array[3]
			var state = array[4]
			var area = array[5]
			var date = new Date().toLocaleString()
			var target = array[6]
			var donated = "0"
			var balance = array[6]

			var flag = "creation";

			main_func(key, array[1], array[2], country, state, area, date, target, donated, balance, flag);
		}

	}

}
})();
