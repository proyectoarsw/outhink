var express = require('express');
var path = require('path')
var cors = require('cors')
var app = express();
var moment = require('moment');
var bodyParser = require('body-parser');
var ConversationV1 = require('watson-developer-cloud/conversation/v1');
var request = require("request");

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(bodyParser.json());

app.use(cors());

// Util is handy to have around, so thats why that's here.
const util = require('util')
// and so is assert
const assert = require('assert');

const teamsURL = 'https://teamsp2.mybluemix.net'

// For disabling http
app.enable('trust proxy');
app.use(function (req, res, next) {
  if (req.secure) {
    // request was via https, so do no special handling
    next();
  } else {
    // request was via http, so redirect to https
    res.redirect('https://' + req.headers.host + req.url);
  }
});


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

var conversation_services = services["conversation"];

// This check ensures there is a services for Watson Conversation
assert(!util.isUndefined(conversation_services), "Must be bound to conversation services");

// We now take the first bound Watson conversation service and extract it's credentials object
var credentials_conversation = conversation_services[0].credentials;

var conversation = new ConversationV1({
  username: process.env.CONVERSATION_USERNAME,
  password: process.env.CONVERSATION_PASSWORD,
  version_date: ConversationV1.VERSION_DATE_2017_02_03
});

// -----------------watson conversation service for Slack
var Botkit = require('botkit');
var Promise = require('bluebird');

var convID = '1231062f-0531-4888-a4f7-14a6984de436';

var middleware = require('botkit-middleware-watson')({
  username: process.env.CONVERSATION_USERNAME,
  password: process.env.CONVERSATION_PASSWORD,
  workspace_id: convID,
  url: process.env.CONVERSATION_URL || 'https://gateway.watsonplatform.net/conversation/api',
  version_date: '2017-05-26'
});

// Configure your bot.
var slackController = Botkit.slackbot({retry:5});
var slackBot = slackController.spawn({
  token: 'xoxb-218317456099-5UYMjgwBFhZu81MHtCrL1Duz'
});

function getStandby(cust, sl, callback) {

  var options = {
    method: 'POST',
    url: 'https://teams.mybluemix.net/api/slack',
    json: true,
    body: {
      text: 'standby ' + cust,
    }
  };

  var res = '';

  request(options, function (err, resp, body) {
    res = '';
    if (err) {
      res = err.toString();
    } else {
      res = body;
    }
    callback(res);
  });
}

function getNewStandby(cust, sl, callback) {

  var options = {
    method: 'POST',
    url: teamsURL + '/api/slack',
    json: true,
    body: {
      sl: sl,
      cus: cust
    }
  };

  var res = '';

  request(options, function (err, resp, body) {
    res = '';
    if (err) {
      res = err.toString();
    } else {
      res = body;
    }
    callback(res);
  });
}

function getOCCStandby(callback) {
  var options = {
    method: 'POST',
    url: 'https://teamswm.mybluemix.net/api/slack',
    json: true,
    body: {
      text: 'standbyocc nutresa',
    }
  };

  var res = '';

  request(options, function (err, resp, body) {
    res = '';
    if (err) {
      res = err.toString();
    } else {
      res = body;
    }
    callback(res);
  });
}

function getDOTHistory(callback) {

  var options = {
    method: 'POST',
    url: 'https://myhive.mybluemix.net/api/slack',
    json: true,
    body: {
      text: 'history',
    }
  };

  var res = '';

  request(options, function (err, resp, body) {
    res = '';
    if (err) {
      res = err.toString();
    } else {
      res = body;
    }

    callback(res);
  });
}

slackController.hears(['.*'], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {
  slackController.log('Slack message received');
  middleware.interpret(bot, message, function () {
    if (message.watsonError) {
      return bot.reply(message, "I'm sorry, but for technical reasons I can't respond to your message");
    }
    if (typeof message.watsonData.output !== 'undefined') {
      //send "Please wait" to users
      bot.reply(message, message.watsonData.output.text.join('\n'));
      if (message.watsonData.output.action === 'standby') {

        var customer = 'none';
        var serviceLine = 'none';

        var obj = {};

        for (var i = 0; i < message.watsonData.entities.length; i++) {
          obj = message.watsonData.entities[i];

          if (obj.entity === 'cliente') {
            customer = obj.value;
          } else if (obj.entity === 'linea_servicio') {
            serviceLine = obj.value;
          }
        }

        //excecute action
        getStandby(customer, serviceLine, function (res) {
          //send message
          bot.reply(message, res);
        });
      }
      else if (message.watsonData.output.action === 'dot_history') {

        //excecute action
        getDOTHistory(function (res) {
          //send message
          bot.reply(message, res);
        });
      } else if (message.watsonData.output.action === 'turno') {

        var customer = 'none';
        var serviceLine = 'none';

        var obj = {};

        for (var i = 0; i < message.watsonData.entities.length; i++) {
          obj = message.watsonData.entities[i];

          if (obj.entity === 'cliente') {
            customer = obj.value;
          } else if (obj.entity === 'linea_servicio') {
            serviceLine = obj.value;
          }
        }

        //excecute action
        getNewStandby(customer, serviceLine, function (res) {
          //send message
          bot.reply(message, res);
        });
      }
    }
  });
});


slackBot.startRTM();



function initDBConnection() {

  MongoClient.connect(credentials.uri + '?authMode=scram-sha1&rm.tcpNoDelay=true', {
    mongos: {
      poolSize: 1,
      reconnectTries: 1
      , ssl: true,
      sslValidate: true,
      sslCA: ca
    }
  },
    function (err, db) {

      if (err) {
        console.log(err);
      } else {
        console.log("Connected to MongoDB");

        mongodb = db.db("db");

      }
    }
  );

}

initDBConnection();

app.use(express.static(__dirname + '/public'));

// Service to add dumps
app.post("/dump", function (req, response) {
  console.log("Insert dumps");
  console.log(req.body);

  var body = req.body;

  var csv = "customer, sid, environment, app_server, user, client, runtime_error, terminated_program, transaction_id, day, month, year";

  var it = {};

  var da = [];

  for (var x = 0; x < body.length; x++) {

    it = body[x];

    it.datee = moment(it.date, "DD.MM.YYYY").toDate();

    if (it.customer == 'Nutresa') {

      da = it.date.split('.');

      csv += '\n' + it.customer + ',' + it.sid + ',' + it.environment + ',' + it.app_server + ',' + it.user + ',' + it.client + ',' + it.runtime_error + ',' + it.terminated_program + ',' + it.transaction_id + ',' + da[0] + ',' + da[1] + ',' + da[2];
    }
  }

  var headers = {
    'accept': 'application/json',
    'X-IBM-Client-Id': '273ce84f-1005-4deb-8c32-84ec85075821',
    'X-IBM-Client-Secret': 'G2aR0bM2uJ0kJ0sM1lM4gE1iB8hB6pU0nH4oO4tO6lG7nN1hM8'
  }

  var form = {
    grant_type: 'refresh_token',
    refresh_token: 'nadYI1+pPAVuHlisshMjS/J8XWC8eMdcHP65OPqt/OX2jUF5ECgU3c+rni+ZtHtNlxtZhIC9pLSJhchMLHGbzES1BuCouxTlw1gKTpR3HcvCyDdtqWauIIvaXg4IVQzDvWJKuFH2ufjvxbJEua9XlFb5ssA/k/tRQzKAoiSrN+zS85Vyjz/9Jyes0QygZiGUX1IuQNOhUtnScJm7ArEjMunRFtnUwir4qqq8odew6oENAqLeXokqZ/Qqpet+webaQAUQHy6wy0uUoPYhawXHx1IurtX7eCCr0Q+InXwDGF5Ef0GXjotDAA'
  }

  request.post({ url: 'https://api.ibm.com/watsonanalytics/run/oauth2/v1/token', formData: form, headers: headers }, function (err, httpResponse, bodyx) {
    var headers2 = {
      'accept': 'application/json',
      'authorization': 'Bearer' + ' ' + JSON.parse(bodyx).access_token,
      'content-type': 'text/csv',
      'X-IBM-Client-Id': '273ce84f-1005-4deb-8c32-84ec85075821',
      'X-IBM-Client-Secret': 'G2aR0bM2uJ0kJ0sM1lM4gE1iB8hB6pU0nH4oO4tO6lG7nN1hM8'
    };


    request.put({ url: 'https://api.ibm.com/watsonanalytics/run/data/v1/datasets/2fccbb20-56f7-4b11-90e2-c16802be8e8d/content?appendData=true', headers: headers2, body: csv }, function (error2, response3, body3) {

    });

  })


  mongodb.collection("dumps").insertMany(body, function (err, r) {
    if (err) {
      console.log("Error: " + err);
      response.status(500).send(err);
    } else {
      console.log("Success");
      response.send({ success: true });
    }
  });

});

// Service to add job records
app.post("/job", function (req, response) {
  console.log("Insert job records");
  console.log(req.body);

  var body = req.body;

  var csv = "customer, sid, environment, job_name, job_created_by, status, start_time, duration, delay, day, month, year";

  var it = {};

  for (var x = 0; x < body.jobs.length; x++) {

    it = body.jobs[x];

    var log = "";

    if (x < 3) {

      log = body.log[x];

      if (log) {
        it.log = log;
      }
    }

    it.date = moment(it.start_date, "DDMMYYYY").toDate();

    if (it.customer == 'Nutresa') {

      csv += '\n' + it.customer + ',' + it.sid + ',' + it.environment + ',' + it.job_name + ',' + it.job_created_by + ',' + it.status + ',' + it.start_time + ',' + it.duration + ',' + it.delay + ',' + it.start_date.substring(0, 2) + ',' + it.start_date.substring(2, 4) + ',' + it.start_date.substring(4, 8);
    }

  }

  var headers = {
    'accept': 'application/json',
    'X-IBM-Client-Id': '273ce84f-1005-4deb-8c32-84ec85075821',
    'X-IBM-Client-Secret': 'G2aR0bM2uJ0kJ0sM1lM4gE1iB8hB6pU0nH4oO4tO6lG7nN1hM8'
  }

  var form = {
    grant_type: 'refresh_token',
    refresh_token: 'nadYI1+pPAVuHlisshMjS/J8XWC8eMdcHP65OPqt/OX2jUF5ECgU3c+rni+ZtHtNlxtZhIC9pLSJhchMLHGbzES1BuCouxTlw1gKTpR3HcvCyDdtqWauIIvaXg4IVQzDvWJKuFH2ufjvxbJEua9XlFb5ssA/k/tRQzKAoiSrN+zS85Vyjz/9Jyes0QygZiGUX1IuQNOhUtnScJm7ArEjMunRFtnUwir4qqq8odew6oENAqLeXokqZ/Qqpet+webaQAUQHy6wy0uUoPYhawXHx1IurtX7eCCr0Q+InXwDGF5Ef0GXjotDAA'
  }

  request.post({ url: 'https://api.ibm.com/watsonanalytics/run/oauth2/v1/token', formData: form, headers: headers }, function (err, httpResponse, bodyx) {
    var headers2 = {
      'accept': 'application/json',
      'authorization': 'Bearer' + ' ' + JSON.parse(bodyx).access_token,
      'content-type': 'text/csv',
      'X-IBM-Client-Id': '273ce84f-1005-4deb-8c32-84ec85075821',
      'X-IBM-Client-Secret': 'G2aR0bM2uJ0kJ0sM1lM4gE1iB8hB6pU0nH4oO4tO6lG7nN1hM8'
    };


    request.put({ url: 'https://api.ibm.com/watsonanalytics/run/data/v1/datasets/dcb7a4b6-b3f8-4c65-9189-485462eaad2f/content?appendData=true', headers: headers2, body: csv }, function (error2, response3, body3) {

    });

  })

  mongodb.collection("job").insertMany(body.jobs, function (err, r) {
    if (err) {
      console.log("Error: " + err);
      response.status(500).send(err);
    } else {
      response.send({ success: true });
    }
  });

});

// Service to add transactions
app.post("/transaction", function (req, response) {
  console.log("Insert transactions");
  console.log(req.body);

  var body = req.body;

  var csv = "customer, sid, environment, instance, sub_app, transaction, steps, resp_time, day, month, year";

  var it = {};

  for (var x = 0; x < body.length; x++) {

    it = body[x];

    it.datee = moment(it.date, "DDMMYYYY").toDate();

    if (it.customer == 'Nutresa') {

      csv += '\n' + it.customer + ',' + it.sid + ',' + it.environment + ',' + it.instance + ',' + it.sub_app + ',' + it.transaction + ',' + it.steps + ',' + it.resp_time + ',' + it.date.substring(0, 2) + ',' + it.date.substring(2, 4) + ',' + it.date.substring(4, 8);
    }
  }

  var headers = {
    'accept': 'application/json',
    'X-IBM-Client-Id': '273ce84f-1005-4deb-8c32-84ec85075821',
    'X-IBM-Client-Secret': 'G2aR0bM2uJ0kJ0sM1lM4gE1iB8hB6pU0nH4oO4tO6lG7nN1hM8'
  }

  var form = {
    grant_type: 'refresh_token',
    refresh_token: 'nadYI1+pPAVuHlisshMjS/J8XWC8eMdcHP65OPqt/OX2jUF5ECgU3c+rni+ZtHtNlxtZhIC9pLSJhchMLHGbzES1BuCouxTlw1gKTpR3HcvCyDdtqWauIIvaXg4IVQzDvWJKuFH2ufjvxbJEua9XlFb5ssA/k/tRQzKAoiSrN+zS85Vyjz/9Jyes0QygZiGUX1IuQNOhUtnScJm7ArEjMunRFtnUwir4qqq8odew6oENAqLeXokqZ/Qqpet+webaQAUQHy6wy0uUoPYhawXHx1IurtX7eCCr0Q+InXwDGF5Ef0GXjotDAA'
  }

  request.post({ url: 'https://api.ibm.com/watsonanalytics/run/oauth2/v1/token', formData: form, headers: headers }, function (err, httpResponse, bodyx) {
    var headers2 = {
      'accept': 'application/json',
      'authorization': 'Bearer' + ' ' + JSON.parse(bodyx).access_token,
      'content-type': 'text/csv',
      'X-IBM-Client-Id': '273ce84f-1005-4deb-8c32-84ec85075821',
      'X-IBM-Client-Secret': 'G2aR0bM2uJ0kJ0sM1lM4gE1iB8hB6pU0nH4oO4tO6lG7nN1hM8'
    };


    request.put({ url: 'https://api.ibm.com/watsonanalytics/run/data/v1/datasets/aef7c7ee-fda5-417c-870f-5e3e338bc2e3/content?appendData=true', headers: headers2, body: csv }, function (error2, response3, body3) {

    });

  })

  mongodb.collection("transaction").insertMany(body, function (err, r) {
    if (err) {
      console.log("Error: " + err);
      response.status(500).send(err);
    } else {
      response.send({ success: true });
    }
  });


});

// Service to add memory transactions
app.post("/memoryt", function (req, response) {
  console.log("Insert memoryt");
  console.log(req.body);

  var body = req.body;

  var csv = "customer, sid, environment, instance, transaction, steps, avg_memory, avg_priv_memory, day, month, year";

  var it = {};

  var da = [];

  for (var x = 0; x < body.length; x++) {

    it = body[x];

    it.datee = moment(it.date, "DD.MM.YYYY").toDate();

    if (it.customer == 'Nutresa') {

      da = it.date.split('.');

      csv += '\n' + it.customer + ',' + it.sid + ',' + it.environment + ',' + it.instance + ',' + it.transaction + ',' + it.steps + ',' + it.avg_memory + ',' + it.avg_priv_memory + ',' + da[0] + ',' + da[1] + ',' + da[2];
    }

  }

  var headers = {
    'accept': 'application/json',
    'X-IBM-Client-Id': '273ce84f-1005-4deb-8c32-84ec85075821',
    'X-IBM-Client-Secret': 'G2aR0bM2uJ0kJ0sM1lM4gE1iB8hB6pU0nH4oO4tO6lG7nN1hM8'
  }

  var form = {
    grant_type: 'refresh_token',
    refresh_token: 'nadYI1+pPAVuHlisshMjS/J8XWC8eMdcHP65OPqt/OX2jUF5ECgU3c+rni+ZtHtNlxtZhIC9pLSJhchMLHGbzES1BuCouxTlw1gKTpR3HcvCyDdtqWauIIvaXg4IVQzDvWJKuFH2ufjvxbJEua9XlFb5ssA/k/tRQzKAoiSrN+zS85Vyjz/9Jyes0QygZiGUX1IuQNOhUtnScJm7ArEjMunRFtnUwir4qqq8odew6oENAqLeXokqZ/Qqpet+webaQAUQHy6wy0uUoPYhawXHx1IurtX7eCCr0Q+InXwDGF5Ef0GXjotDAA'
  }

  request.post({ url: 'https://api.ibm.com/watsonanalytics/run/oauth2/v1/token', formData: form, headers: headers }, function (err, httpResponse, bodyx) {
    var headers2 = {
      'accept': 'application/json',
      'authorization': 'Bearer' + ' ' + JSON.parse(bodyx).access_token,
      'content-type': 'text/csv',
      'X-IBM-Client-Id': '273ce84f-1005-4deb-8c32-84ec85075821',
      'X-IBM-Client-Secret': 'G2aR0bM2uJ0kJ0sM1lM4gE1iB8hB6pU0nH4oO4tO6lG7nN1hM8'
    };


    request.put({ url: 'https://api.ibm.com/watsonanalytics/run/data/v1/datasets/543553af-528b-4570-94a3-89b29642e301/content?appendData=true', headers: headers2, body: csv }, function (error2, response3, body3) {

    });

  })

  mongodb.collection("memoryt").insertMany(body, function (err, r) {
    if (err) {
      console.log("Error: " + err);
      response.status(500).send(err);
    } else {
      response.send({ success: true });
    }
  });


});

// Service to add memory transactions per user
app.post("/memoryu", function (request, response) {
  console.log("Insert memoryu");
  console.log(request.body);

  var dumpx = request.body;

  for (var x = 0; x < dumpx.length; x++) {

    var jo = dumpx[x];

    jo.datee = moment(jo.date, "DD.MM.YYYY").toDate();
  }

  mongodb.collection("memoryu").insertMany(request.body, function (err, r) {
    if (err) {
      console.log("Error: " + err);
      response.status(500).send(err);
    } else {
      console.log("Success");
      response.send({ success: true });
    }
  });

});

/*
// Service to add workload records
app.post("/workload", function (request, response) {
  console.log("Insert workload records");
  console.log(request.body);

  var items = request.body;

  var item = {};

  for (var x = 0; x < items.length; x++) {

    item = items[x];

    item.datee = moment(item.date, "DD.MM.YYYY").toDate();
  }

  mongodb.collection("workload").insertMany(items, function (err, r) {
    if (err) {
      console.log("Error: " + err);
      response.status(500).send(err);
    } else {
      console.log("Success");
      response.send({ success: true });
    }
  });

});

// Service to add load distribution records
app.post("/loaddistribution", function (request, response) {
  console.log("Insert load distribution records");
  console.log(request.body);

  mongodb.collection("loaddistribution").insertMany(request.body, function (err, r) {
    if (err) {
      console.log("Error: " + err);
      response.status(500).send(err);
    } else {
      console.log("Success");
      response.send({ success: true });
    }
  });

});

// Service to add overview records
app.post("/overview", function (request, response) {
  console.log("Insert overview records");
  console.log(request.body);

  mongodb.collection("overview").insertMany(request.body, function (err, r) {
    if (err) {
      console.log("Error: " + err);
      response.status(500).send(err);
    } else {
      console.log("Success");
      response.send({ success: true });
    }
  });

});

// Service to add filesystem records
app.post("/filesystem", function (request, response) {
  console.log("Insert filesystem records");
  console.log(request.body);

  mongodb.collection("filesystem").insertMany(request.body, function (err, r) {
    if (err) {
      console.log("Error: " + err);
      response.status(500).send(err);
    } else {
      console.log("Success");
      response.send({ success: true });
    }
  });

});

// Service to add system records
app.post("/system", function (request, response) {
  console.log("Insert system records");
  console.log(request.body);

  mongodb.collection("system").insertMany(request.body, function (err, r) {
    if (err) {
      console.log("Error: " + err);
      response.status(500).send(err);
    } else {
      console.log("Success");
      response.send({ success: true });
    }
  });

});

// Service to add transactions per subapp
app.post("/subapp", function (request, response) {
  console.log("Insert subapp");
  console.log(request.body);

  var dumpx = request.body;

  for (var x = 0; x < dumpx.length; x++) {

    var jo = dumpx[x];

    jo.datee = moment(jo.date, "DDMMYYYY").toDate();
  }

  mongodb.collection("subapp").insertMany(request.body, function (err, r) {
    if (err) {
      console.log("Error: " + err);
      response.status(500).send(err);
    } else {
      console.log("Success");
      response.send({ success: true });
    }
  });

});

*/


/// TEST

// Service to add test arrays
app.post("/test", function (request, response) {
  console.log("Insert test array");
  console.log(request.body);

  mongodb.collection("testcol").insertMany(request.body, function (err, r) {
    if (err) {
      console.log("Error: " + err);
      response.status(500).send(err);
    } else {
      console.log("Success");
      response.send({ success: true });
    }
  });

});

// Service to delete test arrays
app.delete("/test", function (request, response) {
  console.log("delete test collection");
  console.log(request.body);

  mongodb.collection("testcol").remove({});

  response.send({ success: true });

});

// Service to get test status
app.get("/test/status", function (request, response) {
  console.log("Getting status");
  mongodb.collection("testcol").stats(function (err, results) {
    response.send({ success: true, status: results });
  });

});



//////////////  Chart POST Services


// Service to get dumps organized by program
app.post("/dumpchart", cors(), function (request, response) {
  console.log("Getting dumpchart");

  mongodb.collection("dumps").mapReduce(
    function () {

      emit(this.terminated_program, 1);
    },
    function (key, values) { return Array.sum(values); },
    {
      out: { replace: 'tempdum' },
      query: {
        datee: {
          "$gte": new Date(request.body.start),
          "$lt": new Date(request.body.end)
        },
        customer: request.body.client,
        sid: { "$in": request.body.sids }
      }
    },
    function (err, collection) {

      if (err) {
        console.log(err);
        response.send({ success: false });
      } else {

        collection.find().sort({ value: -1 }).limit(5).toArray(function (er, results) {

          response.send({ success: true, data: results });

        });
      }

    }
  );

});

// Service to get dumps organized by runtime error
app.post("/dumpchart2", cors(), function (request, response) {
  console.log("Getting dumpchart");

  mongodb.collection("dumps").mapReduce(
    function () {

      emit(this.runtime_error, 1);
    },
    function (key, values) { return Array.sum(values); },
    {
      out: { replace: 'tempdum2' },
      query: {
        datee: {
          "$gte": new Date(request.body.start),
          "$lt": new Date(request.body.end)
        },
        customer: request.body.client,
        sid: { "$in": request.body.sids }
      }
    },
    function (err, collection) {

      if (err) {
        console.log(err);
        response.send({ success: false });
      } else {

        collection.find().sort({ value: -1 }).limit(5).toArray(function (er, results) {

          response.send({ success: true, data: results });

        });

      }

    }
  );

});

// Service to get dumps organized by date
app.post("/dumpchart3", cors(), function (request, response) {
  console.log("Getting dumpchart");

  mongodb.collection("dumps").mapReduce(
    function () {

      emit(this.datee, 1);
    },
    function (key, values) { return Array.sum(values); },
    {
      out: { replace: 'tempdum3' },
      query: {
        datee: {
          "$gte": new Date(request.body.start),
          "$lt": new Date(request.body.end)
        },
        customer: request.body.client,
        sid: { "$in": request.body.sids }
      }
    },
    function (err, collection) {

      if (err) {
        console.log(err);
        response.send({ success: false });
      } else {

        collection.find().toArray(function (er, results) {

          response.send({ success: true, data: results });

        });
      }

    }
  );

});

// Service to get dumps organized by date and error
app.post("/dumpchart4", cors(), function (request, response) {
  console.log("Getting dumpchart");
  console.log("error: " + request.body.error);
  mongodb.collection("dumps").mapReduce(
    function () {

      // emit(this.datee, {count:1,users:[this.user],programs:[this.terminated_program]});
      emit(this.datee, 1);
    },
    function (key, values) {
      /*
            var progs = [];
            var usrs = [];
      
            values.forEach(function(item){
              if (progs.indexOf(item.programs[0])==-1) progs.push(item.programs[0]);
              if (usrs.indexOf(item.users[0])==-1) usrs.push(item.users[0]);
            });
            return {count:values.length,users:usrs,programs:progs};
            */
      return Array.sum(values);
    },
    {
      query: {
        datee: {
          "$gte": new Date(request.body.start),
          "$lt": new Date(request.body.end)
        },
        runtime_error: request.body.error,
        customer: request.body.client,
        sid: { "$in": request.body.sids }
      },
      out: { replace: 'tempdum4' + request.body.error }
    },
    function (err, collection) {

      if (err) {
        console.log(err);
        response.send({ success: false });
      } else {

        collection.find().limit(10).toArray(function (er, results) {

          response.send({ success: true, data: results });

        });
      }

    }
  );

});

// Service to get transactions organized by avg response time
app.post("/transchart", cors(), function (request, response) {
  console.log("Getting transchart");

  mongodb.collection("transaction").mapReduce(
    function () {

      emit(this.transaction, parseInt(this.resp_time));
    },
    function (key, values) { return Array.avg(values); },
    {
      out: { replace: 'temptran' },
      query: {
        datee: {
          "$gte": new Date(request.body.start),
          "$lt": new Date(request.body.end)
        },
        customer: request.body.client,
        sid: { "$in": request.body.sids }
      }
    },
    function (err, collection) {

      if (err) {
        console.log(err);
        response.send({ success: false });
      } else {

        collection.find().sort({ value: -1 }).limit(10).toArray(function (er, results) {

          response.send({ success: true, data: results });

        });
      }

    }
  );

});

// Service to get transactions organized by memory consumption
app.post("/memorychart", cors(), function (request, response) {
  console.log("Getting memorychart");

  mongodb.collection("memoryt").mapReduce(
    function () {

      emit(this.transaction, this.avg_memory);
    },
    function (key, values) { return Array.avg(values); },
    {
      out: { replace: 'tempmem' },
      query: {
        datee: {
          "$gte": new Date(request.body.start),
          "$lt": new Date(request.body.end)
        },
        customer: request.body.client,
        sid: { "$in": request.body.sids }
      }
    },
    function (err, collection) {

      if (err) {
        console.log(err);
        response.send({ success: false });
      } else {

        collection.find().sort({ value: -1 }).limit(10).toArray(function (er, results) {

          response.send({ success: true, data: results });

        });
      }

    }
  );

});

// Service to get transactions organized by memory consumption
app.post("/memorychart2", cors(), function (request, response) {
  console.log("Getting memorychart2");

  mongodb.collection("memoryt").mapReduce(
    function () {

      emit(this.transaction, this.avg_priv_memory);
    },
    function (key, values) { return Array.avg(values); },
    {
      out: { replace: 'tempmem2' },
      query: {
        datee: {
          "$gte": new Date(request.body.start),
          "$lt": new Date(request.body.end)
        },
        customer: request.body.client,
        sid: { "$in": request.body.sids }
      }
    },
    function (err, collection) {

      if (err) {
        console.log(err);
        response.send({ success: false });
      } else {

        collection.find().sort({ value: -1 }).limit(5).toArray(function (er, results) {

          response.send({ success: true, data: results });

        });

      }

    }
  );

});


// Service to get jobs organized by their duration
app.post("/jobchart", cors(), function (request, response) {
  console.log("Getting jobchart");

  mongodb.collection("job").find({
    date: {
      "$gte": new Date(request.body.start),
      "$lt": new Date(request.body.end)
    },
    customer: request.body.client,
    sid: { "$in": request.body.sids }
  }, { job_name: 1, duration: 1, log: 1 }).sort({ duration: -1 }).limit(3).toArray(function (er, results) {

    response.send({ success: true, data: results });

  });

});

// Service to get jobs organized by user
app.post("/jobchart2", cors(), function (request, response) {
  console.log("Getting jobchart");

  mongodb.collection("job").mapReduce(
    function () {

      emit(this.job_created_by, 1);
    },
    function (key, values) { return Array.sum(values); },
    {
      out: { replace: 'tempcollection2' },
      query: {
        date: {
          "$gte": new Date(request.body.start),
          "$lt": new Date(request.body.end)
        },
        customer: request.body.client,
        sid: { "$in": request.body.sids }
      }
    },
    function (err, collection) {

      if (err) {
        console.log(err);
        response.send({ success: false });
      } else {

        collection.find().sort({ value: -1 }).limit(5).toArray(function (er, results) {

          response.send({ success: true, data: results });

        });
      }

    }
  );

});

// Service to get jobs organized by their cuantity
app.post("/jobchart3", cors(), function (request, response) {
  console.log("Getting jobchart");

  mongodb.collection("job").mapReduce(
    function () {

      emit(this.job_name, 1);
    },
    function (key, values) { return Array.sum(values); },
    {
      out: { replace: 'tempcollection3' },
      query: {
        date: {
          "$gte": new Date(request.body.start),
          "$lt": new Date(request.body.end)
        },
        customer: request.body.client,
        sid: { "$in": request.body.sids }
      }
    },
    function (err, collection) {

      if (err) {
        console.log(err);
        response.send({ success: false });
      } else {

        collection.find().sort({ value: -1 }).limit(5).toArray(function (er, results) {

          response.send({ success: true, data: results });

        });
      }

    }
  );

});

// Service to get jobs organized by their date
app.post("/jobchart4", cors(), function (request, response) {
  console.log("Getting jobchart");

  mongodb.collection("job").mapReduce(
    function () {

      emit(this.date, 1);
    },
    function (key, values) { return Array.sum(values); },
    {
      out: { replace: 'tempcollection4' },
      query: {
        date: {
          "$gte": new Date(request.body.start),
          "$lt": new Date(request.body.end)
        },
        customer: request.body.client,
        sid: { "$in": request.body.sids }
      }
    },
    function (err, collection) {

      if (err) {
        console.log(err);
        response.send({ success: false });
      } else {

        collection.find().toArray(function (er, results) {

          response.send({ success: true, data: results });

        });
      }

    }
  );

});


// Service to get Workload table
app.post("/workloadchart", cors(), function (request, response) {
  console.log("Getting workloadchart");

  mongodb.collection("workload").mapReduce(
    function () {

      emit(this.task_type, { count: 1, item: this });
    },
    function (key, values) {

      var steps = 0;
      var time = 0;
      var avg_proc_time = 0;
      var cpu_time = 0;
      var db_time = 0;
      var time2 = 0;
      var wait_time = 0;
      var rol_in = 0;
      var roll_wait_time = 0;
      var load_gen_time = 0;
      var lock_time = 0;
      var CPIC_RFC = 0;
      var time3 = 0;
      var gui_time = 0;
      var trips = 0;
      var kb = 0;
      var vmc_calls = 0;
      var t_vmc_cpu = 0;
      var t_vmcelaps = 0;
      var avgvmc_cpu = 0;
      var avgvmcelap = 0;

      var item;
      var val;

      var len = 0;

      for (var i = 0; i < values.length; i++) {

        val = values[i];
        item = val.item;


        steps += item.steps;
        time += item.time;
        avg_proc_time += item.avg_proc_time;
        cpu_time += item.cpu_time;
        db_time += item.db_time;
        time2 += item.time2;
        wait_time += item.wait_time;
        rol_in += item.rol_in;
        roll_wait_time += item.roll_wait_time;
        load_gen_time += item.load_gen_time;
        lock_time += item.lock_time;
        CPIC_RFC += item["CPIC/RFC"];
        time3 += item.time3;
        gui_time += item.gui_time;
        trips += item.trips;
        kb += item.kb;
        vmc_calls += item.vmc_calls;
        t_vmc_cpu += item.t_vmc_cpu;
        t_vmcelaps += item.t_vmcelaps;
        avgvmc_cpu += item.avgvmc_cpu;
        avgvmcelap += item.avgvmcelap;

        len += val.count;
      }

      var rss = {};
      rss.steps = (steps / len);
      rss.time = (time / len);
      rss.avg_proc_time = (avg_proc_time / len);
      rss.cpu_time = (cpu_time / len);
      rss.db_time = (db_time / len);
      rss.time2 = (time / len);
      rss.wait_time = (wait_time / len);
      rss.rol_in = (rol_in / len);
      rss.roll_wait_time = (roll_wait_time / len);
      rss.load_gen_time = (load_gen_time / len);
      rss.lock_time = (lock_time / len);
      rss.time3 = (time / len);
      rss.gui_time = (gui_time / len);
      rss.trips = (trips / len);
      rss.kb = (kb / len);
      rss.vmc_calls = (vmc_calls / len);
      rss.t_vmc_cpu = (t_vmc_cpu / len);
      rss.t_vmcelaps = (t_vmcelaps / len);
      rss.avgvmc_cpu = (avgvmc_cpu / len)
      rss.avgvmcelap = (avgvmcelap / len);
      rss["CPIC/RFC"] = (CPIC_RFC / len);

      return rss;


    },
    {
      out: { replace: 'tempworkload' },
      query: {
        datee: {
          "$gte": new Date(request.body.start),
          "$lt": new Date(request.body.end)
        },
        customer: request.body.client,
        sid: { "$in": request.body.sids },
        instance: { "$regex": request.body.instance }
      }
    },
    function (err, collection) {

      if (err) {
        console.log(err);
        response.send({ success: false });
      } else {
        collection.find().toArray(function (er, results) {

          console.log("Results: " + results.length);

          response.send({ success: true, data: results });

        });
      }

    }
  );

});

// Service to get workload value organized by date
app.post("/workloadchart2", cors(), function (request, response) {
  console.log("Getting workloadchart");

  mongodb.collection("workload").mapReduce(
    function () {

      emit(this.datee, this[it]);
    },
    function (key, values) { return Array.avg(values); },
    {
      out: { replace: 'tempworkload2' },
      query: {
        datee: {
          "$gte": new Date(request.body.start),
          "$lt": new Date(request.body.end)
        },
        customer: request.body.client,
        sid: { "$in": request.body.sids },
        task_type: request.body.task,
        instance: { "$regex": request.body.instance }
      },
      scope: { it: request.body.item }
    },
    function (err, collection) {

      if (err) {
        response.send({ success: false, error: err.toString() });
      } else {

        collection.find().toArray(function (er, results) {

          console.log("Results: " + results.length);

          response.send({ success: true, data: results });

        });
      }
    }
  );

});

// Service to get workload servers
app.post("/workloadchart3", cors(), function (request, response) {
  console.log("Getting workloadchart");

  mongodb.collection('workload').distinct('instance', { customer: request.body.client, sid: { "$in": request.body.sids } },
    function (er, results) {

      if (er) {
        response.send({ success: false, error: er.toString() });
      } else {
        response.send({ success: true, data: results });
      }

    });




});

///////////// Ionic Services

// Service to get notification tokens
app.get("/tokens", cors(), function (req, response) {
  console.log("Getting tokens");

  var options = {
    method: 'GET',
    url: 'https://api.ionic.io/push/tokens',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    json: true
  };

  request(options, function (err, resp, body) {
    if (err) throw new Error(err);
    console.log(body);
    response.send({ success: true, items: body.data });
  });

});

// Service to send a push notification to users with token
app.post("/pushwithtokens", cors(), function (req, response) {
  console.log("Sending push notification");

  var options = {
    method: 'POST',
    url: 'https://api.ionic.io/push/notifications',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    json: true,
    body: {
      tokens: req.body.tokens,
      profile: 'dev',
      notification: {
        title: req.body.title,
        message: req.body.message
      }
    }
  };

  request(options, function (err, resp, body) {
    if (err) throw new Error(err);
    console.log(body);
    response.send({ success: true, items: body.data });
  });

});

// Service to send a push notification to all users
app.post("/pushall", cors(), function (req, response) {
  console.log("Sending push notification");

  var options = {
    method: 'POST',
    url: 'https://api.ionic.io/push/notifications',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    json: true,
    body: {
      send_to_all: true,
      profile: 'dev',
      notification: {
        title: req.body.title,
        message: req.body.message
      }
    }
  };

  request(options, function (err, resp, body) {
    if (err) throw new Error(err);
    console.log(body);
    response.send({ success: true, items: body.data });
  });

});


//////////////  Users POST Services


// Service to create a user
app.post("/user", cors(), function (request, response) {
  console.log("Creating User");

  mongodb.collection("users").find({ username: request.body.username }).toArray(function (err, items) {
    if (err || items.length > 0) {
      response.send({ success: false, message: "Username already taken" });
    } else {

      mongodb.collection("users").insertOne(request.body, function (err, r) {
        if (err) {
          console.log("Error: " + err);
          response.status(500).send(err);
        } else {
          console.log("Success");
          response.send({ success: true });
        }
      });

    }
  });



});

// Service to login a user
app.post("/login", cors(), function (request, response) {
  console.log("Login User");

  mongodb.collection("users").find({ username: request.body.username, password: request.body.password }, { password: 0 }).toArray(function (err, items) {
    if (err || items.length == 0) {
      response.send({ success: false, message: "Username and password doesn't match" });
    } else {
      response.send({ success: true, user: items[0] });

    }
  });

});

// Service to validate a user
app.post("/uservalidate", cors(), function (request, response) {
  console.log("Login User");

  mongodb.collection("users").find({ username: request.body.username }, { password: 0 }).toArray(function (err, items) {
    if (err || items.length == 0) {
      response.send({ success: false, message: "Username doesn't exist" });
    } else {
      response.send({ success: true, user: items[0] });

    }
  });

});

/////// Other services

// Service to login a user
app.post("/delete", cors(), function (request, response) {
  console.log("Delete collection");

  mongodb.collection(request.body.collection).remove({});

  response.send({ success: true });

});

// Service to send message to conversation
app.post("/message", cors(), function (request, response) {
  console.log("Send message");

  conversation.message({
    input: { text: request.body.message },
    workspace_id: 'a9dd6272-b4d4-4b43-9a85-172021f5e9e1'
  }, function (err, resp) {
    if (err) {
      console.error(err);
      response.send({ success: false });
    } else {
      console.log(JSON.stringify(resp, null, 2));
      response.send({ success: true, response: resp });
    }
  });



});

////////// GET Services


// Service to get all dumps
app.get("/dump", function (request, response) {
  console.log("Getting all dumps");
  mongodb.collection("dumps").find({}).toArray(function (err, dumps) {
    if (err) {
      response.status(500).send(err);
    } else {
      response.send({ success: true, dumps: dumps });
    }
  });

});

// Service to get all workload records
app.get("/workload", function (request, response) {
  console.log("Getting all workload records");
  mongodb.collection("workload").find({}).toArray(function (err, dumps) {
    if (err) {
      response.status(500).send(err);
    } else {
      response.send({ success: true, workload: dumps });
    }
  });

});

// Service to get all load distribution records
app.get("/loaddistribution", function (request, response) {
  console.log("Getting all loaddistribution records");
  mongodb.collection("loaddistribution").find({}).toArray(function (err, dumps) {
    if (err) {
      response.status(500).send(err);
    } else {
      response.send({ success: true, loaddistribution: dumps });
    }
  });

});

// Service to get all overview records
app.get("/overview", function (request, response) {
  console.log("Getting all overview records");
  mongodb.collection("overview").find({}).toArray(function (err, dumps) {
    if (err) {
      response.status(500).send(err);
    } else {
      response.send({ success: true, overview: dumps });
    }
  });

});

// Service to get all filesystem records
app.get("/filesystem", function (request, response) {
  console.log("Getting all filesystem records");
  mongodb.collection("filesystem").find({}).toArray(function (err, dumps) {
    if (err) {
      response.status(500).send(err);
    } else {
      response.send({ success: true, filesystem: dumps });
    }
  });

});

// Service to get all systems
app.get("/system", function (request, response) {
  console.log("Getting all systems");
  mongodb.collection("system").find({}).toArray(function (err, dumps) {
    if (err) {
      response.status(500).send(err);
    } else {
      response.send({ success: true, dumps: dumps });
    }
  });

});

// Service to get all jobs
app.get("/job", function (request, response) {
  console.log("Getting all jobs");
  mongodb.collection("job").find({}).toArray(function (err, dumps) {
    if (err) {
      response.status(500).send(err);
    } else {
      response.send({ success: true, jobs: dumps });
    }
  });

});

// Service to get all memoryt
app.get("/memoryt", function (request, response) {
  console.log("Getting all memoryt");
  mongodb.collection("memoryt").find({}).toArray(function (err, dumps) {
    if (err) {
      response.status(500).send(err);
    } else {
      response.send({ success: true, tran: dumps });
    }
  });

});

// Service to get all memoryu
app.get("/memoryu", function (request, response) {
  console.log("Getting all memoryu");
  mongodb.collection("memoryu").find({}).toArray(function (err, dumps) {
    if (err) {
      response.status(500).send(err);
    } else {
      response.send({ success: true, tran: dumps });
    }
  });

});

// Service to get all subapp
app.get("/subapp", function (request, response) {
  console.log("Getting all subapp");
  mongodb.collection("subapp").find({}).toArray(function (err, dumps) {
    if (err) {
      response.status(500).send(err);
    } else {
      response.send({ success: true, tran: dumps });
    }
  });

});

// Service to get all transactions
app.get("/transaction", function (request, response) {
  console.log("Getting all transaction");
  mongodb.collection("transaction").find({}).toArray(function (err, dumps) {
    if (err) {
      response.status(500).send(err);
    } else {
      response.send({ success: true, tran: dumps });
    }
  });

});

// Service to get all users
app.get("/users", function (request, response) {
  console.log("Getting all users");
  mongodb.collection("users").find({}).toArray(function (err, items) {
    if (err) {
      response.status(500).send(err);
    } else {
      response.send({ success: true, users: items });
    }
  });

});

// Service to update user password
app.put("/users/password", function (request, response) {
  console.log("Updating user");
  mongodb.collection("users").update({ _id: new ObjectId(request.body.id) }, { $set: { password: request.body.password } }, function (err, items) {
    if (err) {
      response.status(500).send(err);
    } else {
      response.send({ success: true });
    }
  });



});

// Service to get all test
app.get("/test", function (request, response) {
  console.log("Getting all test");
  mongodb.collection("testcol").find({}).toArray(function (err, items) {
    if (err) {
      response.status(500).send(err);
    } else {
      response.send({ success: true, items: items });
    }
  });

});

//Service to refresh WA token
app.get("/watoken", function (req, response) {

  var headers = {
    'accept': 'application/json',
    'X-IBM-Client-Id': '273ce84f-1005-4deb-8c32-84ec85075821',
    'X-IBM-Client-Secret': 'G2aR0bM2uJ0kJ0sM1lM4gE1iB8hB6pU0nH4oO4tO6lG7nN1hM8'
  }

  var form = {
    grant_type: 'refresh_token',
    refresh_token: 'nadYI1+pPAVuHlisshMjS/J8XWC8eMdcHP65OPqt/OX2jUF5ECgU3c+rni+ZtHtNlxtZhIC9pLSJhchMLHGbzES1BuCouxTlw1gKTpR3HcvCyDdtqWauIIvaXg4IVQzDvWJKuFH2ufjvxbJEua9XlFb5ssA/k/tRQzKAoiSrN+zS85Vyjz/9Jyes0QygZiGUX1IuQNOhUtnScJm7ArEjMunRFtnUwir4qqq8odew6oENAqLeXokqZ/Qqpet+webaQAUQHy6wy0uUoPYhawXHx1IurtX7eCCr0Q+InXwDGF5Ef0GXjotDAA'
  }

  request.post({ url: 'https://api.ibm.com/watsonanalytics/run/oauth2/v1/token', formData: form, headers: headers }, function (err, httpResponse, bodyx) {

    response.send(JSON.parse(bodyx).access_token)
  });

});

//---------------------- Slack services

// Service to execute an action
app.post("/slack/interact", function (request, response) {
  console.log("Interactive message action");
  console.log(JSON.stringify(request.body));

  let payload = JSON.parse(request.body.payload);
  let mess = payload.original_message;
  if (payload.actions[0].value == 'incident') {
    delete mess.attachments[0].actions;
    response.send(mess);
  } else {
    response.send("OK");
  }
});

//----------------------------------


// Service to check if server is alive
app.get("/server", function (request, response) {

  response.send("Server Alive");

});


app.listen(app.get('port'), function () {
  console.log('listening to Port', app.get('port'));
});
