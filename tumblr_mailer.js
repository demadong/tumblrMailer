var fs = require('fs');
var ejs = require('ejs');
var csvFile = fs.readFileSync("friend_list.csv","utf8");
var emailTemplate = fs.readFileSync('email_template.html', 'utf-8');
var tumblr = require('tumblr.js');
var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('tt-HJutFhGWIi2A_F0g3Hw');

var client = tumblr.createClient({
  consumer_key: 'JMh664g63HYWdGzCy3gRUI3KEMwRjnKmz2DD8sXO97bvzIVEAy',
  consumer_secret: 'YASR4adafmD6ed8y67lFiTdSiYSZqluEiUliRWE2SYLd089CH3',
  token: 'ifnCQNoaUgde5IT8gpM7RfODFB0w00Qy2469qWDft4pQbxYjvI',
  token_secret: '7xcEnjdrcSQ11khnOJRwsI9moWIm7jRwsVVhuE1zXzAskf4B1N'
});

var sevenDays = 6.048e+8; //in milliseconds

var csvParse = function(data) {
	var csvParsed = [];
	var dataArr = data.split("\n");
	for (var i = 1; i < dataArr.length - 1; i++) {
		var csvObj = {
			firstName: dataArr[i].split(",")[0],
			lastName: dataArr[i].split(",")[1],
			numMonthsSinceContact: dataArr[i].split(",")[2],
			emailAddress: dataArr[i].split(",")[3],
		};

		csvParsed.push(csvObj);
	};
	return csvParsed;
}

function sendEmail(to_name, to_email, from_name, from_email, subject, message_html){
    var message = {
        "html": message_html,
        "subject": subject,
        "from_email": from_email,
        "from_name": from_name,
        "to": [{
                "email": to_email,
                "name": to_name
            }],
        "important": false,
        "track_opens": true,    
        "auto_html": false,
        "preserve_recipients": true,
        "merge": false,
        "tags": [
            "Fullstack_Tumblrmailer_Workshop"
        ]    
    };
    var async = false;
    var ip_pool = "Main Pool";
    mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool}, function(result) {
        // console.log(message);
        // console.log(result);   
    }, function(e) {
        // Mandrill returns the error as an object with name and message keys
        console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
        // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
    });
}

client.posts('matthewkim.tumblr.com', function(err, blog){
	var postsArray = [];
	for (var i = 0; i < blog.posts.length; i++) {
		if (Date.now() - (blog.posts[i].timestamp*1000) < sevenDays) {
			postsArray.push(blog.posts[i]);
		};
	};

	friendList = csvParse(csvFile);

	for (var i = 0; i < friendList.length; i++) {
		firstName = friendList[i].firstName;
		numMonthsSinceContact = friendList[i].numMonthsSinceContact;
		copyTemplate = emailTemplate;
		var customizedTemplate = ejs.render(copyTemplate, {
			firstName: firstName,
			numMonthsSinceContact: numMonthsSinceContact,
			latestPosts: postsArray
		});
		sendEmail(firstName, friendList[i].emailAddress, "Matthew", "matthewkim93@gmail.com", "testing", customizedTemplate);
	};
});

