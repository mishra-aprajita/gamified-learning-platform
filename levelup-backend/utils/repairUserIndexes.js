/**
 * Fixes legacy googleId_1 indexes that block local email/password registration.
 * Safe to run on every server boot.
 */
async function repairUserIndexes(User) {
  const collection = User.collection;
  const indexes = await collection.indexes();
  const googleIdx = indexes.find((idx) => idx.name === 'googleId_1');

  if (googleIdx && googleIdx.unique && !googleIdx.sparse) {
    await collection.dropIndex('googleId_1');
    console.warn('⚠️  Dropped non-sparse googleId_1 index (was blocking local signups)');
  }

  await collection.updateMany(
    { $or: [{ googleId: '' }, { googleId: null }] },
    { $unset: { googleId: '' } }
  );

  await User.syncIndexes();
}

module.exports = { repairUserIndexes };
