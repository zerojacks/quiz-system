import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import idiomRoutes from './routes/idiomRoutes';
import typeRoutes from './routes/typeRoutes';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', idiomRoutes);
app.use('/api', typeRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
