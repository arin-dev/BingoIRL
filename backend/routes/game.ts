import express, { Express, Request, Response, RequestHandler } from 'express';
import { Types } from 'mongoose';

import User from '../models/User';
import {Game, playerGame} from './../models/gameModels';
// import { v4 as uuidv4 } from 'uuid';
import {auth} from '../middlewares/authMiddleware'
import {checkForBingo} from '../utils/bingoUtils'

interface AuthRequest extends Request {
  userDetails?:{
    userId: string,
    username: string;
  }
}

const router = express.Router();

router.post('/create-game', auth, async (req: AuthRequest, res: Response) =>{
    console.log("Creating a New Game");
    console.log(req.body);
    if (req.userDetails) {
        try {
        const user = await User.findById(req.userDetails.userId).select('-password'); 
        const { name, gameSize, prize } = req.body;
        // console.log(gameSize);
        console.log(name, user?.username);
        const newGame = new Game({
            name: name,
            gameSize: gameSize,
            createdBy: user,
            registeredPlayers: [user],
            prize: prize,
        });
        await newGame.save();
        console.log(newGame);
        const { playerEntries } = req.body;
        console.log(playerEntries![0]);
        const entries = playerEntries.map((row: any )=> 
            row.map((text: String) => ({
                text: text,
                tick: false 
            }))
        );
        console.log(entries![0]);
        console.log("Created a game now attaching with the creator!! ");
        console.log(user);
        console.log("Player before : ", user);
        user!.currentGames = user!.currentGames;
        user!.currentGames.push({gameId : newGame._id, name: newGame.name});
        user?.save();
        console.log("Player After : ", user);

        const newPlayerGame = new playerGame({
            player: user,
            game: newGame._id,
            gameSize: newGame.gameSize,
            entries: entries,
        });
        try {
            await newPlayerGame.save();
            res.json({message: "Game created successfully! ", gameId : newGame._id})
        } catch (error) {
            // Delete the created game in case not able to attach creator to it.
            console.log(error);
            await Game.findByIdAndDelete(newGame._id);
            res.status(401).json({message: "Some unexpected error! "}).redirect('/login');
        }
    }catch (error) {
        console.log(error);
        res.status(401).json({message: "Some unexpected error! "}).redirect('/login');
    }} else {
        res.status(401).json({redirect : "login"});
    }
});
  
router.post('/register-for-game/:gameId', auth,  async (req : AuthRequest, res : Response) => {
    // Handle the case when player is already registered for the game.
    try {
        console.log(" Here at the Patching factory to update BINGO! ")
        const gameId = req.params.gameId;
        const game = await Game.findById(gameId);
        const {data} = req.body;
        // const entries: Array<Array<{ text: string; tick: boolean; }>> = reqPlayerGame!.entries as unknown as  Array<Array<{ text: string; tick: boolean; }>>;
        const entries = data.map((row: any )=>
            row.map((text: String) => ({
                text: text,
                tick: false 
            }))
        );
        const reqPlayerGame = new playerGame({
            gameSize : game?.gameSize,
            player : req.userDetails?.userId,
            game : gameId,
            entries : entries,
        })
        
        reqPlayerGame?.save();

        const player = await User.findById(req.userDetails?.userId).select('-password');
        
        player?.currentGames.push(new Types.ObjectId(gameId));
        player?.save();

        game?.registeredPlayers.push(player!._id)
        game?.save();

        console.log("Updated reqPlayerGame : ", reqPlayerGame)
        res.json({message: "Registration Successful! "})
    } catch (error) {
        res.status(400).json({ error: 'Error registering for the Game' });
    }
});

router.patch('/update-bingo/:gameId', auth, async (req : AuthRequest, res : Response) => {
    try{
        let reqPlayerGame = await playerGame.findOne({game : req.params.gameId});
        let game = await Game.findById(reqPlayerGame!.game!._id);
        
        console.log("Checking if winner ", game?.name, game!.winner);
        if(game!.winner)
            return res.json({message: "Game is already finshed! ", winner: game});
            
        const gameSize = reqPlayerGame!.gameSize;
        const entries: Array<Array<{ text: string; tick: boolean; }>> = reqPlayerGame!.entries as unknown as  Array<Array<{ text: string; tick: boolean; }>>;

        const {updates} = req.body;
        console.log(updates);
        if(updates){
        console.log("Inside update loop! ");
            updates.forEach((entry: {rowIndex: number, colIndex: number, tick: any}) => {
                console.log(" Entry : ", entry, typeof entry.rowIndex);
                entries![entry.rowIndex][entry.colIndex].tick = entry.tick;
            })
        } 
        
        const bingo : number = checkForBingo(entries, gameSize);
        reqPlayerGame!.bingo = bingo;
        reqPlayerGame?.save();
        console.log(gameSize, bingo);

        if(reqPlayerGame!.bingo >= gameSize){
            console.log(game)
            console.log(req.userDetails?.userId)
            if(game){
                const winner = await User.findById(req.userDetails?.userId).select('-password');
                console.log(" Found a Winner! ")
                console.log(winner)
                game!.winner = winner!._id;
                game!.winnerAns = reqPlayerGame!._id;
                await game.save();
                console.log(game);
                return res.json({redirect:"reload", message:" Hurray you won! ", winner: winner!.username});
            }
            // gameWon 
        }
        res.json({message: " At check for bingo ! ", bingo: bingo})
    } catch (error) {
        res.status(400).json({ error: 'Error marking as Completed!' });
    }
})

router.delete('/delete-game/:gameId', auth, async (req: AuthRequest, res: Response) => {
    try {
        const game = await Game.findById(req.params.gameId);
        console.log("HERE AT DETELE ROUTE: tbd : ", req.params.gameId, "game : ",game);
        try{
            await game!.deleteOne();
        } catch (error) {
            return res.status(400).json({error : "Game doesn't exist! "})
        }
        res.json({ message: "Game deleted successfully!" });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting game!' });
    }
})

router.delete('/dev/delete-all-currentGames', async (req: AuthRequest, res: Response) => {
    console.log("DELETING all Current Games attached : ")
    const users = await User.find();
    for(const U of users){
        const user = await User.findById(U).exec();
        console.log(user);
        user!.currentGames = [] as any;
        await user!.save();
        console.log(user?.currentGames);
    }

    return res.status(201).json({message: "successful"});
})

export default router;