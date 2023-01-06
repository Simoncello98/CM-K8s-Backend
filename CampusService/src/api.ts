import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
const app = express();
const port = 80;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.get('/campus', (req, res) => {
  console.log(req);
  res.send('Hello World!');
});

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});