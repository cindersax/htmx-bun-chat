export function renderOnlineUserCount(userCount: number) {
  return `
      <span id="online_count" hx-swap-oob='outerHTML:#online_count'>
        ${userCount}
      </span>`;
}

export function renderUserJoinNotification(username: string) {
  return `
      <div hx-swap-oob='afterbegin:#chat_messages'>
        <div class="userJoin">
          ${username} joined the chat
        </div>
      </div>`;
}

export function renderUserMessage(
  username: string,
  message: string,
  time: string,
  isLocal: boolean
) {
  const messageClass = isLocal ? "localMessage" : "remoteMessage";
  return `
      <div hx-swap-oob='afterbegin:#chat_messages'>
        <div class="chatMessage ${messageClass}">
          <b>${username}</b>
          <p>${message}</p>
          <span>${time}</span>
        </div>
      </div>`;
}

export function renderUserLeaveNotification(username: string) {
  return `
      <div hx-swap-oob='afterbegin:#chat_messages'>
        <div class="userLeave">
          ${username} left the chat
        </div>
      </div>`;
}
