// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract Kitty is ERC721,Ownable {
    using Counters for Counters.Counter;
    struct KittyCollectible{ // kitty collectibles with name and imageUrl
        string name;
        string imageURL;
    }
    struct KittyStruct {
        uint8 kittyclass; //class corresponds to class
        uint kittyId;
        uint collectibleId;
    }
    
    KittyCollectible[] public collectibles;
    KittyStruct[] public kitties;

    //@notice initializes the ERC721 NFT contract and create some collectibles to pair with tokens during the lottery
    constructor() ERC721("Kitty", "KTY") { 
    firstNonOwnedKitty =0;
    //Lottery owner "buys" kitties to give as collectibles
    collectibles.push(KittyCollectible("Luna","https://raw.githubusercontent.com/maxogden/cats/master/catmapper/312901834673440370_274560.jpg"));
    collectibles.push(KittyCollectible("Milo","https://raw.githubusercontent.com/maxogden/cats/master/catmapper/486871964120637260_140118.jpg"));
    
    collectibles.push(KittyCollectible("Oliver","https://raw.githubusercontent.com/maxogden/cats/master/catmapper/640149027_13147478.jpg"));
    collectibles.push(KittyCollectible("Leo","https://raw.githubusercontent.com/maxogden/cats/master/catmapper/544503391917245828_33058648.jpg"));


    collectibles.push(KittyCollectible("Loki","https://raw.githubusercontent.com/maxogden/cats/master/catmapper/599443117280980934_392371402.jpg"));
    collectibles.push(KittyCollectible("Bella","https://raw.githubusercontent.com/maxogden/cats/master/catmapper/486871964120637260_140118.jpg"));
    
    collectibles.push(KittyCollectible("Charlie","https://raw.githubusercontent.com/maxogden/cats/master/catmapper/552971813669690258_244706397.jpg"));
    collectibles.push(KittyCollectible("Willow","https://raw.githubusercontent.com/maxogden/cats/master/catmapper/595106231954794669_2104697.jpg"));

    collectibles.push(KittyCollectible("Lucy","https://raw.githubusercontent.com/maxogden/cats/master/cat_photos/92df98b46efd11e18bb812313804a181_7.png"));
    collectibles.push(KittyCollectible("Simba","https://raw.githubusercontent.com/maxogden/cats/master/cat_photos/5804b25e64d211e18bb812313804a181_7.png"));

    collectibles.push(KittyCollectible("Eren","https://i.imgur.com/j60q8UG.jpg"));

    }


    uint firstNonOwnedKitty; //index of the first kitty not owned by a lottery winner
    Counters.Counter private kittiesNumber; // size of kittis array and token id
    mapping(uint8 => KittyStruct) classToFreeKitty;//mapping from class to non-owned kitty to give 

    //notice generate initial kitties
    function _generateKitty(uint8 _kittyclass) internal{
        uint currentKittyNumber  = kittiesNumber.current();
        uint chosenkitty = (currentKittyNumber)%collectibles.length;
        kitties.push(KittyStruct(_kittyclass,currentKittyNumber,chosenkitty));
        kittiesNumber.increment();
        classToFreeKitty[_kittyclass] =  kitties[currentKittyNumber];
        _mintKittyToken(msg.sender, currentKittyNumber  ); //contract owner calls this method 
    }

    //@mint a collectible, with an initial owner and a kitty collectible
    function _mintKittyToken(address _newOwnerID, uint _kittyId) internal onlyOwner{
        _safeMint(_newOwnerID,_kittyId);
        
    }

    //@notice generate kitties NFT from a  random collectible
    function mint(uint8 _kittyclass) public onlyOwner{ //mint token for collectibles of a certain class
        uint currentKittyNumber  = kittiesNumber.current();
        uint chosenkitty = (currentKittyNumber + uint(keccak256(abi.encode(blockhash(block.number - 1)))))%collectibles.length;
        kitties.push(KittyStruct(_kittyclass,currentKittyNumber,chosenkitty));
        kittiesNumber.increment();
        classToFreeKitty[_kittyclass] = kitties[currentKittyNumber]; // set this kitty as the one to give as prize
        _mintKittyToken(msg.sender,currentKittyNumber); 
    }

    event kittyNewHasOwner(address ownerId,uint kittyTokenId,uint8 kittyClass,string kittyName);

   //@ transfer kitty from contract owner to a new owner
    function giveKitty(address _newOwnerID, uint8 _kittyclass) public onlyOwner{
        uint kittyTokenId= classToFreeKitty[_kittyclass].kittyId;
        transferFrom(msg.sender,_newOwnerID,kittyTokenId); //tranfer the kitty token
        emit kittyNewHasOwner(_newOwnerID,kittyTokenId,kitties[kittyTokenId].kittyclass,collectibles[kitties[kittyTokenId].collectibleId].name);        
        mint(_kittyclass); //create a new kitty of the same class for future awarding
    }

    //@notice Generates the initial kitties token to give as rewards, one kitty per class will be generated using a random collectible
    function initialKittyTokenGeneration() public onlyOwner {
        //generate initial rewards kitty
        for(uint8 i=0;i<8;i++){
            _generateKitty(i+1); // generate kitty, starting with the kitty of class 
        }
    }

    
    //@notice: get informations(name, level, imageURL) of a certain kitty token
    function getKittyCollectibleAndTokenInfoByTokenId(uint kittyId) public view returns(uint8 kittyclass, string memory kittyName,string memory kittyUrl){
        require(ownerOf(kittyId) == msg.sender,"Only owner of kitty can view it");
        KittyCollectible memory chosenKitty = collectibles[kitties[kittyId].collectibleId];
        return (kitties[kittyId].kittyclass,chosenKitty.name,chosenKitty.imageURL);
    }
    

    //@notice: add a collectible to the pool of collectibles
    function addCollectible(string memory name,string memory imageURL) public onlyOwner {
        collectibles.push(KittyCollectible(name,imageURL));

    }
    
    function getAllOwnerTokens() public view returns(uint[] memory tokens){
        uint numberOfKitties=balanceOf(msg.sender); 
        uint j=0;
        tokens = new uint[](numberOfKitties);
        for(uint i = 0; i<kitties.length;i++){
            if(ownerOf(i)==msg.sender){
                tokens[j++] = i;
            }
        }
        return(tokens);

    }
    
}