import React from "react";
import { ethers } from "ethers";
import { useState } from "react";
import "./App.css";
import TransferKittyAddress from "./components/TranserKittyAddress.js";
import Header from "./components/Header";
import NumberBox from "./components/NumberBox";
import ContractLogin from "./components/ContractLogin";
import contractABI from "./contractABI.json";
import contractCode from "./ContractBytecode.json";
import GiveFeesToAddress from "./components/GiveFeesToAddress";
import CreateContract from "./components/CreateContract";
import KittyMint from "./components/KittyMint";

function App() {
    const [beManager, setbeManager] = useState(false);
    const [bePlayer, setbePlayer] = useState(false);
    const [contract, setContract] = useState(null);
    const [showAddressAdd, setShowAddressAdd] = useState(true);
    const [showAccountAdd, setShowAccountAdd] = useState(true);
    const [showListOfContract, setShowListOfContract] = useState(false);
    const [addressOfContract, setAddressOfContract] = useState(null);
    const [ClosingLotteryBlockNumber, setClosingLotteryBlockNumber] = useState(null);
    const [addressOfAccount, setAddressOfAccount] = useState("");
    const [roundDuration, setRoundDuration] = useState(0);
    const [fee, setFee] = useState("");
    const [isLotteryClosed, setIsLotteryClosed] = useState(false);
    const [showLotteryCreation, setShowLotteryCreation] = useState(true);
    const [AreNumbersDrawn, setAreNumbersDrawn] = useState(false);
    const [NumbersDrawn, setNumbersDrawn] = useState("");
    const [CanStartNewRound, setCanStartNewRound] = useState(true);
    const [playedNumbers, setPlayedNumbers] = useState(false);
    const [prizeAssigned, setPrizeAssigned] = useState(false);
    const [kittyShow, setkittyShow] = useState(false);
    const [ownedKitties, setOwnedKitties] = useState([]);
    const [knownContracts, setKnownContracts] = useState([]);
    const [currentRoundNumber, setCurrentRoundNumber] = useState(null);
    const [roundStartingBlockNumber, setRoundStartingBlockNumber] = useState(-1);
    const [currentBlock, setCurrentBlock] = useState(-1);
    const [ListOfNumbersPlayed, setListOfNumbersPlayed] = useState([]);
    const [warningText, setwarningText] = useState("")

    //connects with metamask account
    const connectAccountHandler = () => {
        // open the metamask menu to select an account to use
        if (window.ethereum) {
            window.ethereum
                .request({ method: "eth_requestAccounts" })
                .then((result) => {
                    accoutChangeHandler(result[0]);
                    setShowAccountAdd(false);
                });
        } else {
            alert("Need to install MetaMask!");
        }
    };

    //sets the address of the user account on the GUI update the contract object
    const accoutChangeHandler = (newAccount) => {
        //set the address of the current in the global state variable
        setAddressOfAccount(newAccount);
        if (addressOfContract != null) {
            updateEthers(addressOfContract); //set the current contract being used
        }
    };


    const player = () => { //triggered when user clicks be player
        setbePlayer(true);
        findLotteryCreated(); //search for all the contracts created
    };


    const findLotteryCreated = async () => {
        // discover all the created lottery contracts found by the provider
        let provider = new ethers.providers.Web3Provider(window.ethereum); //use the web3provider which binds automatically to the locally  deployed  Ganache network
        //const provider = new ethers.providers.JsonRpcProvider("http://localhost:545");  //use the web3provider which binds automatically to the locally  deployed  Ganache network
        provider.resetEventsBlock(0); //scan from the first block for events
        provider.pollingInterval = 500;

        let filter1 = {
            //setting filter to listen for events related to more than one contract, listen for createdContract event from the start of the blockchain
            topics: [ethers.utils.id("createdContract(uint8,uint64)")],
            fromBlock: 0
        };
        let queryCreatedResult = await provider.getLogs(filter1); //read all the logs related to the createdContract event.
        let last = queryCreatedResult[queryCreatedResult.length - 1];
        let i = 0;
        let iFace = new ethers.utils.Interface(contractABI); //get from the abi the interface to parse the event log
        for (i; i <= queryCreatedResult.length - 1; i++) {// read every event found from the logs
            let data = queryCreatedResult[i].data;
            let topics = queryCreatedResult[i].topics;
            let parsed = iFace.parseLog({ data, topics }); //parse event
            let contractObject = {};
            contractObject.address = queryCreatedResult[i].address;
            contractObject.rounds = parsed.args[0].toString(); // parameters 0 and 1 of the
            contractObject.fee = parsed.args[1].toString(); // information to show in the list of contracts in the GUI
            contractObject.blockNumber = queryCreatedResult[i].blockNumber;
            contractObject.transactionIndex = queryCreatedResult[i].transactionIndex;
            setKnownContracts((knownContracts) => [
                contractObject,
                ...knownContracts,
            ]);//add the most recent contract information to the head of the list
            setShowListOfContract(true);
        }

        //set a listener on all the new createdContract event after the opening of the web app player section
        const listenFromBlock = last!=null ? (last.blockNumber+1):0;

        let filter2 = {
            //setting filter to listen for events related to more than one contract, by default fromBlock is latest.
            topics: [ethers.utils.id("createdContract(uint8,uint64)")],
        };
        provider.resetEventsBlock(listenFromBlock); // order the provider toread events only from the specified block number,
        // it cannot be done in the filter itself as it is not supported for provider.on https://github.com/ethers-io/ethers.js/issues/498
        provider.on(filter2, (log) => {
            //listen for newly created createdContract
            let data = log.data;
            let topics = log.topics;
            let parsed = iFace.parseLog({ data, topics }); //parse event
            let contractObject = {};
            contractObject.address = log.address;
            contractObject.rounds = parsed.args[0].toString(); // parameters 0 and 1 of the
            contractObject.fee = parsed.args[1].toString(); // information to show in the list of contracts in the GUI
            contractObject.blockNumber = log.blockNumber;
            contractObject.transactionIndex = log.transactionIndex;
            setKnownContracts((knownContracts) => [
                contractObject,
                ...knownContracts,
            ]);
            setShowListOfContract(true);
        });
    };

    
    //Function executed by pressing the button connect contract after
    //typing the contract address (player)
    const connectContract = ({ contractAddress }) => {
        //Function executed by pressing the button connect contract after
        //typing the contract address
        if (ethers.utils.isAddress(contractAddress)) {
            // change GUI
            setShowAddressAdd(false);
            setShowListOfContract(false);
            setAddressOfContract(contractAddress);
            updateEthers(contractAddress); // Set the global variable contract to the one of the given address
            checkLotteryCreation(contractAddress); //get the parameters of the specific contract createdLottery event
            checkLotteryClosure(contractAddress); //Activate listener to get the lotteryClosure event
            window.ethereum.on('accountsChanged', function (accounts) {
                alert("Metemask account switched to:"+ accounts[0])
                accoutChangeHandler(accounts[0])
              })
              
        } else {
            alert("Insert valid contract address");
            return;
        }
    };

    const updateEthers = (contractAddress) => {
        //set a global contract object with a signer (allows to execute normal functions instead of just view functions)
        let tempProvider = new ethers.providers.Web3Provider(window.ethereum); //select web3provider which binds to the ganache local network
        let tempSigner = tempProvider.getSigner(); //allow both  read and write operations with the contract
        let tempContract = new ethers.Contract(
            contractAddress,
            contractABI,
            tempSigner
        );
        setContract(tempContract); //set the constant global variable contract to the new contract object which allows reads and writes op
    };

    //gets the round duration and the fee value for the specified contract (also checking that it is a lottery contract)
    const checkLotteryCreation = async (contractAddress) => {
        let provider = new ethers.providers.Web3Provider(window.ethereum);

        let contract = new ethers.Contract(
            contractAddress,
            contractABI,
            provider
        ); //provider, read only    contractABI, tempProvider);

        let filterCreatedContract = {
            topics: [ethers.utils.id("createdContract(uint8,uint64)")], //NOTE:uint256 should be specified, not just uint
            address: contractAddress,
            fromBlock: "earliest",
            toBlock: "latest",
        };
        provider.pollingInterval = 1000;

        provider.resetEventsBlock(0);
        let queryCreatedResult = await provider.getLogs(filterCreatedContract);

        if (queryCreatedResult.length == 1) {
            let iFace = contract.interface;
            let topics = queryCreatedResult[0].topics;
            let data = queryCreatedResult[0].data;
            let parsed = iFace.parseLog({ data, topics });

            let durationOfRound = parsed.args[0];
            let fee = parsed.args[1];
            setShowLotteryCreation(false);
            setAddressOfContract(contractAddress); //update GUI
            setCurrentRoundNumber(-1); //set as -1 before fetching the current round number (if first round started)
            setFee(fee);//update GUI
            setRoundDuration(durationOfRound); //update GUI
            updateEthers(contractAddress); //set up provider and contract global variables

            let filter1 = {
                topics: [ethers.utils.id("createdContract(uint8,uint64)")],
                fromBlock: 0,
            };
            provider.off(filter1); //if the contract selected exists, then stop the listener for new contractCreated events (started in findLotteryCreated).


            // find the most recent round started
            let filterRound = {
                topics: [ethers.utils.id("roundStarted(uint256,uint256)")], //NOTE:uint256 should be specified, not just uint
                address: contractAddress,
                toBlock: "latest",
                fromBlock: "earliest",
            };
            let roundStartedEvents = await provider.getLogs(filterRound);

            if (roundStartedEvents.length == 0) { //if no round started
                //first round has to start
                checkLotteryRound(contractAddress); //Activate listener to get the parameters of the roundStarted event when first round start
            } else {
                //at least one round has started, the last known round info are displayed, the round may or may not have ended
                topics =
                    roundStartedEvents[roundStartedEvents.length - 1].topics;
                data = roundStartedEvents[roundStartedEvents.length - 1].data;
                parsed = iFace.parseLog({ data, topics });
                let lastRoundStartingBlockNumber = parsed.args[0];
                let lastRoundId = parsed.args[1];
                setCurrentRoundNumber(lastRoundId);
                setRoundStartingBlockNumber(lastRoundStartingBlockNumber);
                let currentBlock = await provider.getBlockNumber(); //get block number to find out if the last known round is still active
                //check if the last known round is active or not
                if (
                    lastRoundStartingBlockNumber.toNumber() + durationOfRound >
                    currentBlock
                ) {
                    //active round case
                    setCanStartNewRound(false);
                    setAreNumbersDrawn(false);
                    setCanStartNewRound(false);
                    setPrizeAssigned(false);
                    setPlayedNumbers(false);
                    setNumbersDrawn("");
                    setListOfNumbersPlayed([]);
                } else {
                    //round has ended case
                    checkLotteryRound(contractAddress); //Activate listener to get the parameters of the roundStarted event
                }
            }
        } else {
            alert("Contract does not exist or is not a Lottery contract");
        }
        //activate a provider to get the last block number to display on the GUI
        provider.on("block", (blockNum) => {
            setCurrentBlock(blockNum);
        });
    };

    //find the current lottery round and update the GUI with information about the most recent start
    const checkLotteryRound = async (contractAddress) => {
        let provider = new ethers.providers.Web3Provider(window.ethereum);
        let contract = new ethers.Contract(
            contractAddress,
            contractABI,
            provider
        );
        let filterRound = {
            topics: [ethers.utils.id("roundStarted(uint256,uint256)")], //NOTE:uint256 should be specified, not just uint
            address: contractAddress,
            fromBlock: "latest",
        };
        provider.pollingInterval = 1000;
        provider.on(filterRound, (log) => {
            let iFace = contract.interface;
            let topics = log.topics;
            let data = log.data;
            let parsed = iFace.parseLog({ data, topics });
            let blockNumber = parsed.args[0];
            let roundId = parsed.args[1];
            setCurrentRoundNumber(roundId);
            setRoundStartingBlockNumber(blockNumber);
            setCanStartNewRound(false);
            setAreNumbersDrawn(false);
            setCanStartNewRound(false);
            setPrizeAssigned(false);
            setPlayedNumbers(false);
            setNumbersDrawn("");
            setListOfNumbersPlayed([]);
        });
    };

    //function triggered by pressing the play lottery button
    const playLottery = (
        number1,
        number2,
        number3,
        number4,
        number5,
        number6 ) => {
        //callback from pressing the buy ticket button
        let ticketObject = {}; //create ticket item for the GUI
        ticketObject.first = number1;
        ticketObject.second = number2;
        ticketObject.third = number3;
        ticketObject.fourth = number4;
        ticketObject.fifth = number5;
        ticketObject.powerBall = number6;
        buyTicket(
            number1,
            number2,
            number3,
            number4,
            number5,
            number6,ticketObject
        ); //calling the async function which will execute the contract call
    };

    const buyTicket = async (
        number1,
        number2,
        number3,
        number4,
        number5,
        number6,
        ticketObject
    ) => {
        // perform the buy operation
        let valueFee = BigInt(fee);
        let options = { value: valueFee }; //set as options for the function call the value of the fee, needed to actually buy the ticket
        //using the global variable contract(paired with signer) to perform a contract call
        let transactionResult = await contract.buy(
            [number1,
                number2,
                number3,
                number4,
                number5,
                number6],
            options
        );
        try {
             await transactionResult.wait(1);
            //wait for transaction to be on the blockchain, if it does, add
            //to the GUI the numbers played
            setListOfNumbersPlayed((ListOfNumbersPlayed) => [
                ...ListOfNumbersPlayed,
                ticketObject,
            ]);
            setPlayedNumbers(true);
            checkNumbersDrawn(contract.address, currentRoundNumber.toNumber()); //wait and check if numbers were drawn for the current round
        } catch (e) {
            if (e.code === ethers.utils.Logger.errors.CALL_EXCEPTION) {
                console.log(e)
            }
        }
    };

    //Player exchange kitties
    const transferKitty = async ({ newOwnerAddress }, { kittyId }) => {
        //since in the ABI there are two safeTransferFrom function versions, with two parameters
        let transactionResult = await contract[
            "safeTransferFrom(address,address,uint256)"
        ](
            ethers.utils.getAddress(addressOfAccount),
            ethers.utils.getAddress(newOwnerAddress),
            kittyId
        );
        try {
            await transactionResult.wait(); //wait for transaction resut
            getKittiesOfAccount(); //check for the updated list of owned kittie
        } catch (e) {
            if (e.code === ethers.utils.Logger.errors.CALL_EXCEPTION) {
                console.log(e);
            }
        }
    };







    const manager = () => { //triggered when user clicks be manager
        setbeManager(true);
    };

    //contract creation method   
    const ContractCreate = async (fee, roundDuration ) => {
        let tempProvider = new ethers.providers.Web3Provider(window.ethereum);
        let tempSigner = tempProvider.getSigner(); //perform with it read and write in the contract
        //creating a contract factory with the contract ABI, bytecode and the signer object to perform function calls
        let contractFactory = new ethers.ContractFactory(
            contractABI,
            contractCode,
            tempSigner
        );
        let contractTransactionResult = (await contractFactory.deploy(roundDuration, fee)); //use the deploy function of the factory
        try {
            let newres = await contractTransactionResult.deployTransaction.wait(1);
            tempProvider.on("block", (blockNum) => { //set listener to update the current block number and read it on the GUI
                setCurrentBlock(blockNum);
            });
    
            let logContractCreation = newres.logs[1];
            let iFace = contractTransactionResult.interface;
            let topics = logContractCreation.topics;
            let data = logContractCreation.data;
            let parsed = iFace.parseLog({ data, topics });
            let durationOfRound = parsed.args[0];
            let fee = parsed.args[1];
            setShowLotteryCreation(false);
            setAddressOfContract(contractTransactionResult.address); //update GUI
            setCurrentRoundNumber(-1); //set as -1 before fetching the current round number (if first round started)
            setFee(fee);//update GUI
            setRoundDuration(durationOfRound); //update GUI
            updateEthers(contractTransactionResult.address); //set up provider and contract global variables
            window.ethereum.on('accountsChanged', function (accounts) { // set listener to see if user changed account (must be owner account to perform lottery management)
                alert("Metemask account switched to:"+ accounts[0])
                if(accounts[0] != addressOfAccount){
                    setwarningText("Detected switch of Metamask account. Switch back to owner account")
                }
                else{
                    setwarningText("")
                }
              })

        } catch (e) {
            if (e.code === ethers.utils.Logger.errors.CALL_EXCEPTION) {
                console.log(e)
            }
        }
        //checkLotteryCreation(contract.address);
    };

    const manageExistingLottery =  ({ contractAddress }) => {
        if (ethers.utils.isAddress(contractAddress)) { // check if address is correct
            checkLotteryCreationManageExistingLottery(contractAddress); //check if lottery contract exists
        }
        else{
            alert("Insert a valid contract address");
        }
    };

    
    const checkLotteryCreationManageExistingLottery = async (
        contractAddress
    ) => {       
        let provider = new ethers.providers.Web3Provider(window.ethereum);
        let contract = new ethers.Contract(
            contractAddress,
            contractABI,
            provider
        ); 
        let filterCreatedContract = {
            topics: [ethers.utils.id("createdContract(uint8,uint64)")], //NOTE:uint256 should be specified, not just uint
            address: contractAddress,
            fromBlock: "earliest",
            toBlock: "latest",
        };
        provider.pollingInterval = 1000;
        provider.resetEventsBlock(0);
        let queryCreatedResult = await provider.getLogs(filterCreatedContract);

        if (queryCreatedResult.length == 1) { //if createdContract event is written on the blockchain
            //if contract exist, then check if the current account is also the owner of it.
            let transactionResult= await contract.owner();
            let ownwerAddress = ethers.utils.getAddress(String(transactionResult))
            if( ethers.utils.getAddress(addressOfAccount) != ownwerAddress ){
                alert("Contract is not owned by this account")
                return;
            }
            let iFace = contract.interface;
            let topics = queryCreatedResult[0].topics;
            let data = queryCreatedResult[0].data;
            let parsed = iFace.parseLog({ data, topics });

            let round = parsed.args[0];
            let fee = parsed.args[1];
            
            setShowLotteryCreation(false);
            setAddressOfContract(contractAddress);
            setCurrentRoundNumber(-1);
            setFee(fee);
            setRoundDuration(round);
            updateEthers(contractAddress); //update the global contract variable
            checkLotteryRoundManageExistingLottery(contractAddress, round); //check in what status is the lottery (i.e: last round still active)
            window.ethereum.on('accountsChanged', function (accounts) { // set listener to see if user changed account (must be owner account to perform lottery management)
                alert("Metemask account switched to:"+ accounts[0])
                if(accounts[0] != addressOfAccount){
                    setwarningText("Detected switch of Metamask account. Switch back to owner account")
                }
                else{
                    setwarningText("")
                }
              })

        } else {
            alert("Contract does not exist or is not a Lottery contract");
            return;
        }
        provider.on("block", (blockNum) => { //set listener to update GUI with current block
            setCurrentBlock(blockNum); 
        });

    };

   
    const checkLotteryRoundManageExistingLottery = async (
        contractAddress,
        roundDuration
    ) => {
        let provider = new ethers.providers.Web3Provider(window.ethereum);
        let contract = new ethers.Contract(
            contractAddress,
            contractABI,
            provider
        ); //provider, read only    contractABI, tempProvider);

        let filterRound = {
            topics: [ethers.utils.id("roundStarted(uint256,uint256)")], //NOTE:uint256 should be specified, not just uint
            address: contractAddress,
            fromBlock: "latest",
        };
        // we must fix the set thing!!!
        let pastRoundStarted = await provider.getLogs(filterRound);
        if (pastRoundStarted.length > 0) { //check if at least one round of the lotter started
            let iFace = contract.interface;
            let topics = pastRoundStarted[pastRoundStarted.length - 1].topics;
            let data = pastRoundStarted[pastRoundStarted.length - 1].data;
            let parsed = iFace.parseLog({ data, topics });
            let blockNumberRoundStart = parsed.args[0];
            let currentRoundId = parsed.args[1];
            let currentBlock = await provider.getBlockNumber();
            if (blockNumberRoundStart + roundDuration > currentBlock) { //check if latrst round is still active
                setCurrentRoundNumber(currentRoundId);
                setRoundStartingBlockNumber(blockNumberRoundStart);
                setCanStartNewRound(false); //update the GUI
            } else {
                //checking if numbers were drawn for current round
                let filterNumbersDrawn = {
                    topics: [
                        ethers.utils.id("NumbersDrawn(uint256[6],uint256)"),
                    ], //NOTE:uint256 should be specified, not just uint
                    address: contractAddress,
                    fromBlock: "latest",
                };
                let lastDrawnNumbers = await provider.getLogs(
                    filterNumbersDrawn
                );
                topics = lastDrawnNumbers[lastDrawnNumbers.length - 1].topics;
                data = lastDrawnNumbers[lastDrawnNumbers.length - 1].data;
                parsed = iFace.parseLog({ data, topics });
                let roundIdDrawn = parsed.args[1];
                if (roundIdDrawn != currentRoundId) {
                    alert("Draw numbers");
                } else { //check if rewards were given
                    let filterRewardsGiven = {
                        topics: [ethers.utils.id("RewardsGiven(uint256)")], //NOTE:uint256 should be specified, not just uint
                        address: contractAddress,
                        fromBlock: "latest",
                    };
                    let lastRewardsGiven = await provider.getLogs(
                        filterRewardsGiven
                    );

                    topics =
                        lastRewardsGiven[lastRewardsGiven.length - 1].topics;
                    data = lastRewardsGiven[lastRewardsGiven.length - 1].data;
                    parsed = iFace.parseLog({ data, topics });
                    let roundIdRewards = parsed.args[0];
                    if (roundIdRewards != currentRoundId) {
                        setPrizeAssigned(false);
                    } else {
                        setPrizeAssigned(true);
                        setCanStartNewRound(true);
                    }
                }
            }
        }
    };

    const drawNumbers = async () => {
        if (
            currentBlock >=
            parseInt(roundStartingBlockNumber) + parseInt(roundDuration)
        ) {
            //check if number can be drawn
            let transactionResult = await contract.drawNumbers(); //call the drawNumbers method of the contract.
            try {
                let newres = await transactionResult.wait();
                let logDraw = await newres.logs[0];
                let iFace = contract.interface;
                let topics = logDraw.topics;
                let data = logDraw.data;
                let parsed = iFace.parseLog({ data, topics });
                let roundPicks = parsed.args[0];
                setAreNumbersDrawn(true);
                setNumbersDrawn(roundPicks.toString());
            } catch (e) {
                if (e.code === ethers.utils.Logger.errors.CALL_EXCEPTION) {
                    console.log(e);
                }
            }
            //checkNumbersDrawn(contract.address, currentRoundNumber) //get the number drawn from the NumbersDrawn event
        } else {
            alert("Wait for all round turns to end");
        }
    };

    const checkNumbersDrawn = async (contractAddress, roundNumber) => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);

        const contract = new ethers.Contract(
            contractAddress,
            contractABI,
            provider
        ); //provider, read only    contractABI, tempProvider);

        let filterNumbersDrawn = {
            // get only the latest NumbersDrawn event
            topics: [ethers.utils.id("NumbersDrawn(uint256[6],uint256)")], //NOTE:uint256 should be specified, not just uint
            address: contractAddress,
            fromBlock: "latest",
        };
        provider.on(filterNumbersDrawn, (log) => {
            let iFace = contract.interface;
            let topics = log.topics;
            let data = log.data;
            let parsed = iFace.parseLog({ data, topics });
            let roundPicks = parsed.args[0];
            let roundId = parsed.args[1];

            if (roundId.toNumber() != roundNumber) return;
            provider.off(filterNumbersDrawn);
            setAreNumbersDrawn(true);
            setNumbersDrawn(roundPicks.toString());
            checkRewardsGiven(contract.address, roundNumber);
        });
    };

    const givePrizes = async () => {
        //let  val= await contract.nonUsefullTransaction1();
        let transactionResult = await contract.givePrizes(addressOfAccount);
        try {
            const receiptRewards = await transactionResult.wait();
            let logRewardsLogs = await receiptRewards.logs;
            let logRewardsEvent = logRewardsLogs[logRewardsLogs.length - 1]; //the givePrizes function can  have events for minted kitties, the RewardsGiven event is the last event 
            let iFace = contract.interface;
            let topics = logRewardsEvent.topics;
            let data = logRewardsEvent.data;
            let parsed = iFace.parseLog({ data, topics });
            let roundId = parsed.args[0];
            if (currentRoundNumber != roundId.toNumber()) return;
            setCanStartNewRound(true);
            setPrizeAssigned(true);

        } catch (e) {
            if (e.code === ethers.utils.Logger.errors.CALL_EXCEPTION) {
                // If the error was SomeCustomError(), we can get the args...
                if (e.errorName === "SomeCustomError") {
                    // These are both the same; keyword vs positional.
                    console.log(e.errorArgs.addr);
                    console.log(e.errorArgs[0]);
                    // These are both the same; keyword vs positional
                    console.log(e.errorArgs.value);
                    console.log(e.errorArgs[1]);
                }
            }
        }
    };

    //give prizes to account with address put into form
    const givePrizesToSelectedAddress = ({ addressPayTo }) => {
        prizesToAddress(addressPayTo);
    };

    const prizesToAddress = async (addressToPay) => {
        //let  val= await contract.nonUsefullTransaction1();
        let transactionResult = await contract.givePrizes(
            ethers.utils.getAddress(addressToPay)
        );
        try {
            
            const receiptRewards = await transactionResult.wait();
            let logRewardsLogs = await receiptRewards.logs;
            let logRewardsEvent = logRewardsLogs[logRewardsLogs.length - 1]; //the givePrizes function can  have events for minted kitties, the RewardsGiven event is the last event 
            let iFace = contract.interface;
            let topics = logRewardsEvent.topics;
            let data = logRewardsEvent.data;
            let parsed = iFace.parseLog({ data, topics });
            let roundId = parsed.args[0];
            if (currentRoundNumber != roundId.toNumber()) return;
            setCanStartNewRound(true);
            setPrizeAssigned(true);
        } catch (e) {
            if (e.code === ethers.utils.Logger.errors.CALL_EXCEPTION) {
                console.log(e);
            }
        }
    };
    const checkRewardsGiven = async (contractAddress, roundNumber) => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);

        const contract = new ethers.Contract(
            contractAddress,
            contractABI,
            provider
        ); //provider, read only    contractABI, tempProvider);

        let filterRewardsGiven = {
            topics: [ethers.utils.id("RewardsGiven(uint256)")], //NOTE:uint256 should be specified, not just uint
            address: contractAddress,
            fromBlock: "latest"
        };

        provider.on(filterRewardsGiven, (log) => {
            let iFace = contract.interface;
            let topics = log.topics;
            let data = log.data;
            let parsed = iFace.parseLog({ data, topics });
            let roundId = parsed.args[0];
            if (roundNumber != roundId.toNumber()) return;
            setCanStartNewRound(true);
            setPrizeAssigned(true);
            provider.off(filterRewardsGiven);
            checkLotteryRound(contract.address); // check for new round to have started

        });
    };

    const startNewRound = async () => {
        let transactionResult = await contract.startNewRound();
        try {
            let startRoundReceipt = await transactionResult.wait();
            let logStartRound = await startRoundReceipt.logs;
            let logRoundEvent = logStartRound[logStartRound.length - 1]; //the startRound event is the last of the method, the other are for the mint event of a kitty

            let iFace = contract.interface;
            let topics = logRoundEvent.topics;
            let data = logRoundEvent.data;
            let parsed = iFace.parseLog({ data, topics });
            let blockNumber = parsed.args[0];
            let roundId = parsed.args[1];
            if (roundId > currentRoundNumber && CanStartNewRound) {
                setAreNumbersDrawn(false);
                setCanStartNewRound(false);
                setPrizeAssigned(false);
                setPlayedNumbers(false);
                setNumbersDrawn("");
                setCurrentRoundNumber(roundId);
                setRoundStartingBlockNumber(blockNumber);
                if (kittyShow && beManager) {
                    getKittiesOfAccount();
                }
            }
            return;
        } catch (e) {
            if (e.code === ethers.utils.Logger.errors.CALL_EXCEPTION) {
                console.log(e)
            }
        }
        //checkNewRoundStarted();
    };

    //closes lottery
    const closeLottery = async () => {
        let transactionResult=await contract.closeLottery();
        try {

            let newres = await transactionResult.wait();
            let closedLottery = await newres.logs;
            let closeLotteryEvent = closedLottery[closedLottery.length - 1]
            let iFace = contract.interface;
            let topics = closeLotteryEvent.topics;
            let data = closeLotteryEvent.data;
            let parsed = iFace.parseLog({ data, topics });
            let blockNumber = parsed.args[0].toString();
            setIsLotteryClosed(true);
            setClosingLotteryBlockNumber(blockNumber);
        } catch (e) {
            if (e.code === ethers.utils.Logger.errors.CALL_EXCEPTION) {
                console.log(e);
            }
        }

    };

    const checkLotteryClosure = async (contractAddress) => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(
            contractAddress,
            contractABI,
            provider
        ); //provider, read only    contractABI, tempProvider);
        let filterCloseLottery = {
            topics: [ethers.utils.id("CloseLottery(uint256)")], //NOTE:uint256 should be specified, not just uint
            address: contractAddress,
            fromBlock: "latest",
        };

        provider.on(filterCloseLottery, (log) => {
            let iFace = contract.interface;
            let topics = log.topics;
            let data = log.data;
            let parsed = iFace.parseLog({ data, topics });
            let blockNumber = parsed.args[0];
            provider.off(filterCloseLottery);
            setIsLotteryClosed(true);
            setClosingLotteryBlockNumber(blockNumber);
        });
    };

    //get the kitties token (ids) of an account and their information
    const getKittiesOfAccount = async () => { 
        let tokenIds = await contract.getAllOwnerTokens(); //return a collection of kitty tokens
        console.log(tokenIds);
        setkittyShow(true);
        const kittyInfo = [];
        for (let i = 0; i < tokenIds.length; i++) { //get information (picture, class,name) for all kitty
            const result = await contract.getKittyCollectibleAndTokenInfoByTokenId(
                tokenIds[i]
            );//get information for the kitty token id
            kittyInfo[i] = {};
            kittyInfo[i].kittyId = tokenIds[i].toString();
            kittyInfo[i].name = String(result[1]);
            kittyInfo[i].class = String(result[0]);
            kittyInfo[i].url = String(result[2]);
            kittyInfo[i].transferKitty = false;
        }
        setOwnedKitties(kittyInfo);
    };
    const hideKitties = async () => {
        setkittyShow(false);
    };
    //manager mint new kitty
    const mintKitty = async (kittyClass) => {
        let transactionResult = await contract.mint(kittyClass);
        try {
            await transactionResult.wait(); //wait for kitty to be minted before updating the list of kitties
            getKittiesOfAccount(); //check for the updated list of owned kitties
        } catch (e) {
            if (e.code === ethers.utils.Logger.errors.CALL_EXCEPTION) {
                console.log(e);
            }
        }
    };


  function List({}) {
    const itemList = ownedKitties.map((item) => (
      <li>
      <div className='container'>
        <h1>TokenID: {item.kittyId} </h1> <h1>Kitty Name: {item.name}  </h1> <h1>Class:{item.class} </h1> 
        <img src={item.url} width={200} height={200} alt="Kitty Description "></img>        
        <div>
          {<TransferKittyAddress onAdd={transferKitty} kittyId={parseInt(item.kittyId)}/>}
        </div>


        </div>
      </li>
      
    ));
    console.log(itemList);
    return (
      <div>
        <ol style={{ listStyleType: "none" }}>{itemList}</ol>
      </div>
    );
  }
  function ListOfContracts({}) {
    const itemList2 = knownContracts.map((item) => (
      <li key={item.address}>
      <div className='container2'>
        <h3>Contract Address: {item.address} </h3> Fee: {item.fee} wei   - Round lenght:{item.rounds} - Block Creation: {item.blockNumber} - In block index: {item.transactionIndex}
        </div>
      </li>
      
    ));
    return (
      <div>
        <ol style={{ listStyleType: "none" }}>{itemList2}</ol>
      </div>
    );
  
  }
  function PlayedNumbersList({}) {
    const itemList2 = ListOfNumbersPlayed.map((item) => (
      <li key={item.address}>
      <div className='container4'>
      {item.first} - {item.second} - {item.third} - {item.fourth} - {item.fifth} - {item.powerBall}
        </div>
      </li>
      
    ));
    return (
      <div>
        <ol style={{ listStyleType: "none" }}>{itemList2}</ol>
      </div>
    );
  
  }

  function ListManager({}) {
    const itemList = ownedKitties.map((item) => (
      <li>
      <div className='container'>
        <h1>TokenID: {item.kittyId} </h1> <h1>Kitty Name: {item.name}  </h1> <h1>Class:{item.class} </h1> 
        <img src={item.url} width={200} height={200} alt="Kitty Description "></img>        

        </div>
      </li>
      
    ));
    console.log(itemList);
    return (
      <div>
        <ol style={{ listStyleType: "none" }}>{itemList}</ol>
      </div>
    );
  }

  return (
    <div className="App">
      <Header/>

      {(!beManager&&!bePlayer) && <button className='btn btn-block-manager' onClick={manager}>Be manager</button>}
      {(!beManager&&!bePlayer) && <button className='btn btn-block-player' onClick={player}>Be player</button>}
      {(beManager && showLotteryCreation && !showAccountAdd) && <h2 className='container5'>Manage existing Lottery contract</h2>}
      {(beManager && showLotteryCreation && !showAccountAdd) && <ContractLogin onAdd={manageExistingLottery} />}
      {(beManager && showLotteryCreation && !showAccountAdd) && <h2 className='container5'>Create new Lottery contract</h2>}

      {(beManager && showLotteryCreation && !showAccountAdd) && <CreateContract onAdd={ContractCreate}/>}
      {(beManager  && showAccountAdd) && <button className='btn btn-connectAccount' onClick={connectAccountHandler}>Connect Account</button>}
      {( beManager && !showAccountAdd) &&<h2>Lottery owner account address: {addressOfAccount}</h2>}
      {( beManager && !showAccountAdd && warningText != '') &&<h2 className="container5">{warningText}</h2>}

      {(beManager && !showLotteryCreation) &&<div className="container3">
        <text style={{ fontSize: "1.3rem" }}>Contract Address: {addressOfContract}</text>
        <h3 style={{ fontSize: "2rem" }} >Round duration: {roundDuration.toString()}</h3>
        <h3 style={{ fontSize: "2rem" }}>Fee value: {fee.toString()} wei</h3>
       {(!CanStartNewRound  && !isLotteryClosed ) && <html style={{ fontSize: "2rem" }}>Lottery turn number: {currentRoundNumber.toString()}</html>}
       {(!CanStartNewRound  && !isLotteryClosed) &&<html style={{ fontSize: "2rem" }}>Turn starting block number: {roundStartingBlockNumber.toString()}</html>}
       {(!CanStartNewRound  && !isLotteryClosed) &&<html style={{ fontSize: "2rem" }}>Current block number: {currentBlock.toString()}</html>}

        </div>}

      {(beManager && !showLotteryCreation && !AreNumbersDrawn && !CanStartNewRound  && !isLotteryClosed) &&  <button className='btn btn-connectAccount' onClick={drawNumbers}>DrawNumbers</button> }
      {(beManager && !showLotteryCreation && AreNumbersDrawn && !CanStartNewRound  && !isLotteryClosed) &&  <h1 className='numbers'>{NumbersDrawn}</h1> }
      {(beManager && !showLotteryCreation && AreNumbersDrawn && !CanStartNewRound  && !isLotteryClosed) &&<button className='btn btn-connectAccount' onClick={givePrizes}>Give Prizes and collect fees to current Account address</button>  }
      {(beManager && !showLotteryCreation && AreNumbersDrawn && !CanStartNewRound && !isLotteryClosed) && <GiveFeesToAddress onAdd={givePrizesToSelectedAddress}/>}

      {(beManager && !showLotteryCreation && CanStartNewRound && !isLotteryClosed) &&<button className='btn btn-connectAccount' onClick={startNewRound}>Start New Round!!</button>  }
      {(beManager && !showLotteryCreation && !isLotteryClosed) &&<button className='btn btn-closeLottery' onClick={closeLottery}>Close Lottery!!</button>  }
      {(beManager && !showLotteryCreation && isLotteryClosed) &&<h1 className='numbers'>Lottery closed at block {ClosingLotteryBlockNumber.toString()}</h1>  }
        
      {(bePlayer && showAddressAdd) && <ContractLogin onAdd={connectContract} />}
      {(bePlayer && !showAddressAdd) &&<h3 style={{ fontSize: "1.3rem" }} >Contact Address:{addressOfContract}</h3>}
      {(bePlayer &&showAccountAdd) && <button className='btn btn-connectAccount' onClick={connectAccountHandler}>Connect Account</button>}
      {( bePlayer && !showAccountAdd) &&<h3 style={{ fontSize: "1.3rem" }}>Account Address: {addressOfAccount}</h3>}
      {(bePlayer && !showListOfContract && showAddressAdd)&& <h1 className=
      "container2">Wait for list of contracts to be populated... <br></br>
        If not connected, connect Metamask to the desidered network(Ganache).
      </h1> }
      {(bePlayer && showListOfContract && showAddressAdd)&& <ListOfContracts/> }
      {(bePlayer &&!showAddressAdd && !showAccountAdd) &&<div className="container3">  

      {(bePlayer &&!showAddressAdd && !showAccountAdd ) && <html style={{ fontSize: "2rem" }}>Fee value: {fee.toString()}  - Round Duration: {roundDuration.toString()}</html>}
      {(bePlayer && !isLotteryClosed &&!showAddressAdd && !showAccountAdd && CanStartNewRound) &&<h1 style={{ fontSize: "2rem" }}>Waiting for round to start...</h1>}

      {(bePlayer && !isLotteryClosed &&!showAddressAdd && !showAccountAdd && !CanStartNewRound) &&<html style={{ fontSize: "2rem" }}>Lottery turn number: {currentRoundNumber.toString()}</html>}
      {(bePlayer && !isLotteryClosed &&!showAddressAdd && !showAccountAdd && !CanStartNewRound) &&<html style={{ fontSize: "2rem" }}>Round starting block number: {roundStartingBlockNumber.toString()}</html>}
      {(bePlayer && isLotteryClosed &&!showAddressAdd && !showAccountAdd) &&<h1 style={{ fontSize: "2rem" }}>Lottery closed at block number : {ClosingLotteryBlockNumber.toString().toString()}</h1>}

      {(bePlayer &&!showAddressAdd && !showAccountAdd && !CanStartNewRound) &&<html style={{ fontSize: "2rem" }}>Current block number: {currentBlock.toString()}</html>}
      
      </div>}

      {(bePlayer  && !isLotteryClosed &&!showAddressAdd && !showAccountAdd) &&<NumberBox onAdd={playLottery}/>}

      {(bePlayer && !isLotteryClosed &&!showAddressAdd && !showAccountAdd) &&<body className="con">  
      {(bePlayer && !isLotteryClosed &&!showAddressAdd && !showAccountAdd && playedNumbers && !AreNumbersDrawn) && <h1 className='container6'>Played numbers: </h1>}
      {(bePlayer && !isLotteryClosed &&!showAddressAdd && !showAccountAdd && playedNumbers) && <PlayedNumbersList/>}

        {(bePlayer && !isLotteryClosed &&!showAddressAdd && !showAccountAdd && playedNumbers && !AreNumbersDrawn) &&<h1 >Waiting for numbers to be drawn:</h1>}
        {(bePlayer && !isLotteryClosed &&!showAddressAdd && !showAccountAdd && playedNumbers && AreNumbersDrawn) &&<h1>Numbers Drawn:</h1>}
          {(bePlayer && !isLotteryClosed && playedNumbers && !AreNumbersDrawn) &&  <h1 className='numbers'>...</h1> }
        {(bePlayer && !isLotteryClosed && playedNumbers && AreNumbersDrawn) &&  <h1 className='numbers'>{NumbersDrawn}</h1> }
        </body>}
        {(bePlayer && !isLotteryClosed  && playedNumbers && AreNumbersDrawn && !prizeAssigned) &&  <h1 className='containerFullSize'>Waiting for Prizes assignment...</h1> }
        {(bePlayer && !isLotteryClosed && playedNumbers && AreNumbersDrawn && prizeAssigned) &&  <div className='containerFullSize'> <h1>Prizes were assigned, waiting for new round to start</h1>

        </div> }

        {(bePlayer && !showAddressAdd && !showAccountAdd && !kittyShow  )&& <button className='btn btn-connectAccount' onClick={getKittiesOfAccount}>Show Kitties!!!</button>}   
        {(bePlayer && !showAddressAdd && !showAccountAdd && kittyShow )&& <button className='btn btn-closeLottery' onClick={hideKitties}>Hide Kitties</button>}   
        {(bePlayer && kittyShow && ownedKitties.length > 0 ) && <List/>}
        {(bePlayer && kittyShow && ownedKitties.length === 0 ) && <html style ={{backgroundColor:"#ef6c00"}} stylestyle={{ fontSize: "4rem" }}>Play lottery to get Kitties!!!!!</html>}
        {(beManager && !showLotteryCreation) &&<div className="container7">

          {(beManager && !showLotteryCreation && !showAccountAdd && !kittyShow  )&& <button className='btn btn-connectAccount' onClick={getKittiesOfAccount}>Show rewards Kitties</button>}   
          {(beManager && !showLotteryCreation && !showAccountAdd && kittyShow )&& <button className='btn btn-closeLottery' onClick={hideKitties}>Hide Kitties</button>}   

          {(beManager && kittyShow && ownedKitties.length === 0 ) && <h1 style ={{backgroundColor:"#ef6c00"}} stylestyle={{ fontSize: "4rem" }}>No Kitties minted</h1>}

          {(beManager && !showLotteryCreation && !showAccountAdd && kittyShow )&& <KittyMint className='btn btn-connectAccount' onAdd={mintKitty}/>}   

          {(beManager && kittyShow && ownedKitties.length > 0 ) && <ListManager/>}
        </div>
        }
    </div>
  );
}


export default App;
