import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { createCampus } from './functions/createCampusFunction';
import { getAllCampuses } from './functions/getAllCampusesFunction';
import { configureEnvironment } from '../../../shared/envConfigUtils';

configureEnvironment();
const app = express();
const port = 80;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.get('/', (_req, res) => {
  res.send("Hello from Campus")
});

app.post('/', (req, res) => {
  createCampus(req,res);
});

app.get('/All', (req, res) => {
  getAllCampuses(req,res);
});

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});