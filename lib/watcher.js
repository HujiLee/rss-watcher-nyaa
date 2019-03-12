
/*
 *
 * watcher.coffee
 *
 * Author:@nikezono
 *
 */

(function() {
  var EventEmitter, Watcher, fetchFeed, parser,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  EventEmitter = require('events').EventEmitter;

  parser = require('parse-rss');

  fetchFeed = (function(_this) {
    return function(feedUrl, callback) {
      return parser(feedUrl, function(err, articles) {
        if (err != null) {
          return callback(err, null);
        }
        articles.sort(function(a, b) {
          return a.pubDate / 1000 - b.pubDate / 1000;
        });
        return callback(null, articles);
      });
    };
  })(this);

  Watcher = (function(_super) {
    __extends(Watcher, _super);

    function Watcher(feedUrl) {
      this.stop = __bind(this.stop, this);
      this.run = __bind(this.run, this);
      this.isNewArticle = __bind(this.isNewArticle, this);
      this.updateLastPubArticle = __bind(this.updateLastPubArticle, this);
      if (!feedUrl || feedUrl === void 0) {
        throw new Error("arguments error.");
      }
      Watcher.__super__.constructor.call(this);
      this.feedUrl = feedUrl;
      this.interval = null;
      this.lastPubDate = null;
      this.lastPubTitles = [];
      this.timer = null;
      this.watch = (function(_this) {
        return function() {
          var fetch;
          fetch = function() {
            return fetchFeed(_this.feedUrl, function(err, articles) {
              var article, _i, _len, _results;
              if (err) {
                return _this.emit('error', err);
              }
              _results = [];
              for (_i = 0, _len = articles.length; _i < _len; _i++) {
                article = articles[_i];
                if (_this.isNewArticle(article)) {
                  _this.emit('new article', article);
                  _results.push(_this.updateLastPubArticle(article));
                } else {
                  _results.push(void 0);
                }
              }
              return _results;
            });
          };
          return setInterval(function() {
            return fetch(this.feedUrl);
          }, _this.interval * 1000);
        };
      })(this);
    }

    Watcher.prototype.set = function(obj) {
      var flag;
      flag = false;
      if (obj.feedUrl != null) {
        if (obj.feedUrl != null) {
          this.feedUrl = obj.feedUrl;
        }
        flag = true;
      }
      if (obj.interval != null) {
        if (obj.interval != null) {
          this.interval = obj.interval;
        }
        flag = true;
      }
      return flag;
    };

    Watcher.prototype.updateLastPubArticle = function(article) {
      var newPubDate;
      newPubDate = article.pubDate / 1000;
      if (this.lastPubDate === newPubDate) {
        this.lastPubTitles.push(article.title);
      } else {
        this.lastPubTitles = [article.title];
      }
      return this.lastPubDate = newPubDate;
    };

    Watcher.prototype.isNewArticle = function(article) {
      var _ref;
      return (this.lastPubDate === null && this.lastPubTitles.length === 0) || (this.lastPubDate <= article.pubDate / 1000 && (_ref = article.title, __indexOf.call(this.lastPubTitles, _ref) < 0));
    };

    Watcher.prototype.run = function(callback) {
      var initialize;
      initialize = (function(_this) {
        return function(callback) {
          return fetchFeed(_this.feedUrl, function(err, articles) {
            if ((err != null) && (callback != null)) {
              return callback(new Error(err), null);
            }
            _this.lastPubDate = articles[articles.length - 1].pubDate / 1000;
            _this.lastPubTitle = articles[articles.length - 1].title;
            _this.timer = _this.watch();
            if (callback != null) {
              return callback(null, articles);
            }
          });
        };
      })(this);
      if (!this.interval) {
        this.interval = 60 * 5;
      }
      return initialize(callback);
    };

    Watcher.prototype.stop = function() {
      if (!this.timer) {
        throw new Error("RSS-Watcher isnt running now");
      }
      clearInterval(this.timer);
      return this.emit('stop');
    };

    return Watcher;

  })(EventEmitter);

  module.exports = Watcher;

}).call(this);
