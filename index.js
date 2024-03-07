require('dotenv').config();
const express = require('express');
const cors = require('cors');

/* ----------> My code starts here <-------------- */
const { urlencoded } = require('body-parser'); //to get the post result from the html
const dns = require('dns');  //to check if an host is valid
const url = require('url');  // to use the URL module to retrive the host name from whatever URL
const app = express();
const  mongoose  = require('mongoose');
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }); //logging into the database

const port = process.env.PORT || 3000;
app.listen(port, function() { 
  console.log(`Listening on port ${port}`);
});

var urlSchema =new mongoose.Schema({
  recUrl: String,
  shortUrl: String,
})

var AnUrl = mongoose.model("AnUrl",urlSchema);

app.use(cors()); //I am allawing webpage from every origin to access this resource
app.use('/public', express.static(`${process.cwd()}/public`)); //serving everything that it's in this directory as a static file
app.use(express.urlencoded({ extended: true })); // In short this makes req.body possible
app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html'); //serving the index html file. { extended: true } produces and more complex (nested) obhect
});

app.post('/api/shorturl', (req, res) => {
  let newUrl = req.body.url;
  try {
    const hostName = new URL(newUrl).hostname;
    console.log("newUrl is like this",newUrl);
    dns.lookup(hostName, async (err, address, family) => {
      if (!address) {
        console.log("Address is undefined");
        res.json({ error: 'invalid url' });
      } else {
        try {
          let urlFound = await AnUrl.findOne({ recUrl: newUrl }).exec();
          console.log("url found is",urlFound);
          if (urlFound) {
            res.json({ original_url: newUrl, short_url: urlFound._id });

          } else {
            let newShortUrl = '12345'; // Here you would generate a new unique short URL instead of hardcoding '12345'
            let savedUrl = await new AnUrl({ recUrl: newUrl }).save();
            console.log(savedUrl);
            res.json({ original_url: savedUrl.recUrl, short_url: savedUrl._id });
          }
        } catch (dbErr) {
          console.error(dbErr);
          res.status(500).send('Database error');
        
        }
      }
    });
  } catch (urlErr) {
    res.json({ error: 'invalid URL' });
  }
});

app.get('/api/shorturl/:su', async (req, res)=> { 
  var shortUrl = req.params.su;
  try{
    const urlFound = await AnUrl.findOne({_id: shortUrl});
    res.redirect(urlFound.recUrl);
  }

  catch (err){
    console.error(err);
    res.status(500).send('Server error');   
              }
  })