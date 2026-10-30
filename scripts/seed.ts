import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Manually load .env.local and .env if present
function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const fullPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const [key, ...values] = trimmed.split('=');
          const val = values.join('=').trim().replace(/^["']|["']$/g, '');
          if (!process.env[key.trim()]) {
            process.env[key.trim()] = val;
          }
        }
      }
    }
  }
}

loadEnv();

async function seed() {
  const uri = process.env.MONGODB_URI;
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD || 'AdminStrongPassword123!';

  if (!uri) {
    console.error('Error: MONGODB_URI is not set in environment or .env file');
    process.exit(1);
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(uri);

  // Admin schema
  const AdminSchema = new mongoose.Schema(
    {
      email: { type: String, required: true, unique: true, lowercase: true, trim: true },
      passwordHash: { type: String, required: true },
    },
    { timestamps: true }
  );

  const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

  // Settings schema
  const SettingsSchema = new mongoose.Schema(
    {
      defaultQrLogoPath: { type: String, default: '' },
      siteName: { type: String, default: 'LinkMount' },
    },
    { timestamps: true }
  );

  const Settings = mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);

  const passwordHash = await bcrypt.hash(password, 12);

  const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
  if (existingAdmin) {
    existingAdmin.passwordHash = passwordHash;
    await existingAdmin.save();
    console.log(`Updated existing administrator credentials for: ${email}`);
  } else {
    await Admin.create({
      email: email.toLowerCase(),
      passwordHash,
    });
    console.log(`Created new administrator: ${email}`);
  }

  // Ensure settings singleton exists
  const settingsCount = await Settings.countDocuments();
  if (settingsCount === 0) {
    await Settings.create({
      siteName: 'LinkMount',
      defaultQrLogoPath: '',
    });
    console.log('Created default Settings singleton.');
  }

  console.log('Seeding completed successfully!');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed with error:', err);
  process.exit(1);
});
