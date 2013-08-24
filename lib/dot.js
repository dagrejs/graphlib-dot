var decode = require('./decode')
exports.parse = 
exports.decode = 
exports.toGraph = decode.toGraph

exports.toGraphArray = decode.toGraphArray
exports.toObjects = decode.toObjects

exports.encode =
exports.stringify = require('./encode')

//this makes graphlib-dot a valid levelup encoding.
exports.type = 'dot'
exports.buffer = false

