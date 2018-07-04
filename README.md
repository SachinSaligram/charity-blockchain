# charity-blockchain
Simple blockchain application to keep a track of charity registrations and spending.


Installation Instructions

* Install [Node.js](https://nodejs.org/en/), [Go](https://golang.org/doc/install) and [Docker](https://docs.docker.com/install/) (CE edition is fine) installed.

* Install [Hyperledger](https://hyperledger-fabric.readthedocs.io/en/latest/getting_started.html)

* Clone the charity-blockchain repository.

* Enter the charity-app folder and run the following commands:

  * docker rm -f $(docker ps -aq)

  * Start up Hyperledger

  * ./startFabric.sh

Install the required Node packages and register the Admin and User components of the network before starting the application.

* npm install

* node registerAdmin.js

* node registerUser.js

* node server.js

The client should launch on localhost:8000 in any web browser.
