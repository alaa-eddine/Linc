# Simple miner
This code implements a simplistic version of a mining algorithm.
It uses many notions found in bitcoin blokchain, while trying to keep the code as simple as possible.

Please note that this code is only focused in the mining process, many other notions was over-simplified to make it easy to read and understand for every developer.


# Assumptions
For the sake of simplicity, I made some assuptions and simplifications listed below.

 * The blockchain is not persistent, it's stored in memory and will be reinitialized everytime you restart the code.

 * While the blockchain is consistent, there is no code to verify the blocks and/or transactions, I'll try to cover this in a future example.

 * Wallets are not implemented, the reason is to avoid adding the complexity of private/public keys, signatures, scripts ...etc, the repository will be updated with another example implementing a simplified version of wallet.

 * Only [coinbase](https://bitcoin.org/en/glossary/coinbase-transaction) transaction type is supported.

 * The mining [difficulty](https://bitcoin.org/en/developer-guide#proof-of-work) uses the same idea as the one used in bitcoin but the verification method used here converts the hashcode to a string to illustrate the leading zeros.


# How to use
Assuming you have nodejs already installed,
Just clone the repository and run 

```
node 01-simple-miner/miner.js
```

The miner comes with a simple user interface which accept some user input.
you can pause the mining at any time by pressing "P" key
use "R" to resume, "B" to show the current blockchain and "Q" to quit.

the mining will pause after each successful block.
 