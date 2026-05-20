import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { puzzleRouter } from './routes/puzzle.js';
import { judgeRouter } from './routes/judge.js';
import { freeAskRouter } from './routes/free-ask.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/puzzles', puzzleRouter);
app.use('/api/judge', judgeRouter);
app.use('/api/free-ask', freeAskRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
