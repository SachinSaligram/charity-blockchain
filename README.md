# charity-blockchain

__Simple blockchain application to keep a track of charity registrations and spending.__

Every time you donate money to a charity, do you know how much money they have at any point of time? Do you know how when, where and how money is being spent? I am building a simple blockchain application to keep a track of charity registrations and spending. This will help track every charity that has registered and track identify where every dollar is spent.

This is a work in progress. Keep a look out for new features and do provide your suggestions! To have a look at what's working right now, follow the installation and setup instructions below.


__Installation Instructions__

* Install [Node.js](https://nodejs.org/en/), [Go](https://golang.org/doc/install) and [Docker](https://docs.docker.com/install/) (CE edition is fine) installed.

* Install [Hyperledger](https://hyperledger-fabric.readthedocs.io/en/latest/getting_started.html)

* Clone the charity-blockchain repository.

* Enter the charity-app folder and run the following commands:

  * docker rm -f $(docker ps -aq)

  * Start up Hyperledger

  * ./startFabric.sh

From the same charity-app folder, install the required Node packages and register the Admin and User components of the network before starting the application.

* npm install

* node registerAdmin.js

* node registerUser.js

* node server.js

The client should launch on localhost:8000 in any web browser.
