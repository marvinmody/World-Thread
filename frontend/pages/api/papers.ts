import type { NextApiRequest, NextApiResponse } from 'next';
import { getCrossrefGlobeNodes } from '@/utils/mapCrossrefToNodes';
import { getArxivGlobeNodes } from '@/utils/mapArxivToNodes';

const arxivTopics = ['AI', 'Space', 'Environmental'];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { topic } = req.query;

  try {
    let nodes = [];

    // If topic is provided
    if (typeof topic === 'string') {
      if (arxivTopics.includes(topic)) {
        nodes = await getArxivGlobeNodes(topic);
      } else {
        nodes = await getCrossrefGlobeNodes(topic);
      }
    } 
    // If no topic, get all arxiv topics
    else {
        nodes = await getArxivGlobeNodes(); // no topic = fetch all topics
    }

    res.status(200).json(nodes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch research data' });
  }
}
