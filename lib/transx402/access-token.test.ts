import assert from "node:assert/strict";
import test from "node:test";
import {
  cookieName,
  issueAccessToken,
  verifyAccessToken,
} from "./access-token";

const SECRET = "test-access-token-secret";
const PAYER = "0xF39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

test("cookieName prefixes the resource id", () => {
  assert.equal(cookieName("article"), "tx402_access_article");
});

test("issue then verify returns payload", () => {
  const now = 1_700_000_000;
  const token = issueAccessToken({
    resourceId: "article",
    payer: PAYER,
    txHash: "0xabc",
    secret: SECRET,
    ttlSeconds: 60,
    now,
  });

  const payload = verifyAccessToken(token, {
    resourceId: "article",
    secret: SECRET,
    now,
  });

  assert.ok(payload);
  assert.equal(payload.resourceId, "article");
  assert.equal(payload.payer, PAYER.toLowerCase());
  assert.equal(payload.txHash, "0xabc");
  assert.equal(payload.exp, now + 60);
});

test("verify rejects expired tokens", () => {
  const now = 1_700_000_000;
  const token = issueAccessToken({
    resourceId: "article",
    payer: PAYER,
    txHash: null,
    secret: SECRET,
    ttlSeconds: 10,
    now,
  });

  const payload = verifyAccessToken(token, {
    resourceId: "article",
    secret: SECRET,
    now: now + 11,
  });

  assert.equal(payload, null);
});

test("verify rejects a different resource id", () => {
  const token = issueAccessToken({
    resourceId: "article",
    payer: PAYER,
    txHash: null,
    secret: SECRET,
  });

  assert.equal(
    verifyAccessToken(token, { resourceId: "other", secret: SECRET }),
    null
  );
});

test("verify rejects a tampered signature", () => {
  const token = issueAccessToken({
    resourceId: "article",
    payer: PAYER,
    txHash: null,
    secret: SECRET,
  });
  const tampered = token.slice(0, -2) + "ff";

  assert.equal(
    verifyAccessToken(tampered, { resourceId: "article", secret: SECRET }),
    null
  );
});

test("verify rejects a token signed with a different secret", () => {
  const token = issueAccessToken({
    resourceId: "article",
    payer: PAYER,
    txHash: null,
    secret: SECRET,
  });

  assert.equal(
    verifyAccessToken(token, { resourceId: "article", secret: "other-secret" }),
    null
  );
});
