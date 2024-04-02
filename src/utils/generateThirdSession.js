import crypto from "crypto";

const generateThirdSession = (openid, session_key) => {
  const hmac = crypto.createHmac("sha256", session_key);
  return hmac.update(openid).digest('base64')
};

export default generateThirdSession;
