require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/src/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// My code  
const bodyParser = require('body-parser');
const dns = require('dns');
const url = require('url');
const mongoose = require('mongoose');
const { Schema } = mongoose;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const urlSchema = new Schema({
  original_url: { type: String, required: true },
  short_url: Number
});

const Url = mongoose.model('Url', urlSchema);

let responseObject = {};

app.post('/api/shorturl', bodyParser.urlencoded({ extended: false }), (req, res) => {
  let inputUrl = req.body.url;
  let urlObject = url.parse(inputUrl);

  if (urlObject.hostname) {
    dns.lookup(urlObject.hostname, (err, address, family) => {
      if (err) {
        res.json({ error: 'invalid url' });
      } else {
        responseObject['original_url'] = inputUrl;
        
        let inputShort = 1;
        Url.findOne({})
          .sort({ short_url: 'desc' })
          .exec((error, result) => {
            if (!error && result != undefined) {
              inputShort = result.short_url + 1;
            }
            if (!error) {
              Url.findOneAndUpdate(
                { original_url: inputUrl },
                { original_url: inputUrl, short_url: inputShort },
                { new: true, upsert: true },
                (error, savedUrl) => {
                  if (!error) {
                    responseObject['short_url'] = savedUrl.short_url;
                    res.json(responseObject);
                  }
                }
              );
            }
          });
      }
    });
  } else {
    res.json({ error: 'invalid url' });
  }
});

app.get('/api/shorturl/:input', (req, res) => {
  let input = req.params.input;
  
  Url.findOne({short_url: parseInt(input)}, (error, result) => {
    if(error) console.error(error);
    if(result) {
      res.redirect(result.original_url);
    } else {
      res.json({error: 'invalid url'});
    }
  });


});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
