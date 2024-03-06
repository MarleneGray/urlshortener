require('dotenv').config();
const express = require('express');
const cors = require('cors');

/* ----------> My code starts here <-------------- */
const { urlencoded } = require('body-parser'); //to get the post result from the html
const dns = require('dns');  //to check if an host is valid
const url = require('url');  // to use the URL module to retrive the host name from whatever URL

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors()); //I am allawing webpage from every origin to access this resource


app.use('/public', express.static(`${process.cwd()}/public`)); //serving everything that it's in this directory as a static file
app.use(express.urlencoded({ extended: true })); // In short this makes req.body possible
app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html'); //serving the index html file. { extended: true } produces and more complex (nested) obhect
});

app.post('/api/shorturl', (req,res) =>{
  let newUrl = req.body.url;
  const recUrl = new URL(newUrl).hostname; //It construct an URL starting from the string newUrl and takes the property host
  dns.lookup(recUrl, (err, address, family) =>{ // the method dns.lookup reads an url and return err, address and family inside a fallback function 
      console.log("the address for",recUrl," is ",address,". The family is",family);
      if(address === undefined)
        {console.log("Address is undefined");
        res.json({ error: 'invalid url' });
        }
      else
       {res.json({ original_url : newUrl , short_url :1});}
       
  } );
  

});

 app.listen(port, function() { 
  console.log(`Listening on port ${port}`);
});
