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
type Tracker struct {

	Name string `json:"holder"`
	Company string `json:"company"`
	Team  string `json:"team"`
	Date  string `json:"date"`
	Intime  string `json:"intime"`
	Outtime  string `json:"outtime"`
}

/*
 * The Init method *
 called when the Smart Contract "time-chaincode" is instantiated by the network
 * Best practice is to have any Ledger initialization in separate function
 -- see initLedger()
 */
func (s *SmartContract) Init(APIstub shim.ChaincodeStubInterface) sc.Response {
	return shim.Success(nil)
}

/*
 * The Invoke method *
 called when an application requests to run the Smart Contract "time-chaincode"
 The app also specifies the specific smart contract function to call with args
 */
func (s *SmartContract) Invoke(APIstub shim.ChaincodeStubInterface) sc.Response {

	// Retrieve the requested Smart Contract function and arguments
	function, args := APIstub.GetFunctionAndParameters()
	// Route to the appropriate handler function to interact with the ledger
	if function == "queryTime" {
		return s.queryTime(APIstub, args)
	} else if function == "initLedger" {
		return s.initLedger(APIstub)
	} else if function == "queryAllTime" {
		return s.queryAllTime(APIstub)
	}

	return shim.Error("Invalid Smart Contract function name.")
}

/*
 * The queryTime method *
Used to view the records of one particular time
It takes one argument -- the key for the time in question
 */
func (s *SmartContract) queryTime(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	timeAsBytes, _ := APIstub.GetState(args[0])
	if timeAsBytes == nil {
		return shim.Error("Could not locate time")
	}
	return shim.Success(timeAsBytes)
}

/*
 * The initLedger method *
Will add test data (10 time catches)to our network
 */
func (s *SmartContract) initLedger(APIstub shim.ChaincodeStubInterface) sc.Response {
	tracker := []Tracker{
		Tracker{Name: "David Wallace", Company: "Dunder Mifflin", Team: "Sales", Date: "02-11-1992", Intime: "1504057825", Outtime: "1504509000"},
		Tracker{Name: "Jim Halpert", Company: "Dunder Mifflin", Team: "Sales", Date: "02-11-1992", Intime: "1504057900", Outtime: "1504507000"},
		Tracker{Name: "Pam Halpert", Company: "Dunder Mifflin", Team: "Reception", Date: "02-11-1992", Intime: "1504056000", Outtime: "1504506000"},
	}

	i := 0
	for i < len(tracker) {
		fmt.Println("i is ", i)
		trackerAsBytes, _ := json.Marshal(tracker[i])
		APIstub.PutState(strconv.Itoa(i+1), trackerAsBytes)
		fmt.Println("Added", tracker[i])
		i = i + 1
	}

	return shim.Success(nil)
}


/*
 * The queryAllTime method *
allows for assessing all the records added to the ledger(all time catches)
This method does not take any arguments. Returns JSON string containing results.
 */
func (s *SmartContract) queryAllTime(APIstub shim.ChaincodeStubInterface) sc.Response {

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