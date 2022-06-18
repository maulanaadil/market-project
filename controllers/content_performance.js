const content = require('../models/content_performance');

class ContentPerformance{
    getContent(req, res, next){
        content.find({}, (err, docs)=>{
            res.json({
                status_code : 200,
                messages : "Success get content",
                results : docs 
            })
        })
    }
    getContentId(req, res, next){
        content.find({tweet_id : req.params.id}, (err, docs)=>{
            res.json({
                status_code : 200,
                messages : "Success get content",
                results : docs 
            })
        })
    }
}

module.exports = new ContentPerformance();