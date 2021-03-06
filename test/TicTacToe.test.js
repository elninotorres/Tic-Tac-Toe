const TicTacToe = artifacts.require("TicTacToe");
const TGToken = artifacts.require("TGToken");

const value = web3.utils.toWei(".002", "ether");

contract("TicTacToe can add a new game", accounts => {
  let game;
  let gameAddress;
  beforeEach("setup a TicTacToe contract", async () => {
    game = await TicTacToe.deployed();
    gameAddress = game.address;
  });
  describe("Create Game", () => {
    it("should record all the properties of the game", async () => {
      await game.createGame(1, 1, { from: accounts[1], value: value });

      const numberOfGames = await game.numberOfGames();
      const { X, O, lastTurn, stage, result, bounty } = await game.games(0);

      const board = await game.getBoard(0);

      const balance = await web3.eth.getBalance(gameAddress);
      const mark = board[4];

      assert.strictEqual(accounts[1], X);
      assert.strictEqual(accounts[1], lastTurn);
      assert.strictEqual(0, Number(O));
      assert.strictEqual(Number(value), Number(bounty));
      assert.strictEqual(balance, Number(bounty) + "");
      assert.strictEqual(1, Number(mark));
      assert.strictEqual(false, result);
      assert.strictEqual(1, Number(numberOfGames));
      assert.strictEqual(0, Number(stage));
    });
    it("should check for minimum bounty", async () => {
      try {
        await game.createGame(1, 1, { from: accounts[1], value: 1 });
        assert(false);
      } catch(err) {
        assert(true);
      }
    });
    it("should check for row and colum bound", async () => {
      try {
        await game.createGame(3, 3, { from: accounts[1], value: value });
        assert(false);
      } catch(err) {
        assert(true);
      }
    });
  });
});

contract("TicTacToe lets responder join", accounts => {
  let game;
  let gameAddress;
  let initialBalance;
  let numberOfGames;
  let index;
  beforeEach("setup a TicTacToe contract", async () => {
    game = await TicTacToe.deployed();
    gameAddress = game.address;
    initialBalance = await web3.eth.getBalance(gameAddress);

    await game.createGame(1, 1, { from: accounts[1], value: value });

    numberOfGames = await game.numberOfGames();
    index = Number(numberOfGames) - 1;
  });
  describe("Join Game", () => {
    it("should not let same party to be initiator and responder", async () => {
      try {
        await game.join(index, 0, 0, { from: accounts[1], value: value });
        assert(false);
      } catch(err) {
        assert(true);
      }
    });
    it("should not let responder to join with lesser bid", async () => {
      try {
        await game.join(index, 0, 0, { from: accounts[2], value: 999 });
        assert(false);
      } catch(err) {
        assert(true);
      }
    });
    it("should not let responder to mark the same box", async () => {
      try {
        await game.join(index, 1, 1, { from: accounts[2], value: value });
        assert(false);
      } catch(err) {
        assert(true);
      }
    });
    it("should not let join a non existent game", async () => {
      try {
        await game.join(index + 5, 0, 0, { from: accounts[2], value: value });
        assert(false);
      } catch(err) {
        assert(true);
      }
    });
    it("should not let join an already joined game", async () => {
      await game.join(index, 0, 0, { from: accounts[2], value: value });
      try {
        await game.join(index, 2, 2, { from: accounts[2], value: value * 5 });
        assert(false);
      } catch(err) {
        assert(true);
      }
    });
    it("should update game properties on join", async () => {
      await game.join(index, 0, 0, { from: accounts[2], value: value });

      const { X, O, lastTurn, stage, result, bounty } = await game.games(index);
      const board = await game.getBoard(index);
      const mark = board[0];

      const finalBalance = await web3.eth.getBalance(gameAddress);

      const difference = finalBalance - initialBalance;
      assert.strictEqual(accounts[1], X);
      assert.strictEqual(accounts[2], lastTurn);
      assert.strictEqual(accounts[2], O);
      assert.strictEqual(Number(value) * 2, Number(bounty));
      assert.strictEqual(difference, Number(bounty));
      assert.strictEqual(2, Number(mark));
      assert.strictEqual(false, result);
      assert.strictEqual(1, Number(stage));
    });
  });
});

contract("TicTacToe lets players play", accounts => {
  let game;
  let numberOfGames;
  let index;
  beforeEach("setup a TicTacToe contract", async () => {
    game = await TicTacToe.deployed();

    await game.createGame(1, 1, { from: accounts[1], value: value });

    numberOfGames = await game.numberOfGames();
    index = Number(numberOfGames) - 1;
  });
  describe("Play Game", () => {
    it("should not let same player play twice", async () => {
      await game.join(index, 0, 0, { from: accounts[2], value: value });
      try {
        await game.play(index, 0, 1, { from: accounts[2] });
        assert(false);
      } catch(err) {
        assert(true);
      }
    });
    it("should not let join a non existent game", async () => {
      try {
        await game.play(index + 5, 0, 0, { from: accounts[2] });
        assert(false);
      } catch(err) {
        assert(true);
      }
    });
    it("should not let different player to play", async () => {
      await game.join(index, 0, 0, { from: accounts[2], value: value });
      await game.play(index, 0, 1, { from: accounts[1] });
      try {
        await game.play(index, 0, 2, { from: accounts[1] });
        assert(false);
      } catch (err) {
        assert(true);
      }
    });
    it("should not let player to play without joining", async () => {
      try {
        await game.play(index, 0, 1, { from: accounts[2] });
        assert(false);
      } catch (err){
        assert(true);
      }
    });
  });
});

contract("TicTacToe lets players claim tokens and refund", accounts => {
  let game;
  beforeEach("setup a TicTacToe contract", async () => {
    game = await TicTacToe.deployed();
  });
  it("doesn't allow player to withdraw token without valid balance", async () => {
    try {
      await game.claimTokens({ from: accounts[1] });
      assert(false);
    } catch(err) {
      assert(true);
    }
  });
  it("doesn't allow player to claim ether without giving tokens", async () => {
    try {
      await game.claimRefund({ from: accounts[1] });
      assert(false);
    } catch(err) {
      assert(true);
    }
  });
});

contract("TicTacToe declares winner correctly", accounts => {
  let game;
  let numberOfGames;
  let index;
  let initialWinnerRefund;
  let token;
  beforeEach("setup a TicTacToe contract", async () => {
    game = await TicTacToe.deployed();
    token = await TGToken.deployed();
    const X = accounts[1];
    const O = accounts[2];
    initialWinnerRefund = await game.tokenBalance(X);

    await game.createGame(1, 1, { from: X, value: value });

    numberOfGames = await game.numberOfGames();
    index = Number(numberOfGames) - 1;

    await game.join(index, 0, 0, { from: O, value: value });
    await game.play(index, 0, 1, { from: X });
    await game.play(index, 1, 0, { from: O });
    await game.play(index, 2, 1, { from: X });
  });

  it("records the winner correctly", async () => {
    const { X, lastTurn, stage, result, bounty } = await game.games(index);
    const winnerRefund = await game.tokenBalance(X);

    assert.strictEqual(X, lastTurn);
    assert.strictEqual(
      Number(bounty),
      Number(winnerRefund) - Number(initialWinnerRefund)
    );
    assert.strictEqual(2, Number(stage));
    assert.strictEqual(true, result);
  });
  it("ends the game after winning", async () => {
    try {
      await game.play(index, 2, 2, { from: O });
      assert(false);
    } catch(err) {
      assert(true);
    }
  });
  it("doesn't let the looser pull money", async () => {
    try {
      await game.claimTokens({ from: O });
      assert(false);
    } catch(err) {
      assert(true);
    }
  });
  it("lets the winner pull money", async () => {
    const X = accounts[1];
    await game.claimTokens({ from: X });
    const tokenBalance = await token.balanceOf(X);

    const initialBalance = await web3.eth.getBalance(X);

    await token.increaseAllowance(game.address, tokenBalance, { from: X });
    await game.claimRefund({ from: X });
    const finalBalance = await web3.eth.getBalance(X);

    assert(Number(finalBalance) > Number(initialBalance));
  });
});

contract("TicTacToe handles a draw correctly", accounts => {
  let game;
  let numberOfGames;
  let index;
  let initialXRefund;
  let initialORefund;
  let token;

  beforeEach("setup a TicTacToe contract", async () => {
    game = await TicTacToe.deployed();
    token = await TGToken.deployed();
    const X = accounts[1];
    const O = accounts[2];
    initialXRefund = await game.tokenBalance(X);
    initialORefund = await game.tokenBalance(O);

    await game.createGame(1, 1, { from: X, value: value });

    numberOfGames = await game.numberOfGames();
    index = Number(numberOfGames) - 1;

    await game.join(index, 0, 0, { from: O, value: value });
    await game.play(index, 2, 2, { from: X });
    await game.play(index, 0, 2, { from: O });
    await game.play(index, 0, 1, { from: X });
    await game.play(index, 2, 1, { from: O });
    await game.play(index, 1, 0, { from: X });
    await game.play(index, 1, 2, { from: O });
    await game.play(index, 2, 0, { from: X });
  });

  it("records the draw correctly", async () => {
    const { X, O, stage, result, bounty } = await game.games(index);
    const XRefund = await game.tokenBalance(X);
    const ORefund = await game.tokenBalance(O);

    const totalRefund =
      Number(XRefund) +
      Number(ORefund) -
      Number(initialXRefund) -
      Number(initialORefund);

    assert.strictEqual(Number(bounty), Number(totalRefund));
    assert.strictEqual(2, Number(stage));
    assert.strictEqual(false, result);
  });
  it("lets the initiator pull money", async () => {
    const X = accounts[1];
    await game.claimTokens({ from: X });
    const tokenBalance = await token.balanceOf(X);

    const initialBalance = await web3.eth.getBalance(X);
    await token.increaseAllowance(game.address, tokenBalance, { from: X });
    await game.claimRefund({ from: X });
    const finalBalance = await web3.eth.getBalance(X);
    assert(finalBalance > initialBalance);
  });
  it("lets the responder pull money", async () => {
    const O = accounts[2];
    await game.claimTokens({ from: O });
    const tokenBalance = await token.balanceOf(O);

    const initialBalance = await web3.eth.getBalance(O);
    await token.increaseAllowance(game.address, tokenBalance, { from: O });
    await game.claimRefund({ from: O });
    const finalBalance = await web3.eth.getBalance(O);
    assert(finalBalance > initialBalance);
  });
});
