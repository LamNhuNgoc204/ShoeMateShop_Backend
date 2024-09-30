exports.randomPassword = (length = 6) => {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
};

exports.validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

exports.validatePassword = (password) => {
  const minLength = 6;
  const upperCase = /[A-Z]/;
  const lowerCase = /[a-z]/;
  const number = /[0-9]/;
  const specialChar = /[!@#$%^&*(),.?":{}|<>]/;

  if (password.length < minLength) {
    return false;
  }

  if (!upperCase.test(password)) {
    return false;
  }

  if (!lowerCase.test(password)) {
    return false;
  }

  if (!number.test(password)) {
    return false;
  }

  if (!specialChar.test(password)) {
    return false;
  }

  return true;
};

exports.checkRole = (role) => {
  const validRoles = ["admin", "user", "employee"];
  return validRoles.includes(role);
};
