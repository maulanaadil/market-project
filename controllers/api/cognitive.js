const request = require('request');
const multer = require('multer');
const fs = require('fs');
const FormData = require('form-data');
exports.getPhotoScore = (req, res, next) => {
    var buf = new Buffer(req.body.image, 'base64'); // decode
    res.json(buf);
}
exports.computerVision = (req, res, next) => {
    var storage = multer.diskStorage({
        filename: function (req, file, callback) {
            callback(null, file.originalname);
        }
    });
    var upload = multer({
        storage: storage
    }).single('image');
    upload(req, res, function (err) {
        if (err)
            console.log(err);
        var params = {
            "visualFeatures": "Description, Categories, Tags, Color",
        };
        var b64content = fs.readFileSync(req.file.path, {
            encoding: 'base64'
        });

        var fd = new FormData();
        fd.append("body", fs.createReadStream(req.file.path));
        request({
            url: 'https://southeastasia.api.cognitive.microsoft.com/vision/v1.0/analyze', //URL to hit
            qs: params, //Query string data
            method: 'POST',
            headers: {
                'Ocp-Apim-Subscription-Key': 'c7d048e841104952a71985fbe320eb57',
                'Content-Type': "application/octet-stream"
            },
            body: fs.createReadStream(req.file.path)
        }, function (error, response, body) {
            if (error) {
                console.log("IMAGE " + error);
            } else {
                var datas = {
                    status_code: 200,
                    messages: 'success',
                    body: JSON.parse(body)
                };
                console.log("IMAGE " + body);
                res.json(datas);
            }
        });
    });
};

exports.textAnalyze = (req, res, next) => {
    var params = {
        // Request parameters
    };
    var text = req.body.text;
    var documents = [{
        "language": "en",
        "id": "1",
        "text": text
    }];
    request({
        url: "https://southeastasia.api.cognitive.microsoft.com/text/analytics/v2.0/sentiment",
        qs: params,
        headers: {
            // Request headers
            "Content-Type": "application/json",
            "Ocp-Apim-Subscription-Key": "a6e213f02315441f95907b2776bf097b"
        },
        method: "POST",
        // Request body
        body: JSON.stringify({
            documents: documents
        }),
    }, function (err, response, body) {
        console.log(body);
        var data = JSON.parse(body);
        // var nilai;
        // var notes;

        console.log(data);
        if (err) {
            console.log(error);
        } else {
            var datas = {
                status_code: 200,
                messages: 'success',
                body: JSON.parse(body)
            };
            console.log("SENTIMENT " + body);
            res.json(datas);
        }
        // nilai = 'Tweet Score '+ (data.documents[0].score * 100).toFixed(1) +'/100';
        // var count = (data.documents[0].score * 100).toFixed(1);
        // if (count >= 80) {
        //     notes = 'Very Good Post';
        // } else if ((count < 80) && (count >= 60)) {
        //     notes = 'Good Post'
        // } else if ((count < 60) && (count >= 40)) {
        //     notes = 'Fair Post';
        // } else {
        //     notes = 'Poor Post';
        // }

        // res.json({
        //     status_code: 201,
        //     message: 'Success analyze text',
        //     data: {
        //         score: count,
        //         note: notes
        //     }
        // });
    });
};

exports.typoAnalyze = (req, res, next) => {
    var text = req.body.text;
    request({
        url: "https://api.cognitive.microsoft.com/bing/v7.0/spellcheck",
        headers: {
            // Request headers
            "Content-Type": "application/x-www-form-urlencoded",
            "Ocp-Apim-Subscription-Key": "de9e3127e6b8440d892aaab2d8301f28"
        },
        method: "POST",
        // Request body
        form: {
            text: text
        }
    }, function (err, response, body) {
        var data = JSON.parse(body);
        console.log("TYPO " + data);

        var typoCount = data.flaggedTokens.length;
        res.json({
            status_code: 201,
            message: 'Success analyze typo',
            body: {
                count: typoCount,
            }
        });
    });
};

exports.translatorAnalyze = (req, res, next) => {
    let get_guid = function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };
    var text = [{
        "text": req.body.text
    }];
    request({
        url: "https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=id",
        headers: {
            // Request headers
            "Content-Type": "application/json",
            "Ocp-Apim-Subscription-Key": "9bed3143d7084f1e8f149e1aa270b716",
            'X-ClientTraceId': get_guid()
        },
        method: "POST",
        // Request body
        body: JSON.stringify([{
            text: req.body.text
        }]),
    }, function (err, response, body) {
        var data = JSON.parse(body);
        console.log(data);
        var datas = {
            status_code: 200,
            messages: 'success',
            body: JSON.parse(body)
        };
        console.log("TRANSLATE " + body);
        res.json(datas);
    });
};