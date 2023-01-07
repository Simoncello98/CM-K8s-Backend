import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import { configureEnvironment } from '../../../shared/envConfigUtils';
import { updateCampusXCompanyXUser } from './functions/updateCampusXCompanyXUserFunction';
import { setCampXCompXUsrAsDel } from './functions/setCampusXCompanyXUserAsDeletedFunction';
import { getCampusXCompanyXUser } from './functions/getCampusXCompanyXUserFunction';
import { createCampusXCompanyXUser } from './functions/createCampusXCompanyXUserFunction';
import { getCampusCompanyUsers } from './functions/getCampusCompanyUsersFunction';
import { getCampusCompanyDeletedUsers } from './functions/getCampusCompanyDeletedUsersFunction';
import { getMyCampCompUser } from './functions/getMyCampCompUserFunction';
import { getCampusUsers } from './functions/getCampusUsersFunction';
import { getCampusVisitors } from './functions/getCampusVisitorsFunction';
import { getCampusDeletedUsers } from './functions/getCampusDeletedUsersFunction';
import { getCompanyUsers } from './functions/getCompanyUsersFunction';
import { getCompanyDeletedUsers } from './functions/getCompanyDeletedUsersFunction';
import { getUserParentCompsAndCamps } from './functions/getUserParentCompsAndCampsFunc';
import { getUserDelParCompsCamps } from './functions/getUserDelParentCompsAndCampsFunc';
import { getCountCompanyUsers } from './functions/getCountCompanyUsersFunc';
import { getMyCountCompanyUsers } from './functions/getMyCountCompanyUsersFunc';

configureEnvironment();
const app = express();
const port = 80;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.put('/CampusXCompanyXUser', (req, res) => {
  updateCampusXCompanyXUser(req,res);
});

app.delete('/CampusXCompanyXUser', (req, res) => {
  setCampXCompXUsrAsDel(req,res);
});

app.get('/CampusXCompanyXUser', (req, res) => {
  getCampusXCompanyXUser(req,res);
});

app.post('/CampusXCompanyXUser', (req, res) => {
  createCampusXCompanyXUser(req,res);
});


//gets methods

app.get('/CampusXCompanyXUser/CampusCompanyUsers', (req, res) => {
  getCampusCompanyUsers(req,res);
});

app.get('CampusXCompanyXUser/CampusCompanyDeletedUsers', (req, res) => {
  getCampusCompanyDeletedUsers(req,res);
});

app.get('CampusXCompanyXUser/MyCampusCompanyUser', (req, res) => {
  getMyCampCompUser(req,res);
});

app.get('CampusXCompanyXUser/CampusUsers', (req, res) => {
  getCampusUsers(req,res);
});

app.get('CampusXCompanyXUser/CampusVisitors', (req, res) => {
  getCampusVisitors(req,res);
});

app.get('CampusXCompanyXUser/CampusDeletedUsers', (req, res) => {
  getCampusDeletedUsers(req,res);
});

app.get('CampusXCompanyXUser/CompanyUsers', (req, res) => {
  getCompanyUsers(req,res);
});

app.get('CampusXCompanyXUser/CompanyDeletedUsers', (req, res) => {
  getCompanyDeletedUsers(req,res);
});
app.get('CampusXCompanyXUser/UserParentCompaniesAndCampuses', (req, res) => {
  getUserParentCompsAndCamps(req,res);
});

app.get('CampusXCompanyXUser/UserDeletedParentCompaniesAndCampuses', (req, res) => {
  getUserDelParCompsCamps(req,res);
});

app.get('CampusXCompanyXUser/CountCompanyUsers', (req, res) => {
  getCountCompanyUsers(req,res);
});

app.get('CampusXCompanyXUser/MyCountCompanyUsers', (req, res) => {
  getMyCountCompanyUsers(req,res);
});


app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});