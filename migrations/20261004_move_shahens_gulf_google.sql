-- Move only Alshahens Gulf Google history; preserve all recorded amounts and IDs.
UPDATE sales SET market = 'saudi'
WHERE market = 'international' AND store = 'alshahens store' AND platform = 'Gulf-Google';
