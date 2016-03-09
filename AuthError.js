module.exports = function (message) {
  this.name = 'AuthError';
  this.message = message || 'SIS Server login authentication failed';
  this.stack = (new Error()).stack;
}
