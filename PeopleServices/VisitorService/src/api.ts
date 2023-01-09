import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import { configureEnvironment } from '../../../shared/envConfigUtils';
import { updateVisitorRequest } from './functions/updateVisitorRequestFunction';
import { expireVisitorRequest } from './functions/expireVisitorRequestFunction';
import { getVisitorRequest } from './functions/getVisitorRequestFunction';
import { createVisitorRequest } from './functions/createVisitorRequestFunction';
import { createMyVisitorRequest } from './functions/createMyVisitorRequestFunction';
import { expireMyCompVisitorRequest } from './functions/expireMyCompVisitorReqsFunc';
import { getAllVisitorRequest } from './functions/getAllVisitorReqsFunction';
import { getByVisitor } from './functions/getRequestsByVisitorFunction';
import { getAllMyVisitorRequests } from './functions/getAllMyVisitorRequestsFunction';
import { getAllMyCompVisReqs } from './functions/getAllMyCompVisReqsFunc';
import { getAllMyCompVisReqsByStatus } from './functions/getAllMyCompVisReqsByStatus';
import { getAllVisitorReqsByStatus } from './functions/getAllVisitorReqsByStatusFunc';
import { getAllVisitorReqsByHost } from './functions/getAllVisitorReqsByHostFunc';
import { getAllExpectedVisitorReqs } from './functions/getAllExpectedVisitorReqsFunc';
import { getAdminAllExpVisitorReqs } from './functions/getAdminAllExpVisitorReqsFunc';
import { expireMyVisitorRequest } from './functions/expireMyVisitorRequestFunction';

configureEnvironment();
const app = express();
const port = 80;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.put('/Visitor', (req, res) => {
  updateVisitorRequest(req,res);
});

app.delete('/Visitor', (req, res) => {
  expireVisitorRequest(req,res);
});

app.delete('/Visitor/MyRequest', (req, res) => {
  expireMyVisitorRequest(req,res);
});

app.delete('/Visitor/MyCompanyRequests', (req, res) => {
  expireMyCompVisitorRequest(req,res);
});

app.get('/Visitor', (req, res) => {
  getVisitorRequest(req,res);
});

app.post('/Visitor', (req, res) => {
  createVisitorRequest(req,res);
});
app.post('/Visitor/MyRequest', (req, res) => {
  createMyVisitorRequest(req,res);
});

//get methods
app.get('/Visitor/All', (req, res) => {
  getAllVisitorRequest(req,res);
});

app.get('/Visitor/ByVisitor', (req, res) => {
  getByVisitor(req,res);
});

app.get('/Visitor/MyRequests', (req, res) => {
  getAllMyVisitorRequests(req,res);
});

app.get('/Visitor/MyCompanyRequests', (req, res) => {
  getAllMyCompVisReqs(req,res);
});

app.get('/Visitor/MyCompanyRequestsByStatus', (req, res) => {
  getAllMyCompVisReqsByStatus(req,res);
});

app.get('/Visitor/Status', (req, res) => {
  getAllVisitorReqsByStatus(req,res);
});

app.get('/Visitor/Host', (req, res) => {
  getAllVisitorReqsByHost(req,res);
});

app.get('/Visitor/AllExpected', (req, res) => {
  getAllExpectedVisitorReqs(req,res);
});

app.get('/Visitor/AllExpectedForAnyStatus', (req, res) => {
  getAdminAllExpVisitorReqs(req,res);
});


app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});