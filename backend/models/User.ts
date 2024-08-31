import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  currentGames: [{ 
    gameId: { type: mongoose.Schema.Types.ObjectId, ref: 'Game' }, // Game ID
    name: { type: String } // Game name
  }] // Array of game objects
});

export default mongoose.model('User', userSchema);