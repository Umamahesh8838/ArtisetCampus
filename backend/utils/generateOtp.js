function generateOtp() {
  // returns a zero-padded 6-digit string
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString();
}

module.exports = generateOtp;
