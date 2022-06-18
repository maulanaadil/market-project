const request = require('request');

exports.tweetClassification = (req, res, next) => {
    var tweet = req.body.text;
    var category = "";
    const posting = JSON.stringify({
        "Inputs": {
            "input1": [{
                'categoryName': "",
                'tweet': tweet,
            }]
        },
        "GlobalParameters": {}
    });

    request({
        url: 'https://asiasoutheast.services.azureml.net/subscriptions/7a38336d77ae429085b6d8af7c3b5eeb/services/cb93407f21d84ecea1e837f3a5ee72ce/execute?api-version=2.0&format=swagger', //URL to hit
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer 5R1krCG6+TvPBvh75/9KrTkfLpDTfy7jS7V8hVPmlEs2LNVUK8N511Ppu34+v48iPsghPLzQCP4gSCwuU+lOjQ=='
        },
        body: posting
    }, function (error, response, body) {
        if (error) {
            console.log('error gan di request');
        } else {
            let data = JSON.parse(body);
            console.log("AZURE CLASSIFICATION " + JSON.stringify(data));
            let cats = data.Results.output1;
            var category = "";
            cats.forEach(function (label) {
                category = label['Scored Labels'];
            });
            res.json({
                status_code: 201,
                message: 'Success tweet classification',
                data: {
                    label: category
                }
            });
        }
    });
}