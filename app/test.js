import connectDB from '@/app/lib/mongodb';
import User from '@/app/models/User';

async function testDB() {
  await connectDB();
  const user = await User.findById('67afb185ffdbcd38e278af60').select('-password');
  console.log(user);
}

testDB();