
const audience = require('../models/audience');

class Audience{
    getPersona(req, res, next){
        audience.find({}, (err, docs)=>{
            res.json({
                status_code : 200,
                messages : "Success get persona audience",
                results : docs 
            })
        })
    }

    getSchedulePersona(req, res, next) {
        audience.find({}, (err, docs) => {
            var persona_schedule = []

            docs.map(e => {
                persona_schedule.push({
                    cluster_name: e.cluster_name,
                    active_time: e.behaviour.active_time
                })
            })
            
            res.json({
                status_code: 200,
                messages: "Success get Schedule Persona",
                results: persona_schedule
            })
        })
    }

    getPersonaId(req, res, next){
        audience.find({"cluster_number" : req.params.persona_id}, (err, docs)=>{
            res.json({
                status_code : 200,
                messages : "Success get persona audience",
                results : docs 
            })
        })
    }
}

module.exports = new Audience();