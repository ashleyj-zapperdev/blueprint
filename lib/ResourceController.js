var util = require ('util')
  ;

var BaseController = require ('./BaseController')
  , HttpError      = require ('./errors/HttpError')
  ;

function ResourceController (opts) {
  BaseController.call (this);

  opts = opts || {};

  if (!opts.model)
    throw new Error ('Options must define model property');

  if (!opts.id)
    throw new Error ('Options must define id property');

  this._id = opts.id;
  this._model = opts.model;
}

util.inherits (ResourceController, BaseController);

ResourceController.prototype.getAll = function () {
  var self = this;

  return function __blueprint_getall (req, res) {
    self._model.find ({}, '-__v', function (err, results) {
      if (err) return res.status (500).json ({error: 'Failed to get all resources'});

      return res.status (200).json (results);
    });
  };
};

ResourceController.prototype.create = function () {
  var self = this;

  return function __blueprint_create (req, res) {
    self._model.create (req.body, function (err, model) {
      if (err) return res.status (400).json ({error: 'Failed to create resource'});
      if (!model) return res.status (400).json ({error: 'Failed to create resource'});

      return res.status (200).json ({_id: model.id});
    });
  };
};

ResourceController.prototype.get = function () {
  var self = this;

  return {
    validate: function (req, callback) {
      if (!req[self._id])
        return callback (new HttpError (400, 'Missing resource id'));

      return callback ();
    },
    execute: function __blueprint_get (req, res) {
      var rcId = req[self._id];

      self._model.findById (rcId, '-__v', function (err, result) {
        if (err) return res.status (500).json ({error: 'Failed to get resource'});
        if (!result) return res.status (404).json ({error: 'Resource does not exist'});

        return res.status (200).json (result);
      });
    }
  };
};

ResourceController.prototype.update = function () {
  var self = this;

  return {
    validate: function (req, callback) {
      if (!req[self._id])
        return callback (new HttpError (400, 'Missing resource id'));

      return callback ();
    },
    execute: function __blueprint_update (req, res) {
      var id = req[self._id];

      self._model.findByIdAndUpdate (id, { $set: req.body }, function (err, result) {
        if (err) return res.status (400).json ({error: 'Failed to update resource'});
        if (!result) return res.status (404).json ({error: 'Resource does not exist'});

        return res.status (200).json (true);
      });
    }
  };
};

ResourceController.prototype.delete = function () {
  var self = this;

  return {
    validate: function (req, callback) {
      if (!req[self._id])
        return callback (new HttpError (400, 'Missing resource id'));

      return callback ();
    },
    execute: function __blueprint_delete (req, res) {
      var rcId = req[self._id];

      self._model.findByIdAndRemove (rcId, function (err, result) {
        if (err) return res.status (500).json ({error: 'Failed to delete resource'});
        if (!result) return res.status (404).json ({error: 'Resource does not exist'});

        return res.status (200).json (true);
      });
    }
  };
};

module.exports = exports = ResourceController;