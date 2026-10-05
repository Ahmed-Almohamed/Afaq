-- Merge the two Shahens channels without deleting sales or changing recorded amounts.
UPDATE sales SET market = 'saudi', platform = 'Qatar-Google'
WHERE store = 'alshahens store'
AND ((market = 'international' AND platform = 'Qatar-Google')
OR (market = 'saudi' AND platform = 'Gulf-Google'));
