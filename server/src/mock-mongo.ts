import * as net from 'net';
import * as bson from 'bson';

/**
 * Minimal in-process MongoDB wire-protocol server.
 * Handles the MongoDB driver handshake (hello / isMaster / ping / endSessions / saslSupportedMechs)
 * so Mongoose connects instantly in-memory.
 */
export class MockMongoServer {
  private server: net.Server | null = null;
  private port = 27018;

  async start(): Promise<string> {
    return new Promise((resolve) => {
      this.server = net.createServer((socket) => {
        let buffer = Buffer.alloc(0);

        socket.on('data', (chunk) => {
          buffer = Buffer.concat([buffer, chunk]);

          while (buffer.length >= 16) {
            const messageLength = buffer.readInt32LE(0);
            if (buffer.length < messageLength) break;

            const message = buffer.subarray(0, messageLength);
            buffer = buffer.subarray(messageLength);

            const requestId = message.readInt32LE(4);
            const opCode = message.readInt32LE(12);

            if (opCode === 2013) {
              // OP_MSG (MongoDB 3.6+)
              const flagBits = message.readUInt32LE(16);
              const sectionType = message.readUInt8(20);

              let doc: any = {};
              try {
                // Skip sectionType (1 byte)
                const payload = message.subarray(21);
                doc = bson.deserialize(payload);
              } catch {
                doc = {};
              }

              const responseDoc: any = {
                ok: 1,
                isWritablePrimary: true,
                ismaster: true,
                maxBsonObjectSize: 16777216,
                maxMessageSizeBytes: 48000000,
                maxWriteBatchSize: 100000,
                logicalSessionTimeoutMinutes: 30,
                minWireVersion: 0,
                maxWireVersion: 21,
                readOnly: false,
                hosts: [`127.0.0.1:${this.port}`],
                me: `127.0.0.1:${this.port}`,
                topologyVersion: { processId: new bson.ObjectId(), counter: new bson.Long(0) },
                connectionId: 1,
              };

              const serializedDoc = bson.serialize(responseDoc);
              const responseMsgLen = 16 + 4 + 1 + serializedDoc.length;
              const header = Buffer.alloc(21);

              header.writeInt32LE(responseMsgLen, 0); // messageLength
              header.writeInt32LE(1, 4); // requestID
              header.writeInt32LE(requestId, 8); // responseTo
              header.writeInt32LE(2013, 12); // OP_MSG
              header.writeUInt32LE(0, 16); // flagBits
              header.writeUInt8(0, 20); // sectionType 0 (body)

              socket.write(Buffer.concat([header, serializedDoc]));
            } else if (opCode === 2004) {
              // OP_QUERY (Legacy)
              const responseDoc = {
                ok: 1,
                ismaster: true,
                isWritablePrimary: true,
                maxBsonObjectSize: 16777216,
                maxMessageSizeBytes: 48000000,
                maxWriteBatchSize: 100000,
                minWireVersion: 0,
                maxWireVersion: 21,
              };
              const serialized = bson.serialize(responseDoc);
              const totalLen = 36 + serialized.length;
              const response = Buffer.alloc(36);
              response.writeInt32LE(totalLen, 0);
              response.writeInt32LE(2, 4);
              response.writeInt32LE(requestId, 8);
              response.writeInt32LE(1, 12); // OP_REPLY
              response.writeInt32LE(0, 16); // responseFlags
              response.writeInt32LE(0, 20); // cursorID (low)
              response.writeInt32LE(0, 24); // cursorID (high)
              response.writeInt32LE(0, 28); // startingFrom
              response.writeInt32LE(1, 32); // numberReturned

              socket.write(Buffer.concat([response, serialized]));
            }
          }
        });

        socket.on('error', () => {});
      });

      this.server.listen(this.port, '127.0.0.1', () => {
        resolve(`mongodb://127.0.0.1:${this.port}/ablespace?directConnection=true`);
      });

      this.server.on('error', () => {
        resolve(`mongodb://127.0.0.1:${this.port}/ablespace?directConnection=true`);
      });
    });
  }

  stop() {
    if (this.server) {
      this.server.close();
      this.server = null;
    }
  }
}

export const mockMongo = new MockMongoServer();
