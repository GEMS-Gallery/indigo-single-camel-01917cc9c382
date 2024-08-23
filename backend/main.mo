import Blob "mo:base/Blob";
import Bool "mo:base/Bool";
import Hash "mo:base/Hash";
import Nat8 "mo:base/Nat8";

import Array "mo:base/Array";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import List "mo:base/List";
import Nat "mo:base/Nat";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Random "mo:base/Random";
import Text "mo:base/Text";
import Time "mo:base/Time";

actor TexasHoldem {
  // Types
  type PlayerId = Principal;
  type Card = { suit : Text; value : Nat };
  type PlayerState = {
    hand : [?Card];
    chips : Nat;
    bet : Nat;
    folded : Bool;
  };
  type GameState = {
    players : [Text];
    communityCards : [?Card];
    currentPlayer : ?Text;
    pot : Nat;
    stage : Text;
  };

  // Stable variables
  stable var gameState : ?GameState = null;
  stable var playersEntries : [(Text, PlayerState)] = [];

  // Mutable variables
  var players = HashMap.HashMap<Text, PlayerState>(0, Text.equal, Text.hash);
  var deck : List.List<Card> = List.nil();
  var currentBet : Nat = 0;

  // System functions for upgrades
  system func preupgrade() {
    playersEntries := Iter.toArray(players.entries());
  };

  system func postupgrade() {
    players := HashMap.fromIter<Text, PlayerState>(playersEntries.vals(), 0, Text.equal, Text.hash);
    playersEntries := [];
  };

  // Helper functions
  func createDeck() : List.List<Card> {
    let suits = ["♠", "♥", "♦", "♣"];
    let values = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
    var newDeck = List.nil<Card>();
    for (suit in suits.vals()) {
      for (value in values.vals()) {
        newDeck := List.push({ suit = suit; value = value }, newDeck);
      };
    };
    newDeck
  };

  func shuffleDeck(seed : Blob) : List.List<Card> {
    let shuffled = Array.thaw<Card>(List.toArray(deck));
    let size = Array.size(Array.freeze(shuffled));
    for (i in Iter.range(0, size - 1)) {
      let j = Nat.abs(Random.rangeFrom(Nat8.fromNat(size), seed)) % size;
      let temp = shuffled[i];
      shuffled[i] := shuffled[j];
      shuffled[j] := temp;
    };
    List.fromArray(Array.freeze(shuffled))
  };

  func dealCards() : async () {
    let seed = await Random.blob();
    deck := shuffleDeck(seed);
    for (playerId in players.keys()) {
      var playerState = Option.unwrap(players.get(playerId));
      playerState := {
        hand = [List.pop(deck).0, List.pop(deck).0];
        chips = playerState.chips;
        bet = 0;
        folded = false;
      };
      players.put(playerId, playerState);
    };
  };

  // Public functions
  public shared(msg) func joinGame() : async Text {
    let playerId = Principal.toText(msg.caller);
    switch (players.get(playerId)) {
      case null {
        players.put(playerId, {
          hand = [null, null];
          chips = 1000; // Starting chips
          bet = 0;
          folded = false;
        });
        "Joined the game successfully."
      };
      case (?_) { "You are already in the game." };
    }
  };

  public shared(msg) func placeBet(amount : Nat) : async Text {
    let playerId = Principal.toText(msg.caller);
    switch (players.get(playerId)) {
      case null { "You are not in the game." };
      case (?playerState) {
        if (playerState.folded) { return "You have already folded." };
        if (amount < currentBet) { return "Bet must be at least the current bet." };
        if (amount > playerState.chips) { return "Not enough chips." };
        
        let newPlayerState = {
          hand = playerState.hand;
          chips = playerState.chips - amount;
          bet = playerState.bet + amount;
          folded = playerState.folded;
        };
        players.put(playerId, newPlayerState);
        currentBet := amount;
        "Bet placed successfully."
      };
    }
  };

  public shared(msg) func fold() : async Text {
    let playerId = Principal.toText(msg.caller);
    switch (players.get(playerId)) {
      case null { "You are not in the game." };
      case (?playerState) {
        if (playerState.folded) { return "You have already folded." };
        let newPlayerState = {
          hand = playerState.hand;
          chips = playerState.chips;
          bet = playerState.bet;
          folded = true;
        };
        players.put(playerId, newPlayerState);
        "Folded successfully."
      };
    }
  };

  public query func getGameState() : async ?GameState {
    gameState
  };

  public query(msg) func getPlayerState() : async ?PlayerState {
    players.get(Principal.toText(msg.caller))
  };

  // Chat functionality
  stable var chatMessages = List.nil<(Text, Text, Time.Time)>();

  public shared(msg) func sendChatMessage(message : Text) : async () {
    let playerId = Principal.toText(msg.caller);
    let timestamp = Time.now();
    chatMessages := List.push((playerId, message, timestamp), chatMessages);
  };

  public query func getChatMessages() : async [(Text, Text, Time.Time)] {
    List.toArray(chatMessages)
  };
}
