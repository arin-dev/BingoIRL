import mongoose, { model } from 'mongoose';
import User from './User';

const gameSchema = new mongoose.Schema({
  name: { type: String, required: true },
  // uniqueId: { type: String, required: true, unique: true },
  gameSize: {type: Number, required:true, default: 3},
  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  winnerAns: { type: mongoose.Schema.Types.ObjectId, ref: 'playerGame', default: null },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  registeredPlayers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  prize: {type: String, default: null}
}, {timestamps: true});

const playerGameSchema = new mongoose.Schema({
  player: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
  game: { type: mongoose.Schema.Types.ObjectId, ref: 'Game'},
  gameSize: { type: Number, required:true},
  entries : { type: [[{
    text: {type: String, required: true, default: "Click here to write!"},
    tick: {type: Boolean, default: false},
    }]],
  required: true},
  bingo : {type: Number, default: 0}
})

// no need to include next() as when using promise or async it is implemented automatically.
gameSchema.post('deleteOne', async function(doc, next) {
  const game = await Game.findById(doc._id);
  if (game) {
    const users = await User.find({ currentGames: game._id });
    for (const user of users) {
      user.currentGames = user.currentGames.filter(gameId => gameId !== game._id);
      await user.save();
    }
    const playerGames = await playerGame.find({ game: game._id });
    for (const playerGameDoc of playerGames) {
      await playerGameDoc.deleteOne();
    }
  }
  next();
});

gameSchema.post('save', async function(doc, next) {
  console.log(doc);
  if (doc.createdAt == doc.updatedAt)
    console.log("New game created! Inside Post Hook");
  else{
    console.log('Old game updated! Check if need to update Bingo or if Bingo!');
  }
  next();
}
);

playerGameSchema.post('save', async function(doc, next) {
  console.log("Updated entries now need to check for BINGO! ", doc.bingo);
  next();
});

const Game = model('Game', gameSchema);
const playerGame = model('playerGame', playerGameSchema);
export {Game, playerGame};