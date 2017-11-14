'use strict';

const Ws = require('ws');
const internals = {
    clients: {},
    key: 100
};


internals.getClientBySocketId = function (socketId) {

    return internals.clients[socketId];
};


exports.register = (server, options, next) => {

    const noop = function () {};

    const createOptions = {
        host: options.host || 'localhost',
        port: options.port || 8080
    };

    const wus = new Ws.Server(createOptions);
    const onConnection = options.onConnection || noop;
    const onError = options.onError || noop;
    const onDisconnection = options.onDisconnection || noop;
    const onMessage = options.onMessage || noop;

    wus.on('connection', (socket) => {

        ++internals.key;
        socket.id = `${ createOptions.host }:${ createOptions.port }/${ internals.key }`;
        internals.clients[socket.id] = socket;

        socket.on('close', () => {
            delete internals.clients[socket.id];
            onDisconnection(socket);
        });

        socket.on('message', (message) => {
            onMessage(socket, message);
        });

        onConnection(socket);
    });

    wus.on('error', onError);

    server.expose('getClientBySocketId', internals.getClientBySocketId);

    return next();
};


exports.register.attributes = {
    pkg: require('../package.json')
};
