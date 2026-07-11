import crypto from 'crypto';
import dbClient from '../utils/db';

export default postNew = async (req, res) => {
  const usersCollection = dbClient.db.collection('users');
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Missing email' });
  }
  if (!password) {
    return res.status(400).json({ error: 'Missing password' });
  }

  const user = await usersCollection.findOne({ email });

  if (user) {
    return res.status(400).json({ error: 'Already exist' });
  }

  const hashedPassword = crypto
    .createHash('sha1')
    .update(password)
    .digest('hex');

  const newUser = await usersCollection.insertOne({
    email,
    password: hashedPassword,
  });

  return res.status(201).json({
    id: newUser.insertedId.toString(),
    email,
  });
};
