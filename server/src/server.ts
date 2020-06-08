import express from 'express';
import cors from 'cors';
import routes from './routes';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json());  // para express entender json

app.use(routes);

//IMAGENS
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')))

app.listen(3333);   