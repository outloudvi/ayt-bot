addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

const ALLOW_USER_WITH_USERNAME = true;
const PRESERVE_TEXT = false;
const BAYES_THERESHOLD = 0.75;

const BAD_WORDS = {
  0.8: ["炸群", "__asm__test__key__"],
  0.5: [
    "电报",
    "土豆",
    "非小号",
    "微信：",
    "在线",
    "咨询",
    "增粉",
    "mytoken",
    "专卖",
    "莆田",
    "推广",
    "热搜",
  ],
  0.3: ["出售", "联系", "私聊", "加好友", "头像"],
};

function bayes(str) {
  let ret = 0;
  for (const [key, val] of Object.entries(BAD_WORDS)) {
    for (const word of val) {
      if (str.includes(word)) ret += Number(key);
    }
  }
  return ret;
}

/**
 *
 * @param {string} fullname
 * @returns {boolean}
 */
function suspicious_name_filter(fullname) {
  if (fullname.trim().match(/^[A-Z][a-z]+$/) !== null) return true;
  if (fullname.trim().match(/^[\u4e00-\u9fa5]{2,3}$/) !== null) return true;
  return false;
}

function hasBadUser(users) {
  const results = [];
  for (const i of users) {
    let desc = (i.first_name || "") + (i.last_name || "");
    const fullname = desc;
    desc = desc.replace(/[. -_·\/\\]/g, "");
    desc = desc.toLowerCase();
    const bay = bayes(desc);
    results.push({
      id: i.id,
      name: fullname,
      bayes: bay,
      restrict:
        ALLOW_USER_WITH_USERNAME && i.username
          ? false
          : suspicious_name_filter(fullname),
    });
  }
  return results;
}

async function sendMessage(chat_id, text, disable_notification = false) {
  return await fetch(`https://api.telegram.org/bot${BOT_KEY}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({
      chat_id,
      text,
      parse_mode: "Markdown",
      disable_notification,
    }),
  });
}

async function restrictMember(chat_id, user_id, text_only = PRESERVE_TEXT) {
  return await fetch(
    `https://api.telegram.org/bot${BOT_KEY}/restrictChatMember`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        chat_id,
        user_id,
        permissions: {
          can_send_messages: text_only,
          can_send_media_messages: false,
          can_send_polls: false,
          can_send_other_messages: false,
          can_add_web_page_previews: false,
          can_change_info: false,
          can_invite_users: false,
          can_pin_messages: false,
        },
      }),
    }
  );
}

async function deleteMessage(chat_id, message_id) {
  return await fetch(`https://api.telegram.org/bot${BOT_KEY}/deleteMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({
      chat_id,
      message_id,
    }),
  });
}

/**
 * Respond to the request
 * @param {Request} request
 */
async function handler(request) {
  if (request.method != "POST") return;
  const body = await request.json().catch((x) => {
    return {};
  });
  if (!body.message) return;
  if (!body.message.new_chat_members) return;
  let resp;
  const usersStatus = hasBadUser(body.message.new_chat_members);
  for (const i of usersStatus) {
    if (i.bayes > BAYES_THERESHOLD) {
      resp = await deleteMessage(
        body.message.chat.id,
        body.message.message_id
      ).then((x) => x.json());
    }
    if (i.restrict) {
      resp = await restrictMember(body.message.chat.id, i.id).then((x) =>
        x.json()
      );
      await sendMessage(
        body.message.chat.id,
        `由于「可疑的用户名」，${i.name} (id: ${i.id}) 已被设置为半保护模式，只能发送文字消息。很抱歉给您带来的不便。\n*致管理员：在确认用户真实性后，请尽快解除其半保护模式。*`,
        true
      );
    }
  }
}

async function handleRequest(request) {
  await handler(request);
  return new Response("OK", { status: 200 });
}
