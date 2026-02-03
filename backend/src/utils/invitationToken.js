import crypto from 'crypto';

export const generateInvitationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const getInvitationExpiry = (days = 7) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
};
