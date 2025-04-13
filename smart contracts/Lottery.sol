// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./Kitty.sol";

/// @title Try-An NFT lottery
/// @author Calogero Turco
/// @notice This contract allows to create a lottery of kitties NFT
/// @dev All function calls are currently implemented without side effects
contract Lottery is Kitty {
    bool areNumbersDrawn;
    bool areRewardsGiven;
    bool openLottery;
    uint roundId;//sequential Id of round
    uint64 fee;
    uint ticketsSold;
    uint8 roundDuration;//fixed duration M of a round
    uint startRoundBlockNumber;//block number of the block at the start of a round
    struct ticket{
        uint8[] numbersPlayed;
        address playerAddress;
    }
    ticket[] tickets; //array containing all tickets used in a turn
    uint[6] public roundPicks;

    bool isFirstRound = true;
    event createdContract(uint8 _roundDuration, uint64 _fee);

    //@notice Initiates the lottery first round provided number of blocks 
    //        for duration and sets the fee to play, also set records the block number at the start of the first round
    //@param _roundDuration Specifies the number of blocks needed to be chained to the blockchain before closing the round
    //@param _fee Specifies the fees to pay for a play
        event roundStarted(uint blockNumber,uint roundId);

    constructor(uint8 _roundDuration,uint64 _fee){
        fee=_fee;
        openLottery=true;
        roundDuration= _roundDuration;
        roundId=0;
        emit createdContract(_roundDuration, _fee);

    }   
    
    //@notice Start a new round, if it is the first then generates a kitty token for each classes of kitties.
    // It increases the roundId value by one.
    function startNewRound() public onlyOwner{
        require(isFirstRound || block.number >  (startRoundBlockNumber + roundDuration),"Error:must wait for round end" );
        require(isFirstRound || areNumbersDrawn && areRewardsGiven,"Error: must draw numbers and assign rewards first");
        if(isFirstRound){
            initialKittyTokenGeneration();
            isFirstRound=false;
        }
        roundId++;
    
        startLottery();
    }


    event CloseLottery(uint BlockIndex);
    function closeLottery() public onlyOwner{
        require(openLottery);
        uint soldTickets = ticketsSold;
        ticketsSold = 0;
        uint i;
        if(soldTickets != 0 && !areRewardsGiven){//players must be refunded if the lottery is closed before the round closes
            for(i=0;i<soldTickets;i++){
                payable(tickets[i].playerAddress).transfer(fee); //send the equivalent of a fee amount to the player
            }
        }
        openLottery=false;
        emit CloseLottery(block.number);
    }

    //@notice sets the startRoundBlockNumber to the one of startNewRound function invocation, sets the boolean
    // variables to check for numbers drawn and rewards given to false for the current round
    function startLottery() internal{
        startRoundBlockNumber = block.number;
        roundDuration = roundDuration;
        areNumbersDrawn = false;
        areRewardsGiven = false;
        ticketsSold = 0;
        emit roundStarted(block.number,roundId);

    }

    //event ticketBought(uint8[] _numbersPlayed, uint blockNumber, address buyerAddress,uint roundId) ;

    //@notice Allows player to buy ticket, inserting the ticket into the array of tickets for the round,
    //         a ticket is created only if the whei sent matches the fee required, the numbers provided are correct and
    //          the ticket is brought during an active round;
    //@param _roundDuration Specifies the number of blocks needed to be chained to the blockchain before closing the round
    //@param _fee Specifies the fees to pay for a play
    function buy(uint8[] calldata _numbersPlayed) public payable returns(uint roundNumber) {
        //check that fees are paid, that the round is active by checking the block number and that the user sent an array
        // of 6 numbers
        require(openLottery,"Lottery is closed");
        require (msg.value == fee,"not sent required fee");
        require (block.number <= (startRoundBlockNumber + roundDuration),"round closed");
        require(_numbersPlayed.length == 6 , "error at first check");
        uint i;
        uint j;
        for(i=0;i<5;i++){//check that the first 5 numbers picked are in the range [1,69]
            require(_numbersPlayed[i]>=1 && _numbersPlayed[i]<=69, "error at range check");
        }
        for(i=0;i<5;i++){//check that the first 5 numbers are all different from each other
            for(j=0;j<5;j++){
                if(j!=i){
                    require(_numbersPlayed[i]!= _numbersPlayed[j], "error at non-equality check");
                }
            }
        }

        require(_numbersPlayed[i]>=1 && _numbersPlayed[i]<=26, "error at powerball number range check");//check that the 6th number is in the range [1,26]
        tickets.push(ticket(_numbersPlayed,msg.sender));
        ticketsSold++;
        //emit ticketBought(_numbersPlayed,block.number,msg.sender,roundId);
        return roundId;
    }


    function getCurrentRoundId() external view returns(uint id){

        return roundId;
    }

    event NumbersDrawn(uint[6] picks, uint roundId);
    //event GasUnits(uint atFunctionStart ,uint atFunctionEnd);

    //@ notice draws numbers for the current round. It uses the keccak256 of the penultimate block before
    // the round finishes to chose the block which hash will be used as a seed to generate six random numbers
    function drawNumbers() public onlyOwner{
        //uint startGas=gasleft();
        require(openLottery,"Lottery is closed");
        require(!areNumbersDrawn,"Numbers already drawn" );
        require(block.number >  (startRoundBlockNumber + roundDuration),"Error:must wait for round end" );
        //pick a number between the current block and first block of the round
        uint randomNumber = uint(keccak256(abi.encode( blockhash(startRoundBlockNumber + roundDuration - 1)))); 

        if(randomNumber % 2 == 0){

            roundPicks =_drawNumbersModuloEven(randomNumber);

        }
        else{
            roundPicks=_drawNumbersModuloOdd(randomNumber);
        }
        areNumbersDrawn = true;
        emit NumbersDrawn(roundPicks, roundId);
        //emit GasUnits(startGas,gasleft());
    }

    function _drawNumbersModuloEven(uint  _randomNumber) view internal returns(uint[6] memory picks){
        uint i;
        uint modulo;
        uint newItem;
        if(roundDuration>256){//blockhash returns the hashes of blocks up to 256 block, 
                            //consider the case where a round is longer than that
            modulo = 255;
        }
        else modulo = roundDuration;
        uint randomSeed =
             uint(keccak256(abi.encode( blockhash(startRoundBlockNumber + (_randomNumber % modulo)-1)))) ; // chose the distance between the current block and the block to use as seed
        for(i=1;i<=5;i++){
            newItem = ((
                uint(keccak256(abi.encode((randomSeed + i))))
            )  % 69 + 1 );
            picks[i-1]= newItem;
        }
        newItem = uint(keccak256(abi.encode((randomSeed + i)))) % 26 + 1;
        picks[5]= newItem;

        return picks;
    }

    function roundDurationCheck() public view returns(uint8){
        return roundDuration;
    }

    function feesValueCheck() public view returns(uint64){
        return fee;
    }

    function _drawNumbersModuloOdd(uint  _randomNumber) view internal returns(uint[6] memory pickedNumbers){
        uint[6] memory picks;
        uint i;
        uint modulo;
        uint newItem;
        if(roundDuration>256){//blockhash returns the hashes of blocks up to 256 block, 
                            //consider the case where a round is longer than that
            modulo = 255;
        }
        else modulo = roundDuration ;
        uint randomSeed =
             uint(keccak256(abi.encode( blockhash(startRoundBlockNumber + (_randomNumber % modulo)-1)))) ; // chose the distance between the current block and the block to use as seed
        for(i=1;i<=5;i++){
            newItem = ((
                uint(keccak256(abi.encode((randomSeed + 6 - i) )))
            )  % 69 + 1);
            picks[i-1]=(newItem) ;
        }
        newItem = uint(keccak256(abi.encode((randomSeed + 6-i)))) % 26 + 1;
        picks[5]= newItem;
        return picks;
    }

    //event MatchValues(uint indexK,uint indexJ);
    event RewardsGiven(uint roundId);

    //give kitty prizes and contract balance to lottery operator
    function givePrizes(address payable payToArgument) public onlyOwner{
        require(openLottery,"Lottery is closed");
        require(areNumbersDrawn,"Draw numbers before");
        require(!areRewardsGiven,"Rewards were already given");
        uint i;
        uint j;
        uint k;
        bool powerBall;
        uint countMatch;
    

        uint numberOfTickets = ticketsSold;
        for(i=0 ;i<numberOfTickets;i++){
            //numbers = tickets[i].numbersPlayed;
            countMatch = 0;
            for(j=0;j<roundPicks.length-1;j++){
                for(k=0;k<tickets[i].numbersPlayed.length-1;k++){
                    if(tickets[i].numbersPlayed[k] == roundPicks[j]){
                        countMatch++;
                    }
                }
            }
            
            powerBall = (roundPicks[5] == tickets[i].numbersPlayed[5]);
    
            _assignKitties(countMatch,powerBall,tickets[i].playerAddress);
        }
        areRewardsGiven=true;
        emit RewardsGiven(roundId);
        payToArgument.transfer(address(this).balance);
    }


    function _assignKitties(uint countMatch, bool powerBall,address playerAddr) internal {
        if(countMatch == 0 && powerBall){
            giveKitty(playerAddr,8);
        }
        else if(countMatch == 1){
            giveKitty(playerAddr,7);
        }
        else if(countMatch == 2 || (countMatch == 1 && powerBall)){
             giveKitty(playerAddr,6);
        }
        else if(countMatch == 3 || (countMatch == 2 && powerBall)){
            giveKitty(playerAddr,5);
        }
        else if(countMatch == 4 || (countMatch == 3 && powerBall)){
            giveKitty(playerAddr,4);
        }
        else if(countMatch == 4 && powerBall){
            giveKitty(playerAddr,3);
        }
        else if(countMatch == 5){
            giveKitty(playerAddr,2);
        }
        else if(countMatch == 5 && powerBall){
            giveKitty(playerAddr,1);
        }
    }

}