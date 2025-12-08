var http = require('http');
var url = require('url');
const MongoClient = require('mongodb').MongoClient;
const MongoURL = "mongodb+srv://dbUser:dbUser@ticking.swchu4g.mongodb.net/?appName=Ticking";
const PORT = process.env.PORT || 3000;

client = new MongoClient(MongoURL,{ useUnifiedTopology: true });
async function doit() {
    try {
        await client.connect();
        
        var dbo = client.db("Stock");
        var coll = dbo.collection('PublicCompanies');

        http.createServer(function (req, res) {
            // Set up server and get url info
            res.writeHead(200, {'Content-Type': 'text/html'});
            let theURL = url.parse(req.url, true);
            let pathname = theURL.pathname;
            let query = theURL.query;

            if (pathname.startsWith("/process")) {
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
                let results = coll.find(MongoQuery).toArray(function(err, results) {
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
                    if (results.length > 0 && userInput != "") {
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
            } else {
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
                        <form method="GET" action="/process">
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

                            <button type="submit">View Results</button>
                        </form>
                    </body>
                    </html>`
                )
            }
        }).listen(PORT, () => {
            console.log("Server running on port " + PORT);
        });
    }
    catch(err) {
        console.log("Database error: " + err);
    }
} //end doit

doit();
