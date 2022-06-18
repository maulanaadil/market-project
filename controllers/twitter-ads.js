const async = require('async');
const TwitterAdsAPI = require('twitter-ads');

class TwitterAds{
    createAds(req, res, next){
        const Ts = new TwitterAdsAPI({
            consumer_key: process.env.TWITTER_KEY,
            consumer_secret: process.env.TWITTER_SECRET,
            access_token: req.user.tokens.accessToken,
            access_token_secret: req.user.tokens.tokenSecret,
            sandbox: true, // defaults to true
            api_version: '4' //defaults to 2
          });
          const T = new TwitterAdsAPI({
            consumer_key: process.env.TWITTER_KEY,
            consumer_secret: process.env.TWITTER_SECRET,
            access_token: req.user.tokens.accessToken,
            access_token_secret: req.user.tokens.tokenSecret,
            sandbox: false, // defaults to true
            api_version: '4' //defaults to 2
          });

        const account_id_ads= req.user.twitterAds[0].id;
        const account_id_sandbox = req.user.twitter_sandbox[0].id;
        T.get('/accounts/', (err, twitter, response) => {
            if(err){
              console.log(err);
            }else{
                console.log('masook pak ekoo')
                res.json(response);
            }
        });
       
        async.waterfall([
            (callback) => {
                //set funding instrument twitter ads
                // const params = {
                //     currency : 'IDR',
                //     start_time : req.body.start_time,
                //     end_time : req.body.end_time,
                //     type : 'CREDIT_CARD',
                // }
                // T.post(`/accounts/${account_id}/funding_instruments`, params,(err, twitter, response) => {
                //     console.log(response);
                // });
                callback(null, 'nfn38');
            },
            (funding, callback)=>{
                //set campaign
                const params = {
                    funding_instrument_id : funding,
                    name : 'test campaign',
                    start_time : '2018-09-17T17:00:00Z',
                    end_time : '2018-09-30T17:00:00Z',
                    total_budget_amount_local_micro : 1000000,
                    daily_budget_amount_local_micro : 0,
                    entity_status : 'PAUSED'
                }
                T.post(`/accounts/${account_id_ads}/campaigns`, params,(err, twitter, response) => {
                    callback(null, funding, response.data );
                });
            },
            (funding, campaign, callback)=>{
                //set line items
                const params = {
                    campaign_id : campaign,
                    objective : 'TWEET_ENGAGEMENTS',
                    placements : 'ALL_ON_TWITTER',
                    product_type : 'PROMOTED_TWEETS',
                    bid_amount_local_micro : 0,
                    bid_type : 'AUTO',
                    start_time : '2018-09-17T17:00:00Z',
                    end_time : '2018-09-19T17:00:00Z',
                    entity_status : 'PAUSED',
                    optimization : 'DEFAULT',
                    total_budget_amount_local_micro : 1000000
                }
                T.post(`/accounts/${account_id_ads}/line_items`, params,(err, twitter, response) => {
                    callback(null, funding, campaign,response.data );
                });
            },
            (funding, campaign, lineitem, callback)=>{
                //set targeting
                const params = {
                    line_item_id : lineitem,
                    targeting_type : 'INTEREST',
                    targeting_value : 'technology',
                }
                T.post(`/accounts/${account_id_ads}/line_items`, params,(err, twitter, response) => {
                    callback(null, funding, campaign,response.data );
                });
            },
           (funding, campaign, lineitem, callback)=>{
                //set tweet to be promoted
                const params = {
                    line_item_id : lineitem,
                    tweet_ids : 'tweet_id'
                }
                T.post(`/accounts/${account_id_ads}/promoted_tweets`, params,(err, twitter, response) => {
                    callback(null, funding, campaign,response.data );
                });
           }
        ], (err, results) => {
            
        });
    }

    suggestTargeting(req, res, next){
        const T = new TwitterAdsAPI({
            consumer_key: process.env.TWITTER_KEY,
            consumer_secret: process.env.TWITTER_SECRET,
            access_token: req.user.tokens.accessToken,
            access_token_secret: req.user.tokens.tokenSecret,
            sandbox: false, // defaults to true
            api_version: '4' //defaults to 2
          });

          const params = {
            count : 20,
            q : req.query.q
          }
          T.get(`/targeting_criteria/interests`, params,(err, twitter, response) => {
           console.log(response);

           res.json(response);
        });
    }
}

module.exports = new TwitterAds();