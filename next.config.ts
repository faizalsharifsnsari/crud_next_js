/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "lh3.googleusercontent.com", // Google
      "res.cloudinary.com",        // Cloudinary
    ],
  },
};

module.exports = nextConfig;
