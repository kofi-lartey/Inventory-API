export const otpGenerator = (length = 6) => {
    let otp = "";
    // Define the character set to include numbers and letters
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    
    for (let i = 0; i < length; i++) {
        // Get a random character from the defined set
        otp += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return otp;
};

// export const otpGeneratorn = (length = 6) => {
//     let otp = "";
//     for (let i = 0; i < length; i++) {
//         otp += Math.floor(Math.random() * 10)
//     }
//     return otp;
// };

