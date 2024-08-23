import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Card { 'value' : bigint, 'suit' : string }
export interface GameState {
  'pot' : bigint,
  'currentPlayer' : [] | [PlayerId],
  'communityCards' : Array<[] | [Card]>,
  'stage' : string,
  'players' : Array<PlayerId>,
}
export type PlayerId = Principal;
export interface PlayerState {
  'bet' : bigint,
  'hand' : Array<[] | [Card]>,
  'chips' : bigint,
  'folded' : boolean,
}
export type Time = bigint;
export interface _SERVICE {
  'fold' : ActorMethod<[], string>,
  'getChatMessages' : ActorMethod<[], Array<[PlayerId, string, Time]>>,
  'getGameState' : ActorMethod<[], [] | [GameState]>,
  'getPlayerState' : ActorMethod<[], [] | [PlayerState]>,
  'joinGame' : ActorMethod<[], string>,
  'placeBet' : ActorMethod<[bigint], string>,
  'sendChatMessage' : ActorMethod<[string], undefined>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
