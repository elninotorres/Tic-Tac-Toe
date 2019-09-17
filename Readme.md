Install truffle and ganache globally

Used Versions

Truffle v5.0.28 (core: 5.0.28)
Solidity - 0.5.0 (solc-js)
Node v8.11.3
Web3.js v1.0.0-beta.37

Steps to run

npm install
run ganache in one terminal
truffle compile
truffle migrate --network rinkeby --reset (Deploy to rinkeby network)
run npm run dev to run the server

Goto https://www.myetherwallet.com after deploying to rinkeby network.
Take the contract address and abi of tictactoe.json and paste in details provided to interfere with the contract.


#Testing

For testing run ganache in one terminal with --gasLimit=30000000000
truffle test in another terminal