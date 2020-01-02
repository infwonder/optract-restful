'usr strict';

const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const fs = require('fs');
const app = express();
const WSClient = require('rpc-websockets').Client;

const connectRPC = (url) => {
        let opt = new WSClient(url);

        const __ready = (resolve, reject) =>
        {
                opt.on('open',  function(event) { resolve(opt) });
                opt.on('error', function(error) { console.trace(error); reject(false) });
        }

        return new Promise(__ready);
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const catchError = (response, error) =>
{
  console.trace(error); // for debug
  response.status(500);
  response.render("500", {"error": error});
}

// TODO: we should move this out of here and into optract-service
let articleCache = JSON.parse(
  Buffer.from(
    fs.readFileSync('caches/articleCache.json')
  ).toString()
)

connectRPC('ws://optract-service.default:59437').then((optract) => 
{
	app.get('/status', (request, response) =>
	{
	  optract.call('ethNetStatus', [])
		 .then((rc) => { response.json(rc) })
		 .catch((err) => { next(err); })
	})

	app.get('/membership/:address', (request, response) =>
	{
	  let address = request.params.address;
	  optract.call('memberStatus', [address])
		 .then((rc) => { response.json(rc) })
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

	app.get('/articles/cache', (request, response) =>
	{
	  response.json(articleCache);
	});

	app.post('/tx/:address/vote', (request, response) => 
	{
	  let member = request.params.address;
	  let data   = request.body;

	  console.log(`Get tx from member ${member}`);
	  console.dir(data);
	 
	  response.json({tx: {type: 'vote', account: member}});
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
})
