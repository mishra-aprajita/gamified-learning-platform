/**
 * Map MongoDB E11000 duplicate-key errors to clear client messages.
 */
const FIELD_LABELS = {
  email: 'Email',
  googleId: 'Google account',
  name: 'Name',
};

const duplicateKeyMessage = (err) => {
  const patternKey = err.keyPattern && Object.keys(err.keyPattern)[0];
  const valueKey = err.keyValue && Object.keys(err.keyValue)[0];
  const field = patternKey || valueKey || 'field';
  const label = FIELD_LABELS[field] || field.charAt(0).toUpperCase() + field.slice(1);

  if (field === 'googleId') {
    return (
      'A database index conflict occurred for Google sign-in (googleId). ' +
      'Local email/password registration does not use Google ID — if you see this while registering, ' +
      'drop the old non-sparse googleId index in MongoDB and ensure googleId is unique + sparse only.'
    );
  }

  return `${label} already exists`;
};

module.exports = { duplicateKeyMessage };
