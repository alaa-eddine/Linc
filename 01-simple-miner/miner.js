
const crypto = require('crypto');
const UI = require('./ui');

/**
 * A simplistic protocol configuration,
 * we only define the reward amount and the difficulty
 */
const PROTOCOL_CONFIG = {
    REWARD:10,
    
    /**
     * The difficulty here defines the number of leading zeros of a block to be accepted as a new valid block.
     * for example if the difficulty is 2 the following statments apply : 
     * invalid block hash : 458547fae3d9bcd86430266bbbbb9a050
     * invalid block hash : 058547fae3d9bcd86430266bbbbb9a050
     * valid block hash   : 008547fae3d9bcd86430266bbbbb9a050
     */
    DIFFICULTY:2
}

/**
 * This structure will hold mined blocks, it's not persistent, as the goal here is to show how the blockchain get filled with newly mined blocks
 */
const BLOCKCHAIN = [    
    { /** arbitrary genesis block */
        header : {previousHash : new Buffer(16),nonce : 0,timestamp : 0,merkleRoot : new Buffer(16)},
        transactions : []
    }
];

/**
 * Transaction template used to create new transactions
 * in this version on only create coinbase transactions (transactions that rewards the miner)
 * we use a transaction unique identifier (txid), to make sure that the transaction hash will be different
 */
const DEFAULT_TRANSACTION = {
    hash:undefined,    
    txid:undefined,
    out : {
        value : PROTOCOL_CONFIG.REWARD,
    }
}

/**
 * block template used to create new blocks
 */
const DEFAULT_BLOCK = {
    header : {
        previousHash : undefined,
        nonce : 0,
        timestamp : 0,
        merkleRoot : undefined
    },    
    transactions : []
}


/**
 * Create a new transaction
 * in this version, this will only allow to create coinbase transactions
 */
const createTransaction = () => {
    const trx = cloneObject(DEFAULT_TRANSACTION);  

    //generate a unique id 
    trx.txid = Date.now()+'' + intRandom(100,999);

    //we want to calculate the transaction hash minus its hash field
    delete trx.hash;

    //calculate the transaction hash
    trx.hash = hashObject(trx);
    return trx;
}

/**
 * 
 */
const createBlock = () => {

    //calculate the previous block hash : in our case, the latest block is at the top of BLOCKCHAIN array
    const previousHash = hashObject(BLOCKCHAIN[BLOCKCHAIN.length-1]);

    //create the actual block
    const newBlock = cloneObject(DEFAULT_BLOCK);
    //set the previous hash
    newBlock.header.previousHash = previousHash;
    //timestamp the block    
    newBlock.header.timestamp = Date.now();

    //create a coinbase transaction to reward the miner (if he succeed in mining this block)
    const coinbaseTransaction = createTransaction();    
    
    //add the transaction to transactions list
    newBlock.transactions.push(coinbaseTransaction);

    //compute the merkle root of all transactions, well we only have one, but it'll work the same way with any number of transactions
    newBlock.header.merkleRoot = transactionsMerkleRoot(newBlock.transactions);

    return newBlock;    
}

/**
 * Compute a hash for the give block using a nonce
 * the nonce is used to change the result of the hash, it's impredictable and this is a key piece in mining mechanism
 * miners keep trying with different nonces until they resolve the computation puzzle 
 * which consist in obtaining a hash that verify a given condition 
 * The condition in our case is "starting with a specified number of zeros", this number is set in PROTOCOL.DIFFICULTY
 */
const hashBlock = (block, nonce) => {
    block.header.nonce = nonce;
    const bhash = hashObject(block);    
    return bhash;
}



// we initialize the nonce to a random value,
let nonce = Math.floor(Math.random() * 200000);


/**
 * this function takes a block as input, calculate its hash with the current nonce and check if the hash meets mining difficulty condition
 */
const mine = (block) => {
    
    //calculate the hash
    const bhash = hashBlock(block, nonce);

    //display debug info
    console.log('Nonce=%s  hash=', nonce, bhash);

    //convert the binary hash to hex string, this will make it simpler to check if it starts with leading zeros
    const hexHash = bhash.toString('hex');


    let goldenHash = true;
    
    //does it meet the difficulty condition ?
    for (let i=0; i<PROTOCOL_CONFIG.DIFFICULTY && goldenHash; i++)
    {        
        goldenHash = (hexHash[i] === '0');
    }
    

    //Yes ! 
    if (goldenHash) {
        //we just mined a new block !
        BLOCKCHAIN.push(block);

        //reset the nonce to a new random value.
        nonce = Math.floor(Math.random() * 200000);
        

        return true;        
    }

    //mining failed with the current nonce ...
    //prepare next nonce
    nonce++;

    return false;
}

UI.resume();


//===[ Main Loop]=============================================

//this is the infinite mining loop
setInterval(() => {    
    if (!UI.paused) {
        UI.readline.cursorTo(process.stdout, 3, 4);
        
        //first create a block
        const block = createBlock();

        //try mining with the current nonce
        const goldenBlock = mine(block);        

        if (goldenBlock) {
            //if we are here, a new block has been mined and added to the blockchain
            //display it
            displayStats(block);

            //pause mining and wait for user input
            UI.showPrompt();                
        }
        
    }    
}, 5);
//=================================================================





//--[ Helper functions ]-------------------------------------------------------------------------

const hashObject = function(obj) {
    return crypto.createHash('md5').update(JSON.stringify(obj)).digest();
}

const cloneObject = function(obj) {
    return JSON.parse(JSON.stringify(obj));
}
const intRandom = (min, max) => {
    return Math.floor(Math.random() * (max - min)) + min;
}
const floatRandom = (min, max) => {
    return Math.random() * (max - min) + min;
}



//source https://github.com/bitcoinjs/merkle-lib/blob/master/fastRoot.js
const transactionsMerkleRoot = (trxArray) => {
    if (!Array.isArray(trxArray)) throw TypeError('Expected values Array');

    const values = trxArray.map(function (trx) { return new Buffer(trx.hash, 'hex') });

    
    //duplicate the last hash when transactions number is odd
    if ( (values.length % 2) !== 0) values.push(values[values.length-1]);
    
  
    var length = values.length
    var results = values.concat()
  
    while (length > 1) {
      var j = 0
  
      for (var i = 0; i < length; i += 2, ++j) {
        var left = results[i]
        var right = i + 1 === length ? left : results[i + 1]
        var data = Buffer.concat([left, right])
  
        results[j] = crypto.createHash('md5').update(data).digest()
      }
  
      length = j
    }
  
    
    return results[0];
  }


//-----[ display and UI related functions]------------------------------------------------

  const showBlock = (block, next=false) => {
    const bhash = hashObject(block);

    console.log('┌───┤ BlockHash=%s ├─────────────────────────────────┐', bhash.toString('hex'));
    console.log('├──────────────────────────────────┤ HEADER ├──────────────────────────────────────┤');
    console.log('│  PreviousHash = %s     Nonce     = %s   │', block.header.previousHash.toString('hex').padStart(32, '0'), block.header.nonce.toString().padStart(13,'0'));
    console.log('│  MerkleRoot   = %s     Timestamp = %s   │', block.header.merkleRoot.toString('hex').padStart(32, '0'), block.header.timestamp);
    console.log('├───────────────────────────────┤ TRANSACTIONS ├───────────────────────────────────┤');
    for (let trx of block.transactions)
    {
        console.log('│ [TxId:%s   Hash:%s]                  │', trx.txid.toString().padStart(16, '0'), trx.hash.toString('hex').padStart(32, '0'));    
    }
    if (next)
    {
        console.log('└───────────────────────────────────────╥──────────────────────────────────────────┘');
        console.log('                                        V ');    
    }
    else {
        console.log('└──────────────────────────────────────────────────────────────────────────────────┘');
    }

}

UI.bind('b', ()=>{    
    UI.clear();

    console.log('┌──────────────────────────────────────────────────────────────────────────────────┐');
    console.log('│  START OF BLOCKCHAIN                                                             │');
    console.log('└──────────────────────────────────────────────────────────────────────────────────┘');
    
    for (let block of BLOCKCHAIN)
    {
        showBlock(block, true);
    }    
    console.log('┌──────────────────────────────────────────────────────────────────────────────────┐');
    console.log('│  END OF BLOCKCHAIN                                                               │');
    console.log('└──────────────────────────────────────────────────────────────────────────────────┘');
    
    UI.showPrompt();
});


let sTime = Date.now();
const miningTimes = [];
const displayStats = function(block) {
    const totalTime = Math.round((Date.now() - sTime)/60);
    sTime = Date.now();      
    miningTimes.push(totalTime);
    const avgTime = Math.floor(miningTimes.reduce((a, b)=> a+b, 0) / miningTimes.length);

    console.log("\n\n Horay ! you mined a new block *\\(^_^)/*\n\n")
    showBlock(block);
    console.log('┌────────────────────────────────────────┬─────────────────────────────────────────┐');
    console.log('│   Time to mine last block = %ss    │    Average mining time     = %ss    │', totalTime.toString().padStart(6), avgTime.toString().padStart(6));
    console.log('└────────────────────────────────────────┴─────────────────────────────────────────┘');
}
