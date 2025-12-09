/*
  # Facilities Multi-Tenancy Migration
  
   facilities tablosuna organization_id ekler.
*/

ALTER TABLE facilities 
ADD COLUMN organization_id uuid REFERENCES organizations(id);

-- Mevcut şubeleri (Anadolu Hastaneleri) default organizasyona bağla
UPDATE facilities 
SET organization_id = (SELECT id FROM organizations WHERE slug = 'anadolu')
WHERE organization_id IS NULL;

-- Not Null constraints (opsiyonel ama iyi olur)
ALTER TABLE facilities 
ALTER COLUMN organization_id SET NOT NULL;
