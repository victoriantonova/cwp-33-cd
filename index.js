const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const { Ability, AbilityBuilder, ForbiddenError } = require('casl');

const context = require('./data');
const insertData = require('./data/insert-data');
const apiRouter = require('./routes');

insertData(context);

const app = express(http);

app.use(morgan('dev'));

app.use(bodyParser.json({ type: 'application/json' }));

app.use('/api', (req, res, next) => {
    const { rules, can, cannot } = AbilityBuilder.extract();
    const role = req.query.role || req.body.role ||'guest';

    console.log(`Current role = ${role}`);  

    if (role === 'guest') {
        can('read', 'all');
    }

    if (role === 'member') {
        can('read', 'all');
        can('create', 'Repo');
        can('update', 'Repo', { author: req.query.author });
        can(['create', 'update'], 'Commit');
    }

    if (role === 'moderator') {
        can('read', 'all');
        can('update', ['Repo', 'Commit']);
        can('delete', ['Repo', 'Commit']);
    }

    req.ability = new Ability(rules);

    next();
});

app.use('/api/', apiRouter);

app.use((error, req, res, next) => {
    if (error instanceof ForbiddenError) {
        res.status(403).send({ message: error.message })
    } else {
        res.send(error);
    }
});

app.set('port', (process.env.PORT || 4000));

//For avoidong Heroku $PORT error
app.get('/', function(request, response) {
    var result = 'App is running. Hello !'
    response.send(result);
}).listen(app.get('port'), function() {
    console.log('App is running, server is listening on port ', app.get('port'));
});