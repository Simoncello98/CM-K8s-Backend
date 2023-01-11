import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import { configureEnvironment } from '../../../shared/envConfigUtils';
import { updateCompany } from './functions/updateCompanyFunction';
import { setCompanyAsDeleted } from './functions/setCompanyAsDeletedFunction';
import { getCompany } from './functions/getCompanyFunction';
import { createCompany } from './functions/createCompanyFunction';
import { uploadCompanyLogo } from './functions/uploadCompanyLogoFunction';
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

app.put('/Company', (req, res) => {
  updateCompany(req,res);
});

app.delete('/Company', (req, res) => {
  setCompanyAsDeleted(req,res);
});

app.get('/Company', (req, res) => {
  getCompany(req,res);
});

app.post('/Company', (req, res) => {
  createCompany(req,res);
});

app.post('/Company/Logo', (req, res) => {
  uploadCompanyLogo(req,res);
});


app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});