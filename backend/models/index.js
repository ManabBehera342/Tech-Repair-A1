/**
 * Models Index File
 * Centralized export of all database models
 */

const User = require('./User');
const Request = require('./Request');
const Project = require('./Project');
const Device = require('./Device');

module.exports = {
  User,
  Request,
  Project,
  Device
};