var express = require('express');
var path = require('path')
var cors = require('cors')
var app = express();
var moment = require('moment');

var bodyParser = require('body-parser');

var ConversationV1 = require('watson-developer-cloud/conversation/v1');

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.use(bodyParser.json());

app.use(cors());

// Util is handy to have around, so thats why that's here.
const util = require('util')
// and so is assert
const assert = require('assert');

app.use(express.static(path.resolve(__dirname, 'www')));
app.set('port', process.env.PORT || 3000);

app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));

// Then we'll pull in the database client library
var MongoClient = require("mongodb").MongoClient;

var ObjectId = require("mongodb").ObjectId;

// Now lets get cfenv and ask it to parse the environment variable
var cfenv = require('cfenv');
var appenv = cfenv.getAppEnv();

// Within the application environment (appenv) there's a services object
var services = appenv.services;

// The services object is a map named by service so we extract the one for MongoDB
var mongodb_services = services["compose-for-mongodb"];
//var mongodb_services = services["mongodb"];

// This check ensures there is a services for MongoDB databases
assert(!util.isUndefined(mongodb_services), "Must be bound to mongodb services");

// We now take the first bound MongoDB service and extract it's credentials object
var credentials = mongodb_services[0].credentials;

// Within the credentials, an entry ca_certificate_base64 contains the SSL pinning key
// We convert that from a string into a Buffer entry in an array which we use when
// connecting.
var ca = [new Buffer(credentials.ca_certificate_base64, 'base64')];

// This is a global variable we'll use for handing the MongoDB client around
var mongodb;

// Initialize conversation

//var conversation_services = services["conversation"];

// This check ensures there is a services for Watson Conversation
//assert(!util.isUndefined(conversation_services), "Must be bound to conversation services");

// We now take the first bound Watson conversation service and extract it's credentials object
//var credentials_conversation = conversation_services[0].credentials;

var conversation = new ConversationV1({
  username: process.env.CONVERSATION_USERNAME,
  password: process.env.CONVERSATION_PASSWORD,
  version_date: ConversationV1.VERSION_DATE_2017_02_03
});


function initDBConnection() {

  // This is the MongoDB connection. From the application environment, we got the
// credentials and the credentials contain a URI for the database. Here, we
// connect to that URI, and also pass a number of SSL settings to the
// call. Among those SSL settings is the SSL CA, into which we pass the array
// wrapped and now decoded ca_certificate_base64,

MongoClient.connect(credentials.uri + '?authMode=scram-sha1&rm.tcpNoDelay=true', {
        mongos: {
            poolSize: 1,
            reconnectTries: 1
            ,ssl: true,
            sslValidate: true,
            sslCA: ca
        }
    },
    function(err, db) {
        // Here we handle the async response. This is a simple example and
        // we're not going to inject the database connection into the
        // middleware, just save it in a global variable, as long as there
        // isn't an error.
        if (err) {
            console.log(err);
        } else {
          console.log("Connected to MongoDB");

            mongodb = db.db("db");

            //mongodb.collection("users").remove({});
            //mongodb.collection("joblog").remove({});


            // Mapreduce
/*
            mongodb.mapReduce(
              function(){

                for(var g = 0; g < this.customers.length; g++){
                  emit(this.customers[g].name, this);
                }

                },
              function(key,values){return values[0];},
              {out:{replace: 'tempcollection'}},
              function(err, collection){

                collection.find().toArray(function(er, results) {
                  console.log(results[0]._id);
                  console.log(results[0].value);

            db.close();
          });

              }
            );
*/


        }
    }
);

}

initDBConnection();

app.use(express.static(__dirname + '/public'));

// Service to add dumps
app.post("/dump", function(request, response) {
  console.log("Insert dumps");
  console.log(request.body);

    var dumpx = request.body;

  for(var x=0; x < dumpx.length; x ++){

    var jo = dumpx[x];

    jo.datee = moment(jo.date,"DD.MM.YYYY").toDate();
  }

  mongodb.collection("dumps").insertMany(request.body, function(err, r) {
    if (err) {
    console.log("Error: " + err);
     response.status(500).send(err);
    } else {
      console.log("Success");
        response.send({success:true});
    }
  });

});

// Service to add workload records
app.post("/workload", function(request, response) {
  console.log("Insert workload records");
  console.log(request.body);

  mongodb.collection("workload").insertMany(request.body, function(err, r) {
    if (err) {
    console.log("Error: " + err);
     response.status(500).send(err);
    } else {
      console.log("Success");
        response.send({success:true});
    }
  });

});

// Service to add load distribution records
app.post("/loaddistribution", function(request, response) {
  console.log("Insert load distribution records");
  console.log(request.body);

  mongodb.collection("loaddistribution").insertMany(request.body, function(err, r) {
    if (err) {
    console.log("Error: " + err);
     response.status(500).send(err);
    } else {
      console.log("Success");
        response.send({success:true});
    }
  });

});

// Service to add overview records
app.post("/overview", function(request, response) {
  console.log("Insert overview records");
  console.log(request.body);

  mongodb.collection("overview").insertMany(request.body, function(err, r) {
    if (err) {
    console.log("Error: " + err);
     response.status(500).send(err);
    } else {
      console.log("Success");
        response.send({success:true});
    }
  });

});

// Service to add filesystem records
app.post("/filesystem", function(request, response) {
  console.log("Insert filesystem records");
  console.log(request.body);

  mongodb.collection("filesystem").insertMany(request.body, function(err, r) {
    if (err) {
    console.log("Error: " + err);
     response.status(500).send(err);
    } else {
      console.log("Success");
        response.send({success:true});
    }
  });

});

// Service to add system records
app.post("/system", function(request, response) {
  console.log("Insert system records");
  console.log(request.body);

  mongodb.collection("system").insertMany(request.body, function(err, r) {
    if (err) {
    console.log("Error: " + err);
     response.status(500).send(err);
    } else {
      console.log("Success");
        response.send({success:true});
    }
  });

});

// Service to add job records
app.post("/job", function(request, response) {
  console.log("Insert job records");
  console.log(request.body);

  var jobx = request.body;

  for(var x=0; x < jobx.jobs.length; x ++){

    var jo = jobx.jobs[x];

    if(x < 3){

        var log = jobx.log[x];

        if(log){
          jo.log = log;
        }
  }

    jo.date = moment(jo.start_date,"DDMMYYYY").toDate();
  }

  mongodb.collection("job").insertMany(jobx.jobs, function(err, r) {
    if (err) {
    console.log("Error: " + err);
     response.status(500).send(err);
    } else {
      console.log("Success");
        response.send({success:true});
    }
  });

});


// Service to add memory transactions
app.post("/memoryt", function(request, response) {
  console.log("Insert memoryt");
  console.log(request.body);

    var dumpx = request.body;

  for(var x=0; x < dumpx.length; x ++){

    var jo = dumpx[x];

    jo.datee = moment(jo.date,"DD.MM.YYYY").toDate();
  }

  mongodb.collection("memoryt").insertMany(request.body, function(err, r) {
    if (err) {
    console.log("Error: " + err);
     response.status(500).send(err);
    } else {
      console.log("Success");
        response.send({success:true});
    }
  });

});

// Service to add memory transactions per user
app.post("/memoryu", function(request, response) {
  console.log("Insert memoryu");
  console.log(request.body);

    var dumpx = request.body;

  for(var x=0; x < dumpx.length; x ++){

    var jo = dumpx[x];

    jo.datee = moment(jo.date,"DD.MM.YYYY").toDate();
  }

  mongodb.collection("memoryu").insertMany(request.body, function(err, r) {
    if (err) {
    console.log("Error: " + err);
     response.status(500).send(err);
    } else {
      console.log("Success");
        response.send({success:true});
    }
  });

});

// Service to add transactions per subapp
app.post("/subapp", function(request, response) {
  console.log("Insert subapp");
  console.log(request.body);

    var dumpx = request.body;

  for(var x=0; x < dumpx.length; x ++){

    var jo = dumpx[x];

    jo.datee = moment(jo.date,"DDMMYYYY").toDate();
  }

  mongodb.collection("subapp").insertMany(request.body, function(err, r) {
    if (err) {
    console.log("Error: " + err);
     response.status(500).send(err);
    } else {
      console.log("Success");
        response.send({success:true});
    }
  });

});

// Service to add transactions
app.post("/transaction", function(request, response) {
  console.log("Insert transactions");
  console.log(request.body);

    var dumpx = request.body;

  for(var x=0; x < dumpx.length; x ++){

    var jo = dumpx[x];

    jo.datee = moment(jo.date,"DDMMYYYY").toDate();
  }

  mongodb.collection("transaction").insertMany(request.body, function(err, r) {
    if (err) {
    console.log("Error: " + err);
     response.status(500).send(err);
    } else {
      console.log("Success");
        response.send({success:true});
    }
  });

});


/// TEST

// Service to add test arrays
app.post("/test", function(request, response) {
  console.log("Insert test array");
  console.log(request.body);

  mongodb.collection("testcol").insertMany(request.body, function(err, r) {
    if (err) {
    console.log("Error: " + err);
     response.status(500).send(err);
    } else {
      console.log("Success");
        response.send({success:true});
    }
  });

});

// Service to delete test arrays
app.delete("/test", function(request, response) {
  console.log("delete test collection");
  console.log(request.body);

  mongodb.collection("testcol").remove({});

  response.send({success:true});

});

// Service to get test status
app.get("/test/status",function(request, response){
  console.log("Getting status");
  mongodb.collection("testcol").stats(function(err, results) {
    response.send({success:true, status:results});
});

});



//////////////  Chart POST Services


// Service to get dumps organized by program
app.post("/dumpchart",cors(),function(request, response){
  console.log("Getting dumpchart");

    mongodb.collection("dumps").mapReduce(
    function(){

        emit(this.terminated_program, 1);
      },
    function(key,values){return Array.sum(values);},
    {out:{replace: 'tempdum'},
  query:{datee:{
    "$gte": new Date(request.body.start),
    "$lt": new Date(request.body.end)
  },
        customer:request.body.client,
      sid:{"$in":request.body.sids}}},
    function(err, collection){

      if(err){
        console.log(err);
        response.send({success:false});
      }else{

      collection.find().sort({value:-1}).limit(5).toArray(function(er, results) {

        console.log("Results: "+ results.length);

          response.send({success:true, dumps:results});
    
});
      }

    }
  );

});

// Service to get dumps organized by runtime error
app.post("/dumpchart2",cors(),function(request, response){
  console.log("Getting dumpchart");

    mongodb.collection("dumps").mapReduce(
    function(){

        emit(this.runtime_error, 1);
      },
    function(key,values){return Array.sum(values);},
    {out:{replace: 'tempdum2'},
  query:{datee:{
    "$gte": new Date(request.body.start),
    "$lt": new Date(request.body.end)
  },
        customer:request.body.client,
      sid:{"$in":request.body.sids}}},
    function(err, collection){

            if(err){
        console.log(err);
        response.send({success:false});
      }else{

      collection.find().sort({value:-1}).limit(5).toArray(function(er, results) {

        console.log("Results: "+ results.length);

          response.send({success:true, dumps:results});
    
});

      }

    }
  );

});

// Service to get dumps organized by date
app.post("/dumpchart3",cors(),function(request, response){
  console.log("Getting dumpchart");

    mongodb.collection("dumps").mapReduce(
    function(){

        emit(this.datee, 1);
      },
    function(key,values){return Array.sum(values);},
    {out:{replace: 'tempdum3'},
  query:{datee:{
    "$gte": new Date(request.body.start),
    "$lt": new Date(request.body.end)
  },
        customer:request.body.client,
      sid:{"$in":request.body.sids}}},
    function(err, collection){

            if(err){
        console.log(err);
        response.send({success:false});
      }else{

      collection.find().toArray(function(er, results) {

        console.log("Results: "+ results.length);

          response.send({success:true, dumps:results});
    
});
      }

    }
  );

});

// Service to get dumps organized by date and error
app.post("/dumpchart4",cors(),function(request, response){
  console.log("Getting dumpchart");
  console.log("error: "+ request.body.error);
    mongodb.collection("dumps").mapReduce(
    function(){

        emit(this.datee, {count:1,users:[this.user],programs:[this.terminated_program]});
      },
    function(key,values){

      var progs = [];
      var usrs = [];

      values.forEach(function(item){
        if (progs.indexOf(item.programs[0])==-1) progs.push(item.programs[0]);
        if (usrs.indexOf(item.users[0])==-1) usrs.push(item.users[0]);
      });
      return {count:values.length,users:usrs,programs:progs};
    },
    {
  query:{datee:{
    "$gte": new Date(request.body.start),
    "$lt": new Date(request.body.end)
  },
  runtime_error: request.body.error,
        customer:request.body.client,
      sid:{"$in":request.body.sids}},
out:{replace: 'tempdum4' + request.body.error}},
    function(err, collection){

            if(err){
        console.log(err);
        response.send({success:false});
      }else{

      collection.find().limit(10).toArray(function(er, results) {

        console.log("Results: "+ results.length);

          response.send({success:true, dumps:results});
    
});
      }

    }
  );

});

// Service to get transactions organized by avg response time
app.post("/transchart",cors(),function(request, response){
  console.log("Getting transchart");

    mongodb.collection("transaction").mapReduce(
    function(){

        emit(this.transaction, parseInt(this.resp_time));
      },
    function(key,values){return Array.avg(values);},
    {out:{replace: 'temptran'},
  query:{datee:{
    "$gte": new Date(request.body.start),
    "$lt": new Date(request.body.end)
  },
        customer:request.body.client,
      sid:{"$in":request.body.sids}}},
    function(err, collection){

      collection.find().sort({value:-1}).limit(10).toArray(function(er, results) {

        console.log("Results: "+ results.length);

          response.send({success:true, trans:results});
    
});

    }
  );

});

// Service to get transactions organized by memory consumption
app.post("/memorychart",cors(),function(request, response){
  console.log("Getting memorychart");

    mongodb.collection("memoryt").mapReduce(
    function(){

        emit(this.transaction, this.avg_memory);
      },
    function(key,values){return Array.avg(values);},
    {out:{replace: 'tempmem'},
  query:{datee:{
    "$gte": new Date(request.body.start),
    "$lt": new Date(request.body.end)
  },
        customer:request.body.client,
      sid:{"$in":request.body.sids}}},
    function(err, collection){

      collection.find().sort({value:-1}).limit(10).toArray(function(er, results) {

        console.log("Results: "+ results.length);

          response.send({success:true, trans:results});
    
});

    }
  );

});

// Service to get transactions organized by memory consumption
app.post("/memorychart2",cors(),function(request, response){
  console.log("Getting memorychart2");

    mongodb.collection("memoryt").mapReduce(
    function(){

        emit(this.transaction, this.avg_priv_memory);
      },
    function(key,values){return Array.avg(values);},
    {out:{replace: 'tempmem2'},
  query:{datee:{
    "$gte": new Date(request.body.start),
    "$lt": new Date(request.body.end)
  },
        customer:request.body.client,
      sid:{"$in":request.body.sids}}},
    function(err, collection){

      collection.find().sort({value:-1}).limit(5).toArray(function(er, results) {

        console.log("Results: "+ results.length);

          response.send({success:true, trans:results});
    
});

    }
  );

});


// Service to get jobs organized by their duration
app.post("/jobchart",cors(),function(request, response){
  console.log("Getting jobchart");

    mongodb.collection("job").find({date:{
    "$gte": new Date(request.body.start),
    "$lt": new Date(request.body.end)
  },
        customer:request.body.client,
      sid:{"$in":request.body.sids}},{job_name:1, duration:1, log:1}).sort({duration:-1}).limit(3).toArray(function(er, results) {

        console.log("Results: "+ results.length);

          response.send({success:true, jobs:results});
      
});

});

// Service to get jobs organized by user
app.post("/jobchart2",cors(),function(request, response){
  console.log("Getting jobchart");

    mongodb.collection("job").mapReduce(
    function(){

        emit(this.job_created_by, 1);
      },
    function(key,values){return Array.sum(values);},
    {out:{replace: 'tempcollection2'},
  query:{date:{
    "$gte": new Date(request.body.start),
    "$lt": new Date(request.body.end)
  },
        customer:request.body.client,
      sid:{"$in":request.body.sids}}},
    function(err, collection){

      collection.find().sort({value:-1}).limit(5).toArray(function(er, results) {

        console.log("Results: "+ results.length);

          response.send({success:true, jobs:results});
    
});

    }
  );

});

// Service to get jobs organized by their cuantity
app.post("/jobchart3",cors(),function(request, response){
  console.log("Getting jobchart");

    mongodb.collection("job").mapReduce(
    function(){

        emit(this.job_name, 1);
      },
    function(key,values){return Array.sum(values);},
    {out:{replace: 'tempcollection3'},
  query:{date:{
    "$gte": new Date(request.body.start),
    "$lt": new Date(request.body.end)
  },
        customer:request.body.client,
      sid:{"$in":request.body.sids}}},
    function(err, collection){

      collection.find().sort({value:-1}).limit(5).toArray(function(er, results) {

        console.log("Results: "+ results.length);

          response.send({success:true, jobs:results});
    
});

    }
  );

});

// Service to get jobs organized by their date
app.post("/jobchart4",cors(),function(request, response){
  console.log("Getting jobchart");

    mongodb.collection("job").mapReduce(
    function(){

        emit(this.date, 1);
      },
    function(key,values){return Array.sum(values);},
    {out:{replace: 'tempcollection4'},
  query:{date:{
    "$gte": new Date(request.body.start),
    "$lt": new Date(request.body.end)
  },
        customer:request.body.client,
      sid:{"$in":request.body.sids}}},
    function(err, collection){

      collection.find().toArray(function(er, results) {

        console.log("Results: "+ results.length);

          response.send({success:true, jobs:results});
    
});

    }
  );

});


//////////////  Users POST Services


// Service to create a user
app.post("/user",cors(),function(request, response){
  console.log("Creating User");

    mongodb.collection("users").find({username:request.body.username}).toArray(function(err, items) {
    if (err || items.length > 0) {
     response.send({success:false, message:"Username already taken"});
    } else {

      mongodb.collection("users").insertOne(request.body, function(err, r) {
        if (err) {
          console.log("Error: " + err);
          response.status(500).send(err);
        } else {
          console.log("Success");
            response.send({success:true});
        }
    });

    }
  });



});

// Service to login a user
app.post("/login",cors(),function(request, response){
  console.log("Login User");

    mongodb.collection("users").find({username:request.body.username, password:request.body.password},{password:0}).toArray(function(err, items) {
    if (err || items.length == 0) {
     response.send({success:false, message:"Username and password doesn't match"});
    } else {
      response.send({success:true, user:items[0]});

    }
  });

});

// Service to validate a user
app.post("/uservalidate",cors(),function(request, response){
  console.log("Login User");

    mongodb.collection("users").find({username:request.body.username},{password:0}).toArray(function(err, items) {
    if (err || items.length == 0) {
     response.send({success:false, message:"Username doesn't exist"});
    } else {
      response.send({success:true, user:items[0]});

    }
  });

});

/////// Other services

// Service to login a user
app.post("/delete",cors(),function(request, response){
  console.log("Delete collection");

    mongodb.collection(request.body.collection).remove({});

    response.send({success:true});

});

// Service to send message to conversation
app.post("/message",cors(),function(request, response){
  console.log("Send message");

    conversation.message({
  input: { text: request.body.message },
  workspace_id: 'a9dd6272-b4d4-4b43-9a85-172021f5e9e1'
 }, function(err, resp) {
     if (err) {
       console.error(err);
       response.send({success:false});
     } else {
       console.log(JSON.stringify(resp, null, 2));
       response.send({success:true, response:resp});
     }
});

    

});

////////// GET Services


// Service to get all dumps
app.get("/dump",function(request, response){
  console.log("Getting all dumps");
  mongodb.collection("dumps").find({}).toArray(function(err, dumps) {
    if (err) {
     response.status(500).send(err);
    } else {
     response.send({success:true, dumps:dumps});
    }
  });

});

// Service to get all workload records
app.get("/workload",function(request, response){
  console.log("Getting all workload records");
  mongodb.collection("workload").find({}).toArray(function(err, dumps) {
    if (err) {
     response.status(500).send(err);
    } else {
     response.send({success:true, workload:dumps});
    }
  });

});

// Service to get all load distribution records
app.get("/loaddistribution",function(request, response){
  console.log("Getting all loaddistribution records");
  mongodb.collection("loaddistribution").find({}).toArray(function(err, dumps) {
    if (err) {
     response.status(500).send(err);
    } else {
     response.send({success:true, loaddistribution:dumps});
    }
  });

});

// Service to get all overview records
app.get("/overview",function(request, response){
  console.log("Getting all overview records");
  mongodb.collection("overview").find({}).toArray(function(err, dumps) {
    if (err) {
     response.status(500).send(err);
    } else {
     response.send({success:true, overview:dumps});
    }
  });

});

// Service to get all filesystem records
app.get("/filesystem",function(request, response){
  console.log("Getting all filesystem records");
  mongodb.collection("filesystem").find({}).toArray(function(err, dumps) {
    if (err) {
     response.status(500).send(err);
    } else {
     response.send({success:true, filesystem:dumps});
    }
  });

});

// Service to get all systems
app.get("/system",function(request, response){
  console.log("Getting all systems");
  mongodb.collection("system").find({}).toArray(function(err, dumps) {
    if (err) {
     response.status(500).send(err);
    } else {
     response.send({success:true, dumps:dumps});
    }
  });

});

// Service to get all jobs
app.get("/job",function(request, response){
  console.log("Getting all jobs");
  mongodb.collection("job").find({}).toArray(function(err, dumps) {
    if (err) {
     response.status(500).send(err);
    } else {
     response.send({success:true, jobs:dumps});
    }
  });

});

// Service to get all memoryt
app.get("/memoryt",function(request, response){
  console.log("Getting all memoryt");
  mongodb.collection("memoryt").find({}).toArray(function(err, dumps) {
    if (err) {
     response.status(500).send(err);
    } else {
     response.send({success:true, tran:dumps});
    }
  });

});

// Service to get all memoryu
app.get("/memoryu",function(request, response){
  console.log("Getting all memoryu");
  mongodb.collection("memoryu").find({}).toArray(function(err, dumps) {
    if (err) {
     response.status(500).send(err);
    } else {
     response.send({success:true, tran:dumps});
    }
  });

});

// Service to get all subapp
app.get("/subapp",function(request, response){
  console.log("Getting all subapp");
  mongodb.collection("subapp").find({}).toArray(function(err, dumps) {
    if (err) {
     response.status(500).send(err);
    } else {
     response.send({success:true, tran:dumps});
    }
  });

});

// Service to get all transactions
app.get("/transaction",function(request, response){
  console.log("Getting all transaction");
  mongodb.collection("transaction").find({}).toArray(function(err, dumps) {
    if (err) {
     response.status(500).send(err);
    } else {
     response.send({success:true, tran:dumps});
    }
  });

});

// Service to get all users
app.get("/users",function(request, response){
  console.log("Getting all users");
  mongodb.collection("users").find({}).toArray(function(err, items) {
    if (err) {
     response.status(500).send(err);
    } else {
     response.send({success:true, users:items});
    }
  });

});

// Service to update user password
app.put("/users/password",function(request, response){
  console.log("Updating user");
  mongodb.collection("users").update({_id: new ObjectId(request.body.id)},{$set:{password:request.body.password}},function(err, items) {
    if (err) {
     response.status(500).send(err);
    } else {
     response.send({success:true});
    }
  });

  

});

// Service to get all test
app.get("/test",function(request, response){
  console.log("Getting all test");
  mongodb.collection("testcol").find({}).toArray(function(err, items) {
    if (err) {
     response.status(500).send(err);
    } else {
     response.send({success:true, items:items});
    }
  });

});


// Service to check if server is alive
app.get("/server",function(request, response){

   response.send("Server Alive");

});





app.listen(app.get('port'), function() {
 console.log('listening to Port', app.get('port'));
});
