ALTER TABLE "pledgeOptions" DROP COLUMN IF EXISTS "customization" ;
ALTER TABLE "membershipPeriods" DROP COLUMN IF EXISTS "kind" ;
ALTER TABLE "packages"
  DROP COLUMN IF EXISTS "custom",
  DROP COLUMN IF EXISTS "rules" ;
