import { SessionModel } from "../models/Session";

export async function createSession(userId: string, tokenHash: string) {
  return await SessionModel.create({
    user_id: userId,
    token_hash: tokenHash,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
}

export async function findSession(tokenHash: string) {
  return await SessionModel.findOne({ token_hash: tokenHash });
}

export async function deleteSession(tokenHash: string) {
  return await SessionModel.deleteOne({ token_hash: tokenHash });
}
