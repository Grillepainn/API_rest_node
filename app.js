const express = require('express')
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./assets/swagger.json');
const morgan = require('morgan')('dev')
const config = require('./assets/config.json')
const mysql = require('promise-mysql')
const app = express()
const bodyParser = require('body-parser')

mysql.createConnection({
    host: config.db.host,
    database: config.db.database,
    user: config.db.user,
    password: config.db.password
}).then((db) => {
    console.log('Connected')
    const app = express();
    

        let MembersRouter = express.Router();
        app.use(config.rootAPI+'api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

        app.use(morgan)
        app.use(bodyParser.json()) 
        app.use(bodyParser.urlencoded({ extended: true })) 
        
        MembersRouter.route('/:id')
        // Récupère un membre avec son id
                .get(async(req, res) => {
                    let member = await Members.getById(req.params.id)
                    res.json(checkAndChange(member))
                })
            
        // Supprime un membre avec son id
                .delete(async(req, res) => {

                    let deleteMember = await Members.delete(req.params.id) 
                    res.json(checkAndChange(deleteMember))
                    })
        
        MembersRouter.route('/')
        // Récupère tous les membres
                .get(async(req, res) => {
                   let allmembers = await Members.getAll(req.query.max)
                   res.json(checkAndChange(allmembers))
                })
        // Ajoute un membre
                .post(async(req, res) => {
                    let addMember = await Members.add(req.body.name)
                    res.json(checkAndChange(addMember))
                })
        
        
        
        app.listen(config.port, () => console.log('Started on port 8080'))
        
        app.use(config.rootAPI+'members', MembersRouter)
}).catch((err) => {
    console.log('Error database connection')
    console.log(err.message)
})

success = function success(result) {
    return {
        status: "success",
        result: result
    }
}

error = function error(message) {
    return {
        status: "error",
        message: message
    }
}

isErr = (err) => {
    return err instanceof Error;
}

checkAndChange = (obj) => {
    if (isErr(obj)) {
        return error(obj.message)
    } else {
        return success(obj)
    }
}
