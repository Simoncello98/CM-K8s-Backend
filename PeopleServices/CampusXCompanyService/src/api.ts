import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import { configureEnvironment } from '../../../shared/envConfigUtils';
import { updateCampusXCompany } from './functions/updateCampusXCompanyFunction';
import { deleteCampusXCompany } from './functions/deleteCampusXCompanyFunction';
import { getCampusXCompany } from './functions/getCampusXCompanyFunction';
import { createCampusXCompany } from './functions/createCampusXCompanyFunction';
import { getCampusCompanies } from './functions/getCampusCompaniesFunction';
import { getMyCampusCompanies } from './functions/getMyCampusCompaniesFunction';
import { getCampusDeletedCompanies } from './functions/getCampusDeletedCompaniesFunction';
import { getCompanyParentCampuses } from './functions/getCompanyParentCampusesFunction';
import { getCompanyDelParentCamp } from './functions/getCompanyDeletedParentCampusesFunction';

configureEnvironment();
const app = express();
const port = 80;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.put('/CampusXCompany', (req, res) => {
  updateCampusXCompany(req,res);
});

app.delete('/CampusXCompany', (req, res) => {
  deleteCampusXCompany(req,res);
});

app.get('/CampusXCompany', (req, res) => {
  getCampusXCompany(req,res);
});

app.post('/CampusXCompany', (req, res) => {
  createCampusXCompany(req,res);
});


//gets methods

app.get('/CampusXCompany/CampusCompanies', (req, res) => {
  getCampusCompanies(req,res);
});

app.get('/CampusXCompany/MyCampusCompanies', (req, res) => {
  getMyCampusCompanies(req,res);
});

app.get('/CampusXCompany/CampusDeletedCompanies', (req, res) => {
  getCampusDeletedCompanies(req,res);
});

app.get('/CampusXCompany/CompanyParentCampuses', (req, res) => {
  getCompanyParentCampuses(req,res);
});

app.get('/CampusXCompany/CompanyDeletedParentCampuses', (req, res) => {
  getCompanyDelParentCamp(req,res);
});

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});