'use strict';

/**
 * Module dependencies.
 */

const express =      require('express');
const cookieParser = require('cookie-parser');
const cors =         require('cors');
let path   =         require('path');
let helmet =         require('helmet');
let logger =         require('morgan');
let config =         require('./index');
const bodyParser =   require('body-parser');

module.exports = function (app, passport) {

    const corsOpt = {
        origin: ['http://localhost:4200', 'http://localhost:443', 'http://192.168.1.39:4200', 'http://platform.sardcoin.eu'],
        credentials: true,
        methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'], // to works well with web app, OPTIONS is required
        allowedHeaders: ['Content-Type', 'Authorization'], // allow json and token in the headers,
        AccessControlAllowOrigin: '*',
    };

    // use bodyParser
    app.use(bodyParser.json());

    // use passport
    app.use(passport.initialize());
    app.use(passport.session());

    // use helmet
    app.use(helmet());

    // view engine setup
    app.set('views', config.root + '/views');
    app.set('view engine', 'jade');

    app.use(logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded({extended: false}));
    app.use(cookieParser());
    app.use(express.static(config.root + '/public'));
    app.use(express.static(config.root + '/media/images'));
    app.use(express.static(config.root + '/apidoc'));

    // enabling cors
    app.use(cors(corsOpt)); // cors for all the routes of the application
    app.options('*', cors(corsOpt)); // automatic cors gen for HTTP verbs in all routes, This can be redundant but I kept to be sure that will always work.
    //app.use(cors());

};