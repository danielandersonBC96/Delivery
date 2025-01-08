import express from 'express';
import cors from 'cors';
import path from 'path';
import db from './Config/database.js';
import foodRoutes from './Router/foodRouter.js';
import useRoutes from './Router/userRoutes.js'
import { fileURLToPath } from 'url';


const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 4000;

app.use(express.json());
app.use(cors());

// Serve a pasta 'uploads' como estática
// Utilize o caminho absoluto para o diretório de uploads
app.use('/uploads', express.static('C:/Users/Daniel Anderson/Desktop/Delivery/Backend/Config/Uploads'));


// Rota principal
app.get('/', (req, res) => {
    res.send('API Working');
});

app.use('/foods', foodRoutes);
app.use('/users', useRoutes)

app.listen(port, () => {
    console.log(`Server Started on http://localhost:${port}`);
});
