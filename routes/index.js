import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';

const express = require('express');

const route = express.Router();

route.get('/status', AppController.getStatus);
route.get('/stats', AppController.getStats);
route.post('/users', UsersController.postNew);

export default route;
