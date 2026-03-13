/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "lh3.googleusercontent.com",      // Google
      "res.cloudinary.com",             // Cloudinary
      "images-noneu.truecallerstatic.com" // Truecaller
    ],
  },
};

module.exports = nextConfig;
