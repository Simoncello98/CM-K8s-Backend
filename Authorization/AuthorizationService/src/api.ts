import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { configureEnvironment } from '../../../shared/envConfigUtils';
import { getAuthorizedComponents } from './functions/getAuthorizedComponentsFunction';
import { listGroupsFromUser } from './functions/listGroupsFromUserFunc';
import { associateUserToGroup } from './functions/associateUserToGroupFunc';
import { listCognitoGroups } from './functions/listCognitoGroupsFunction';

configureEnvironment();
const app = express();
const port = 80;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());



app.get('/Authorization', (req, res) => {
  getAuthorizedComponents(req,res);
});

app.get('/UserXGroup', (req, res) => {
  listGroupsFromUser(req,res);
});

app.get('/UserXGroup/ListCognitoGroupsName', (req, res) => {
  listCognitoGroups(req,res);
});

app.post('/UserXGroup', (req, res) => {
  associateUserToGroup(req,res);
});


app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});