import * as signalR from '@microsoft/signalr';

let connection = null;

export const initializeSignalR = () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.warn('[SignalR] No token found, skipping connection');
    return null;
  }

  if (connection && connection.state === signalR.HubConnectionState.Connected) {
    console.log('[SignalR] Already connected');
    return connection;
  }

  connection = new signalR.HubConnectionBuilder()
    .withUrl('/hubs/notifications', {
      accessTokenFactory: () => token,
      transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling
    })
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Information)
    .build();

  connection.onreconnecting((error) => {
    console.warn('[SignalR] Reconnecting...', error);
  });

  connection.onreconnected((connectionId) => {
    console.log('[SignalR] Reconnected:', connectionId);
  });

  connection.onclose((error) => {
    console.error('[SignalR] Connection closed:', error);
  });

  connection.start()
    .then(() => {
      console.log('[SignalR] Connected successfully');
    })
    .catch((err) => {
      console.error('[SignalR] Connection Error:', err);
    });

  return connection;
};

export const getConnection = () => connection;

export { connection };

export default {
  initializeSignalR,
  getConnection
};
