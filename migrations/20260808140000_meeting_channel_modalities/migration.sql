-- Add WhatsApp meeting modalities (video / phone / in person).
-- Legacy CALENDLY and WHATSAPP values remain for existing rows.

ALTER TYPE "MeetingChannel" ADD VALUE IF NOT EXISTS 'VIDEO_CALL';
ALTER TYPE "MeetingChannel" ADD VALUE IF NOT EXISTS 'PHONE_CALL';
ALTER TYPE "MeetingChannel" ADD VALUE IF NOT EXISTS 'IN_PERSON';
