import { initializeApp } from 'firebase/app';
import { getDatabase, ref, update } from 'firebase/database';
import axios from 'axios';

const firebaseConfig = {
  apiKey: "AIzaSyBh9OSP70ZU2V42mN5CvQZYAIbTtiXA1vI",
  databaseURL: "https://xyzopediaa-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "xyzopediaa"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const body = req.body;

  if (body.callback_query) {
    const { id, data } = body.callback_query;
    const orderId = data.replace(/^(confirm_|cancel_)/, '');

    let status = '';
    if (data.startsWith('confirm_')) status = 'confirmed';
    if (data.startsWith('cancel_')) status = 'canceled';

    try {
      await update(ref(db, `orders/${orderId}`), { status });

      await axios.post(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/answerCallbackQuery`, {
        callback_query_id: id,
        text: `Status order ${orderId} diubah jadi ${status}`,
        show_alert: false
      });

      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Firebase update failed' });
    }
  }

  return res.status(200).json({ message: 'No action taken' });
}
