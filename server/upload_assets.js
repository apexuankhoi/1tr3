
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const baseDir = path.join(__dirname, '../assets');

const folders = [
  { path: 'chau', folder: 'nongnghiepxanh/chau' },
  { path: 'seed', folder: 'nongnghiepxanh/seed' },
  { path: 'cay/cafe', folder: 'nongnghiepxanh/cay/cafe' },
  { path: 'cay/saurieng', folder: 'nongnghiepxanh/cay/saurieng' }
];

async function uploadFiles() {
  const mapping = {};

  for (const f of folders) {
    const dir = path.join(baseDir, f.path);
    if (!fs.existsSync(dir)) {
      console.log(`Directory not found: ${dir}`);
      continue;
    }

    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (file.endsWith('.png')) {
        const filePath = path.join(dir, file);
        const publicId = path.parse(file).name;
        
        console.log(`Uploading ${f.path}/${file}...`);
        try {
          const result = await cloudinary.uploader.upload(filePath, {
            folder: f.folder,
            public_id: publicId,
            overwrite: true,
            resource_type: 'image'
          });
          mapping[`${f.path}/${file}`] = result.secure_url;
        } catch (err) {
          console.error(`Failed to upload ${file}:`, err);
        }
      }
    }
  }

  console.log('UPLOAD_MAPPING_START');
  console.log(JSON.stringify(mapping, null, 2));
  console.log('UPLOAD_MAPPING_END');
}

uploadFiles();
