# charity-blockchain

__Simple blockchain application to keep a track of charity registrations and spending.__

Every time you donate money to a charity, do you know how much money they have at any point in time? Do you know when, where and how your money is being spent? I am building a simple blockchain application to keep track of charity registrations and spending. This will help identify where every dollar is donated and spent.

__Current Issues__ (Working on a fix!)

* Removed the ability to create a unique channel for each charity organization due to an error.
* Removed the ability to record a query to the ledger as a transaction. Looking to add a new feature indicating whether a read or write was performed and record every activity in the ledger.
* Working to provide a historical view of transactions made by every user. This would provide a more detailed yet cleaner user interface.
* Working on building a view to show spending by charity.
* Looking to automate the process of capturing a unique ID for each ledger entry. (Currently user is expected to enter a unique ID that is currently not in the ledger)

This is a work in progress. Keep a look out for new features and do provide your suggestions! To have a look at what's working right now, follow the installation instructions below.

__Demo__

Click [HERE](https://youtu.be/Ru4A2LDpeWY) to view a demo!

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

__Screenshots__

![img](https://github.com/SachinSaligram/charity-blockchain/blob/master/images/homepage.png)
![img](https://github.com/SachinSaligram/charity-blockchain/blob/master/images/org%20view.png)
