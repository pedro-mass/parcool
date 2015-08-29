'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Carpool = mongoose.model('Carpool'),
	_ = require('lodash');

/**
 * Create a Carpool
 */
exports.create = function(req, res) {
	var carpool = new Carpool(req.body);
	carpool.user = req.user;

	carpool.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(carpool);
		}
	});
};

/**
 * Show the current Carpool
 */
exports.read = function(req, res) {
	res.jsonp(req.carpool);
};

/**
 * Update a Carpool
 */
exports.update = function(req, res) {
	var carpool = req.carpool ;

	carpool = _.extend(carpool , req.body);

	carpool.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(carpool);
		}
	});
};

/**
 * Delete an Carpool
 */
exports.delete = function(req, res) {
	var carpool = req.carpool ;

	carpool.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(carpool);
		}
	});
};

/**
 * List of Carpools
 */
exports.list = function(req, res) { 
	Carpool.find( {

	}).sort('departureTime').populate('user', 'displayName').exec(function(err, carpools) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(carpools);
		}
	});
};

/**
 * Carpool middleware
 */
exports.carpoolByID = function(req, res, next, id) { 
	Carpool.findById(id).populate('user', 'displayName').exec(function(err, carpool) {
		if (err) return next(err);
		if (! carpool) return next(new Error('Failed to load Carpool ' + id));
		req.carpool = carpool ;
		next();
	});
};

/**
 * Carpool authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.carpool.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
