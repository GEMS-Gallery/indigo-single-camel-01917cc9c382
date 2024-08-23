export const idlFactory = ({ IDL }) => {
  const Time = IDL.Int;
  const Card = IDL.Record({ 'value' : IDL.Nat, 'suit' : IDL.Text });
  const GameState = IDL.Record({
    'pot' : IDL.Nat,
    'currentPlayer' : IDL.Opt(IDL.Text),
    'communityCards' : IDL.Vec(IDL.Opt(Card)),
    'stage' : IDL.Text,
    'players' : IDL.Vec(IDL.Text),
  });
  const PlayerState = IDL.Record({
    'bet' : IDL.Nat,
    'hand' : IDL.Vec(IDL.Opt(Card)),
    'chips' : IDL.Nat,
    'folded' : IDL.Bool,
  });
  return IDL.Service({
    'fold' : IDL.Func([], [IDL.Text], []),
    'getChatMessages' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text, Time))],
        ['query'],
      ),
    'getGameState' : IDL.Func([], [IDL.Opt(GameState)], ['query']),
    'getPlayerState' : IDL.Func([], [IDL.Opt(PlayerState)], ['query']),
    'joinGame' : IDL.Func([], [IDL.Text], []),
    'placeBet' : IDL.Func([IDL.Nat], [IDL.Text], []),
    'sendChatMessage' : IDL.Func([IDL.Text], [], []),
  });
};
export const init = ({ IDL }) => { return []; };
