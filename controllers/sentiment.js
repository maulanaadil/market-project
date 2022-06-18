const request = require('request');
const Twit = require('twit');
/**
 * 
 * mention digunakan untuk melakukan analisis sentimen dari mention yang dikirim ke user/pengguna yang login
 */
exports.mentions = (req,res,ext) =>{
    const T = new Twit({
        consumer_key: process.env.TWITTER_KEY,
        consumer_secret: process.env.TWITTER_SECRET,
        access_token: req.user.tokens.accessToken,
        access_token_secret: req.user.tokens.tokenSecret,
    });

    T.get('statuses/mentions_timeline',{count:200},
    (err,mention,response)=>{
        if(err)
            console.log(err)

        var Tweet = [];
        mention.map(tweet=>{
            Tweet.push({
                Tweet : tweet.text,
                Label : ''
            });
        });
         const posting =  JSON.stringify({
                     "Inputs": {
                        "input1": Tweet
                      },
                    "GlobalParameters": {}
            });

        //kirim tweet mention ke Azure ML
        var categorys = request({
        url: 'https://asiasoutheast.services.azureml.net/subscriptions/7a38336d77ae429085b6d8af7c3b5eeb/services/659fde210c144dadba90d67bc22cb27a/execute?api-version=2.0&format=swagger', //URL to hit
        method: 'POST',
         headers: {
            'Content-Type': 'application/json',
            'Authorization':'Bearer genpswgJfhwA1jw45nF92Abi6N/grBgdWUDG6sBJwAFKpN3XgjLqnBAjD8QJyC6oBZXWfwyZDW+8gijB2/jy4w=='
         },
        body:posting
         }, function(error, response, body){
        if(error) {
           console.log(error);
        }
        //hasil response dari azure ML di rata2 in yang positif dan negatif
        let positive = 0;
        let negative = 0;
        let bodies = JSON.parse(body);
        console.log(bodies);
        let cats = bodies.Results.output1;
         cats.forEach(function(category){
            //console.log(category['Scored Labels'] );
            if(category['Scored Labels'] === 'Negatif'){
                negative++;
            }else if(category['Scored Labels'] === 'Positif'){
                positive++;
            }
         });
         res.json({positif : positive,negatif : negative});
      });
    });

};
