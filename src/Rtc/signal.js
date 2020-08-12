/**
 * DDP.JS 2.1.0
 */

import EventEmitter from 'wolfy87-eventemitter';
import Queue from './queue';
import Socket from './socket';

const PUBLIC_EVENTS = [
  // Subscription messages
  'ready',
  'nosub',
  'added',
  'changed',
  'removed',
  // Method messages
  'result',
  'updated',
  // Error messages
  'error',
];
const DEFAULT_RECONNECT_INTERVAL = 10000;

export default class Signal extends EventEmitter {
  emit() {
    setTimeout(super.emit.bind(this, ...arguments), 0);
  }

  constructor(options) {
    super();

    this.status = 'disconnected';

    // Default `autoConnect` and `autoReconnect` to true
    this.autoConnect = options.autoConnect !== false;
    this.autoReconnect = options.autoReconnect !== false;
    this.reconnectInterval =
      options.reconnectInterval || DEFAULT_RECONNECT_INTERVAL;

    this.messageQueue = new Queue(message => {
      if (this.status === 'connected') {
        this.socket.send(message);
        return true;
      } else {
        return false;
      }
    });

    this.socket = new Socket(WebSocket, options.endpoint);
    console.log("create new Signal ednpoint " + options.endpoint);

    this.socket.on('open', () => {
      // When the socket opens, send the `connect` message
      // to establish the DDP connection
      console.log("sfuconnect on open");
    });

    this.socket.on('close', () => {
      this.status = 'disconnected';
      this.messageQueue.empty();
      console.log("sfuconnect on close");
      this.emit('disconnected');
      if (this.autoReconnect) {
        // Schedule a reconnection
        setTimeout(this.socket.open.bind(this.socket), this.reconnectInterval);
      }
    });

    this.socket.on('message:in', message => {
      if (message.id === 'ping') {
        // Reply with a `pong` message to prevent the server from
        // closing the connection
        this.socket.send({ id: 'pong'});
      }else if(message.id === 'pong'){

      }
      else {
        console.log("sfuconnect receive message " + JSON.stringify(message));
        this.emit("signalMessage", message);
      }
    });

    if (this.autoConnect) {
      this.connect();
    }
  }

  connect() {
    this.socket.open();
  }

  disconnect() {
    /*
        *   If `disconnect` is called, the caller likely doesn't want the
        *   the instance to try to auto-reconnect. Therefore we set the
        *   `autoReconnect` flag to false.
        */
    this.autoReconnect = false;
    this.socket.close();
  }

  send(object){
    console.log("sfuconnect send message " + JSON.stringify(object));
    this.socket.send(object);
  }




  //send('id')
}
