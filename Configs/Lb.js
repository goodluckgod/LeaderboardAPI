
const Leaderboard = require('../Modules/Leaderboard');
require('dotenv').config();

const redis = require('redis');

const client = redis.createClient({
  url: `redis://default:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
})

client.on('connect', function() {
  console.log('Redis connected');
});

client.on('error', function(err) {
  console.log('Something went wrong ' + err);
});

const Board = new Leaderboard('Panteon', {pageSize: process.env.USER_PER_PAGE}, client);


Board.rmAll = function(cb) {
    Board.rmAllIn(cb);
};
  
Board.rmAllIn = function(cb) {
    Board.redis.flushdb(cb);
};

Board.total = function(cb) {
    Board.totalIn(Board.name, cb);
};
  
Board.totalIn = function(name, cb) {
    Board.redis.zcard(name, cb);
};

Board.unionY = function(cb) {
  Board.unionYIn(Board.name, cb);
};

Board.unionYIn = function(name, cb) {
  Board.redis.ZUNIONSTORE('yesterday', 1, name, cb);
};

Board.rankY = function(member, cb) {
  this.rankIn('yesterday', member, cb);
};

Board.rankYIn = function(name, member, cb) {
  var req = [name, member];

  if (this.reverse) {
    this.redis.zrank(req, res);
  } else {
    this.redis.zrevrank(req, res);
  }

  function res(err, rank) {
    if (err) return cb(err);
    if (rank === null)
      cb(null, -1);
    else
      cb(null, +rank);
  }
};

Board.list = function(page, cb) {
    Board.listIn(Board.name, page, cb);
};
  
Board.listIn = function(name, page, cb, pageSize) {
    if (typeof(cb) === 'undefined' && page instanceof Function) {
      cb = page;
    }
    if (typeof(page) === 'undefined' || page instanceof Function) {
      page = 0;
    }
  
    var req = [
      name
    , page * Board.pageSize
    , page * Board.pageSize + Board.pageSize - 1
    , 'WITHSCORES'
    ];
  
    if (Board.reverse) {
        Board.redis.zrange(req, res);
    } else {
        Board.redis.zrevrange(req, res);
    }
  
    function res(err, range) {
      if (err) return cb(err);
      
      var list = [], l = range.length;
  
      for (var i = 0; i < l; i += 2) {
          list.push({
            'member': range[i]
          , 'score': range[i+1]
          , 'rank': list.length + 1
          });
      }
  
      cb(null, list);
    }
};

module.exports = {
    Board,
};