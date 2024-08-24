import express, { Express, Request, Response, RequestHandler } from 'express';
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
        const user = await User.findById(req.userDetails.userId).select('_id, username'); 
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
        const newPlayerGame = new playerGame({
            player: user,
            game: newGame._id,
            gameSize: newGame.gameSize,
            entries: entries,
        });
        try {
            await newPlayerGame.save();
            res.json({message: "Game created successfully! "})
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
    try {
        console.log(" Here at the Patching factory to update BINGO! ")
        let reqPlayerGame = await playerGame.findOne({game : req.params.gameId});
        const {data} = req.body;
        const entries: Array<Array<{ text: string; tick: boolean; }>> = reqPlayerGame!.entries as unknown as  Array<Array<{ text: string; tick: boolean; }>>;
        data.forEach((entry: {rowIndex: number, colIndex: number, text: any}) => {
            console.log(" Entry : ", entry, typeof entry.rowIndex);
            // const colArray: Array<{ text: string; tick: boolean; }> = reqPlayerGame!.entries[entry.rowIndex] as unknown as Array<{ text: string; tick: boolean; }>;
            entries![entry.rowIndex][entry.colIndex].text = entry.text;
        })
        reqPlayerGame?.save();
        reqPlayerGame = await playerGame.findOne({game : req.params.gameId});
        console.log("Updated reqPlayerGame : ", reqPlayerGame)
        res.json({message: "Entry updated Successfully! "})
    } catch (error) {
        res.status(400).json({ error: 'Error updating user' });
    }
});

router.patch('/update-bingo/:gameId', auth, async (req : AuthRequest, res : Response) => {
    try{
        let reqPlayerGame = await playerGame.findOne({game : req.params.gameId});
        const gameSize = reqPlayerGame!.gameSize;
        const entries: Array<Array<{ text: string; tick: boolean; }>> = reqPlayerGame!.entries as unknown as  Array<Array<{ text: string; tick: boolean; }>>;

        const {updates} = req.body;
        updates.forEach((entry: {rowIndex: number, colIndex: number, tick: any}) => {
            console.log(" Entry : ", entry, typeof entry.rowIndex);
            entries![entry.rowIndex][entry.colIndex].tick = entry.tick;
        })
        
        const bingo : number = checkForBingo(entries, gameSize);
        reqPlayerGame!.bingo = bingo;
        reqPlayerGame?.save();
        console.log(gameSize, bingo, entries);

        if(reqPlayerGame!.bingo == reqPlayerGame!.gameSize){
            console.log(" Found a Winner! ")
            console.log(reqPlayerGame!.game)
            //Mark game as completed and add winner
            // let gameWon  = Game.findById(reqPlayerGame!.game);
            // gameWon 
        }
        res.json({message: " At check for bingo ! ", bingo: bingo})
    } catch (error) {
        res.status(400).json({ error: 'Error marking as Completed!' });
    }
})

export default router;