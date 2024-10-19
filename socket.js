let io;

module.exports = {
    init: httpServer => {
        io = require('socket.io')(httpServer,{
            cors: {
              origin: "*"
            }
          });
        return io
    },
    getIo: () => {
        return io
    }
}