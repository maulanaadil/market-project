const audience = require('../models/keywords');

class Keyword{
    searchKeywords(req, res, next){
        audience.find({keyword : req.body.keyword}, (err, docs)=>{
            res.json({
                status_code : 200,
                messages : "Success get keywords",
                results : docs 
            })
        })
    }
}

module.exports = new Keyword();