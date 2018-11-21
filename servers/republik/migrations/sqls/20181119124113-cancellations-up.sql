CREATE DOMAIN cancel_category AS TEXT
  CHECK(
    VALUE IN ('EDITORIAL', 'NO_TIME', 'LOGIN', 'PAPER', 'TOO_EXPENSIVE', 'OTHER')
  );

CREATE TABLE "membershipCancellations" (
  "id"              uuid primary key not null default uuid_generate_v4(),
  "membershipId"    uuid not null references "memberships"(id),
  "reason"          text,
  "category"        cancel_category not null,
  "createdAt"       timestamptz default now(),
  "updatedAt"       timestamptz default now(),
  "revokedAt"       timestamptz
);

-- migrate exising membership.cancelReasons
INSERT INTO
  "membershipCancellations" ("membershipId", reason, category, "createdAt", "revokedAt")
  (
    SELECT
      id as "membershipId",
      jsonb_array_elements_text("cancelReasons") as reason,
      'OTHER' as category,
      '2018-01-01',
      CASE WHEN active = true THEN '2018-01-01'::date ELSE null END
    FROM
      memberships
  )
;

ALTER TABLE "memberships"
  DROP COLUMN "cancelReasons"
;

CREATE OR REPLACE FUNCTION revoke_membership_cancellations()
RETURNS trigger AS $$
BEGIN
  IF (NEW.renew = true) THEN
    UPDATE
      "membershipCancellations"
    SET
      "revokedAt" = now()
    WHERE
      "membershipId" = NEW.id AND
      "revokedAt" IS NULL
    ;
  END IF;
  RETURN NEW;
END
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER trigger_revoke_membership_cancellations
AFTER UPDATE ON memberships
FOR EACH ROW
EXECUTE PROCEDURE revoke_membership_cancellations();
