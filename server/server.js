import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const FB_PIXEL_ID = process.env.FB_PIXEL_ID;
const FB_ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN;
const FB_API_VERSION = process.env.FB_API_VERSION;
const ANON_URL = process.env.ANON_URL;

app.post(`${ANON_URL}`, async (req, res) => {
    const { anon_cuid, audience_id } = req.body;

    if (!anon_cuid || !audience_id) {
        return res.status(400).json({ error: 'Missing anon_cuid or audience_id' });
    }

    const eventData = {
        event_name: 'Anon_Audience',
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        custom_data: {
            anon_cuid: anon_cuid,
            audience_id: audience_id
        }
    };

    try {
        const fbResponse = await fetch(`https://graph.facebook.com/${FB_API_VERSION}/${FB_PIXEL_ID}/events?access_token=${FB_ACCESS_TOKEN}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: [eventData] })
        });

        const fbResult = await fbResponse.json();
        res.json({ success: true, fbResult });
    } catch (error) {
        console.error('Error sending to FB CAPI:', error);
        res.status(500).json({ error: 'Failed to send event' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
