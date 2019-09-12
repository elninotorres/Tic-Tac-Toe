import Web3 from "web3";
import { default as contract } from 'truffle-contract'
import tictactoe_artifacts from "./../build/contracts/TicTacToe.json";

var TicTacToe = contract(tictactoe_artifacts);
var accounts;
var account;
var ticTacToeInstance;
var arrEventsFired; 

window.App = {
    start: function() {
      var self = this;
      TicTacToe.setProvider(web3.currentProvider);
      web3.eth.getAccounts(function(err, accs) {
        if (err != null) {
          alert("There was an error fetching your accounts.");
          return;
        }
        if (accs.length == 0) {
          alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
          return;
        }
  
        accounts = accs;
        account = accounts[0];
        arrEventsFired = [];
  
      });
    },
    useAccountOne: function() {
      account = accounts[1];
    },
    createGame: function() {
      TicTacToe.createGame(1, 1, {from:account, value:web3.toWei(0.1,"ether"), gas:3000000}).then(instance => {
        ticTacToeInstance = instance;
  
        console.log(instance);
        var playerJoinedEvent = ticTacToeInstance.Joined();
  
        Joined.watch(function(error, eventObj) {
          if(!error) {
            console.log(eventObj);
          } else {
            console.error(error);
          }
          playerJoinedEvent.stopWatching();
  
        });
        App.listenToEvents();
        console.log(instance);
      }).catch(error => {
        console.error(error);
      })
    },
    join: async() => {
        let game;
        let gameAddress;
        let initialBalance;
        let numberOfGames;
        let index;
        game = await TicTacToe.deployed();
        numberOfGames = await game.numberOfGames();
        index = Number(numberOfGames) - 1;
        TicTacToe.join(index, 0, 0, {from:account, value:web3.toWei(0.1,"ether"), gas:3000000}).then(instance => {
            ticTacToeInstance = instance;
      
            console.log(instance);
          }).catch(error => {
            console.error(error);
          })
    },
    listenToEvents: function() {
      nextPlayerEvent = ticTacToeInstance.Played();
      nextPlayerEvent.watch(App.Played);
  
      gameOverWithWinEvent = ticTacToeInstance.Over();
      gameOverWithWinEvent.watch(App.Over);
    },
    Played: function(error, eventObj) {
      console.log("Your turn", eventObj);

    },
    Over: function(err, eventObj) {
      console.log("Game Over", eventObj);
      if(eventObj.event == "Won") {
        if(eventObj.args.winner == account) {
          alert("Congratulations, You Won!");
        } else {
          alert("Woops, you lost! Try again...");
        }
      } else {
        alert("That's a draw, oh my... next time you do beat'em!");
      }
  
  
      nextPlayerEvent.stopWatching();
      gameOverWithWinEvent.stopWatching();
    },
  };
  
  window.addEventListener('load', function() {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
      console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
      // Use Mist/MetaMask's provider
      window.web3 = new Web3(web3.currentProvider);
    } else {
      console.warn("No web3 detected. Falling back to http://127.0.0.1:9545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      window.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:9545"));
    }
  
    App.start();
  });

