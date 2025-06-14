// lib/imagekit-user.ts
import ImageKit from "imagekit";

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
});

export const uploadUserImage = async (file: File, userId: string) => {
  // Implementation for uploading user profile images
};

export const deleteUserImage = async (fileId: string) => {
  // Implementation for deleting user profile images
};
