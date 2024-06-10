import Bot from '../models/bot.model.js';
import createError from 'http-errors';
export default {
    getAll : async (req, res, next) => {
        try {
            let bots = await Bot.bots();
            res.json({'bots' : bots});
        } catch (error) {
            next(error)
        }   
        
    },
    create : async (req, res, next) => {
        try {
            let name = req.body.name;
            let location = req.body.location;
            let status = req.body.status;

            let bot = {
                name : name,
                location : location,
                status : status
            }

            let newBot = await Bot.create(bot);
            
            if (newBot.affectedRows == 1) {
                let nBot = await Bot.find(newBot.insertId);
                res.json({'bot' : nBot[0]});
            } else {
                throw createError.BadRequest();
            }
        } catch (error) {
            next(error);
        }
    },
    delete : async (req, res, next) => {
        try {
            var id = req.params['id']; 

            let newBot = await Bot.update(id);
            
            if (newBot.affectedRows == 1) {
                res.json({'message' : 'Bot deleted successfully'});
            } else {
                throw createError.BadRequest();
            }
        } catch (error) {
            next(error);
        }
    },
    update : async (req, res, next) => {
        try {
            var id = req.params['id']; 

            let name = req.body.name;
            let location = req.body.location;
            let status = req.body.status || 1;

            let bot = {
                status: status,
                name: name,
                location : location
            }
            let updateBot = await Bot.update(bot, id);
            
            if (updateBot.affectedRows == 1) {
                res.json({'message' : 'Bot update successfully'});
            } else {
                throw createError.BadRequest();
            }
        } catch (error) {
            next(error);
        }
    },

}