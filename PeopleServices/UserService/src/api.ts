import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import { configureEnvironment } from '../../../shared/envConfigUtils';
import { updateUserAndRels } from './functions/updateUserAndRelsFunction';
import { setUserAsDeleted } from './functions/setUserAsDeletedFunction';
import { getUser } from './functions/getUserFunction';
import { createUser } from './functions/createUserFunction';
import { createUserWithGroup } from './functions/createUserWithGroupFunction';
import { createVisitor } from './functions/createVisitorFunction';
import { updateUserTelephoneNumber } from './functions/updateUserTelephoneNumberFunc';
import { updateMyTelephoneNumber } from './functions/updateMyTelephoneNumberFunc';
import { updateMyCompUsersAndRels } from './functions/updateMyCompUsersAndRelsFunc';
import { uploadUserPhoto } from './functions/uploadUserPhotoFunction';
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

app.put('/User', (req, res) => {
  updateUserAndRels(req,res);
});

app.delete('/User', (req, res) => {
  setUserAsDeleted(req,res);
});

app.get('/User', (req, res) => {
  getUser(req,res);
});

app.post('/User', (req, res) => {
  createUser(req,res);
});

app.post('/User/WithGroup', (req, res) => {
  createUserWithGroup(req,res);
});

app.post('/User/Visitor', (req, res) => {
  createVisitor(req,res);
});

app.put('/User/TelephoneNumber', (req, res) => {
  updateUserTelephoneNumber(req,res);
});
app.put('/User/MyTelephoneNumber', (req, res) => {
  updateMyTelephoneNumber(req,res);
});

app.put('/User/MyCompanyUsers', (req, res) => {
  updateMyCompUsersAndRels(req,res);
});

app.post('/User/Photo', (req, res) => {
  uploadUserPhoto(req,res);
});

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});