// SPDX-License-Identifier: Apache-2.0

/*
  Sample Chaincode based on Demonstrated Scenario
 This code is based on code written by the Hyperledger Fabric community.
  Original code can be found here: https://github.com/hyperledger/fabric-samples/blob/release/chaincode/fabcar/fabcar.go
 */

package main

/* Imports
* 4 utility libraries for handling bytes, reading and writing JSON,
formatting, and string manipulation
* 2 specific Hyperledger Fabric specific libraries for Smart Contracts
*/
import (
	"bytes"
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	sc "github.com/hyperledger/fabric/protos/peer"
)

// Define the Smart Contract structure
type SmartContract struct {
}

/* Define Time structure, with 4 properties.
Structure tags are used by encoding/json library
*/
type Registration struct {

	Transaction_ID string `json:"id"`
	Charity string `json:"name"`
	Event string `json:"event"`
	Country  string `json:"country"`
	State  string `json:"state"`
	Area  string `json:"area"`
	Event_Created string `json:"date"`
	Target string `json:"target"`
	Donated string `json:"donated"`
	Balance string `json:"balance"`
}

/*
 * The Init method *
 called when the Smart Contract "charity-chaincode" is instantiated by the network
 * Best practice is to have any Ledger initialization in separate function
 -- see initLedger()
 */
func (s *SmartContract) Init(APIstub shim.ChaincodeStubInterface) sc.Response {
	return shim.Success(nil)
}

/*
 * The Invoke method *
 called when an application requests to run the Smart Contract "charity-chaincode"
 The app also specifies the specific smart contract function to call with args
 */
func (s *SmartContract) Invoke(APIstub shim.ChaincodeStubInterface) sc.Response {

	// Retrieve the requested Smart Contract function and arguments
	function, args := APIstub.GetFunctionAndParameters()
	// Route to the appropriate handler function to interact with the ledger
	if function == "initLedger" {
		return s.initLedger(APIstub)
	} else if function == "findEvents" {
		return s.findEvents(APIstub)
	} else if function == "recordEvent" {
		return s.recordEvent(APIstub, args)
	}

	return shim.Error("Invalid Smart Contract function name.")
}

/*
 * The initLedger method *
Will add test data (10 time catches)to our network
 */
func (s *SmartContract) initLedger(APIstub shim.ChaincodeStubInterface) sc.Response {
	registered := []Registration{
		Registration{Charity: "United Way", Event: "Earthquake", Country: "United States", State: "California", Area: "Los Angeles", Event_Created: "20-07-2018", Target: "100000", Donated: "0", Balance: "0"},
	}

	i := 0
	for i < len(registered) {
		fmt.Println("i is ", i)
		registeredAsBytes, _ := json.Marshal(registered[i])
		APIstub.PutState(strconv.Itoa(i+1), registeredAsBytes)
		fmt.Println("Added", registered[i])
		i = i + 1
	}

	return shim.Success(nil)
}


/*
 * The queryAllCharities method *
allows for assessing all the records added to the ledger(all time catches)
This method does not take any arguments. Returns JSON string containing results.
 */
func (s *SmartContract) findEvents(APIstub shim.ChaincodeStubInterface) sc.Response {

	startKey := "0"
	endKey := "999"

	resultsIterator, err := APIstub.GetStateByRange(startKey, endKey)
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	// buffer is a JSON array containing QueryResults
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		// Add comma before array members,suppress it for the first array member
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"Key\":")
		buffer.WriteString("\"")
		buffer.WriteString(queryResponse.Key)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Record\":")
		// Record is a JSON object, so we write as-is
		buffer.WriteString(string(queryResponse.Value))
		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	fmt.Printf("- queryAllTime:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
}

/*
 * The recordCharity method *
This method takes in eight arguments (attributes to be saved in the ledger).
 */
func (s *SmartContract) recordEvent(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 10 {
		return shim.Error("Incorrect number of arguments. Expecting 8")
	}

	var registered = Registration{Charity: args[1], Event: args[2], Country: args[3], State: args[4], Area: args[5], Event_Created: args[6], Target: args[7], Donated: args[8], Balance: args[9]}

	registeredAsBytes, _ := json.Marshal(registered)
	err := APIstub.PutState(args[0], registeredAsBytes)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to record charity: %s", args[0]))
	}

	return shim.Success(nil)
}


/*
 * main function *
calls the Start function
The main function starts the chaincode in the container during instantiation.
 */
func main() {

	// Create a new Smart Contract
	err := shim.Start(new(SmartContract))
	if err != nil {
		fmt.Printf("Error creating new Smart Contract: %s", err)
	}
}