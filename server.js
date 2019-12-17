'usr strict';

const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const fs = require('fs');
const OptractMedia = require('./dapps/OptractMedia/OptractMedia.js');

const app = express();

// KnifeIron config
const cfgObj = JSON.parse(
  Buffer.from(
    fs.readFileSync('dapps/config.json')
  ).toString()
)

const optract = new OptractMedia(cfgObj);
console.log(optract.configs.dapps[optract.appName].account)
optract.linkAccount(optract.appName)(optract.configs.dapps[optract.appName].account);
console.log(optract.userWallet);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const catchError = (response, error) =>
{
  console.trace(error); // for debug
  response.status(500);
  response.render("500", {"error": error});
}

let articleCache = JSON.parse(
  Buffer.from(
    fs.readFileSync('caches/articleCache.json')
  ).toString()
)

app.get('/status', (request, response) =>
{
  response.json(optract.ethNetStatus())
})

app.get('/membership/:address', (request, response) =>
{
  let address = request.params.address;
  optract.memberStatus(address).then((rc) => {
    response.json(rc);
  })
  .catch((err) => { next(err); })
})

app.get('/articles', (request, response) =>
{
  response.json({AID: Object.keys(articleCache.queries).sort()})
});

app.get('/article/:aid', (request, response) =>
{
  let aid = request.params.aid;
  response.json({[aid]: articleCache.queries[aid]})
});

// Error handling
app.get('*', (request, response, next) =>
{
  let error = new Error('Page Not Found');
  error.statusCode = 404;
  next(error);
});

app.use((error, request, response, next) => 
{ 
  catchError(response, error) 
});

http.createServer(app).listen(8080);
