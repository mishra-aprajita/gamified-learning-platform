/**
 * One-time Atlas fix for local registration failing with E11000 on googleId.
 *
 * Usage (mongosh):
 *   use <your_db_name>
 *   load("scripts/fix-googleId-index.js")  // or paste commands below
 *
 * Or run commands directly:
 */
const commands = `
// 1) Inspect indexes on users collection
db.users.getIndexes();

// 2) If googleId_1 exists WITHOUT "sparse: true", drop it
db.users.dropIndex("googleId_1");

// 3) Remove bad empty-string googleId values (optional, if any exist)
db.users.updateMany({ googleId: "" }, { $unset: { googleId: "" } });

// 4) Recreate sparse unique index (Mongoose also creates this on deploy)
db.users.createIndex({ googleId: 1 }, { unique: true, sparse: true });
`;

console.log(commands);

module.exports = { commands };
