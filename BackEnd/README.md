# Structify Backend Server

This is the backend server for the Structify application, handling PvP coding challenges and real-time connections.

## Setup and Running the Server

### Installation

1. Make sure you have Node.js installed (v14+ recommended)
2. Install dependencies:
```
cd BackEnd
npm install
```

### Firebase Admin SDK Setup

For user deletion functionality to work, you need to set up Firebase Admin SDK:

1. Go to your Firebase Console
2. Navigate to Project Settings > Service Accounts
3. Click "Generate new private key"
4. Save the downloaded file as `serviceAccountKey.json` in the BackEnd directory
5. This file contains sensitive information - never commit it to version control

### Running the Server

```
node server.js
```

## Troubleshooting Connection Issues

If you experience connection issues with the PvP coding challenges, try the following solutions:

### Socket Connection Issues

1. **Server Restart Protocol**: If users are having trouble connecting to matches, follow this procedure:
   - Stop the server (Ctrl+C in the terminal)
   - Wait 5 seconds
   - Start the server again (`node server.js`)
   - Refresh the client application

2. **Socket Timeouts**: The server is configured to:
   - Clean up disconnected sockets after 10 minutes of inactivity
   - Wait for reconnection for 10 seconds after a disconnect
   - Perform a final cleanup after 2 minutes if no reconnection

3. **Heartbeat Mechanism**: The client sends heartbeats every 30 seconds to maintain connection. If this fails, the client will attempt to reconnect automatically.

### Common Issues and Solutions

#### Client Cannot Connect to Server

1. Verify the server is running
2. Check that the client is using the correct URL (http://localhost:3001)
3. Check for any CORS issues in the browser console
4. Ensure your firewall is not blocking the connection

#### Players Disconnect During Matches

1. Ensure stable internet connection
2. The system includes reconnect handling - disconnected players have up to 2 minutes to reconnect before the match is terminated
3. Players will see a notification if their opponent disconnects

#### Socket Memory Leaks

If the server becomes slow or unresponsive:

1. Restart the server using the protocol above
2. Make sure you're running the latest version of the code which includes memory leak fixes
3. The server has automatic cleanup mechanisms, but manual restart may be needed occasionally

## Developer Notes

- Socket connections are tracked in the `socketHandlers.js` file
- The server implements a central connection pool to prevent duplicated connections
- Socket IDs are used as unique identifiers for players in the matchmaking system
- We use Maps instead of Sets for better key-value lookup performance
