import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { createCampus } from './functions/createCampusFunction';
import { getAllCampuses } from './functions/getAllCampusesFunction';
import { configureEnvironment } from '../../../shared/envConfigUtils';
import { Utils } from '../../../shared/Utils/Utils';

configureEnvironment();
const app = express();
const port = 80;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use((req, res, next) => {
  let authorized = Utils.getUniqueInstance().isUserAuthorized(req.get("JWTAuthorization"), req.originalUrl, req.method.toUpperCase())
  if(authorized)
    next();
  else{
    res.status(403).send("Forbidden")
  }
})

app.post('/Campus', (req, res) => {
  createCampus(req,res);
});

app.get('/Campus/All', (req, res) => {
  getAllCampuses(req,res);
});

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});