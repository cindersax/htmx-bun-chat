import {
  renderOnlineUserCount,
  renderUserJoinNotification,
  renderUserMessage,
  renderUserLeaveNotification,
} from "./templates";
import { generateUsername, sanitizeInput, currentTime } from "./utils";

interface User {
  username: string;
}

let users = new Map<string, User>();

const server = Bun.serve<{ username: string }>({
  port: process.env.PORT || 4000,
  fetch(req, server) {
    try {
      const url = new URL(req.url);
      if (url.pathname === "/") {
        return new Response(Bun.file("src/index.html"));
      }

      if (url.pathname === "/chatroom") {
        const username = generateUsername();
        const success = server.upgrade(req, { data: { username } });
        if (success) return undefined;
        return;
      }

      return new Response("Not Found", { status: 404 });
    } catch (error) {
      console.error("Error in fetch handler:", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
  websocket: {
    open(ws) {
      try {
        ws.subscribe("chatroom");
        const username = ws.data.username;
        users.set(username, { username });
        const userCount = renderOnlineUserCount(users.size);
        const userJoinNotification = renderUserJoinNotification(
          sanitizeInput(username)
        );
        ws.publish("chatroom", userCount + userJoinNotification);
        ws.send(userCount);
      } catch (error) {
        console.error("Error in WebSocket open handler:", error);
      }
    },
    message(ws, message) {
      try {
        const parsedMessage =
          typeof message === "string" ? JSON.parse(message) : message;

        if (!parsedMessage || typeof parsedMessage.message !== "string") {
          throw new Error("Invalid message format");
        }

        const formattedTime = currentTime();

        const sanitizedMessage = sanitizeInput(parsedMessage.message);

        const remoteMessage = renderUserMessage(
          ws.data.username,
          sanitizedMessage,
          formattedTime,
          false
        );

        const localMessage = renderUserMessage(
          "you",
          sanitizedMessage,
          formattedTime,
          true
        );

        ws.publish("chatroom", remoteMessage);
        ws.send(localMessage);
      } catch (error) {
        console.error("Error in WebSocket message handler:", error);
      }
    },
    close(ws) {
      try {
        users.delete(ws.data.username);
        const userCount = renderOnlineUserCount(users.size);
        const userLeaveNotification = renderUserLeaveNotification(
          sanitizeInput(ws.data.username)
        );
        server.publish("chatroom", userCount + userLeaveNotification);
        ws.unsubscribe("chatroom");
      } catch (error) {
        console.error("Error in WebSocket close handler:", error);
      }
    },
  },
});
