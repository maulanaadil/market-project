
const TrainingSet = require('../../models/Testing');

exports.datatest = (req, res, next)=>{
    TrainingSet.find({}, (err, docs)=>{
        if(err)
            console.log(err)

        res.render('data-latih', {data : docs});
    });
}