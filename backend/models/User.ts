import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  currentGames: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Game', default: [] }], // Array of game IDs
});

export default mongoose.model('User', userSchema);