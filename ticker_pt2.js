var http = require('http');
var url = require('url');
const MongoClient = require('mongodb').MongoClient;
const MongoURL = "mongodb+srv://dbUser:dbUser@ticking.swchu4g.mongodb.net/?appName=Ticking";
const PORT = process.env.PORT || 3000;

MongoClient.connect(MongoURL, function(err, db) {
    // Error handling
    if(err) { return console.log(err); }

    // Accessing the database
    var dbo = db.db("Stock");
    var coll = dbo.collection('PublicCompanies');
    
    http.createServer(function (req, res) {
        // Set up server and get url info
        res.writeHead(200, {'Content-Type': 'text/html'});
        let theURL = url.parse(req.url, true);
        let pathname = theURL.pathname;
        let query = theURL.query;

        if (pathname != "/process") {
            // Make a form for the user to input information
            res.write(
                `<!doctype html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <title>Stock Search</title>
                </head>
                <body>
                    <h1>Stock Form</h1>
                    <form method="get" action="/process">
                        <label>Are you inputting a stock ticker or company name?</label><br/>
                            <label>
                                <input type="radio" id="ticker" name="type" value="ticker" checked> Stock Ticker
                            </label><br/>
                            <label>
                                <input type="radio" id="name" name="type" value="name"> Company Name
                            </label><br/><br/>

                            <label>
                                Input Stock Ticker or Company Name Here: <input type="text" id="input" name="input" required>
                            </label><br/><br/>

                        <input type="submit" value="View Results">
                    </form>
                </body>
                </html>`
            )
        } else {
            // Get info from Mongo
            var userInput = query.input;
            var type = query.type;

            var MongoQuery;
            if (type == "ticker") {
                MongoQuery = { ticker: userInput.toUpperCase() };
            } else {
                MongoQuery = { name: userInput };
            }

            // Display results of info from Mongo
            results = coll.find(MongoQuery).toArray(function(err, results) {
                if (err) {
                    res.end("Database error: " + err);
                    return;
                }
                res.write(`
                    <!doctype html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <title>Stock Search</title>
                    </head>
                    <body>
                        <h1>Search Results</h1>
                        <h2>User Inputs:</h2>
                        <p>Inputted Query: ${userInput}</p><br/>
                        <p>Type of Search: ${type}</p><br/><br/>
                `);
                if (results.length > 0) {
                res.write("<p>We found results for your query. Wow!</p><br/><br/>");
                res.write("<ul>");
                    results.forEach(thingie => {
                        res.write(`<li>${thingie.name}, ${thingie.ticker}, ${thingie.price}</li>`)
                    })
                    res.write("</ul>");
                } else {
                    res.write("<p>We found no results for your query. Sorry!</p>");
                }
                res.write(`
                    </body>
                    </html>
                `);
                res.end();
            });
        }
    }).listen(PORT, () => {
        console.log("Server running on port " + PORT);
    });
});
