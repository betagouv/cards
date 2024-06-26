import type { NextApiRequest, NextApiResponse } from "next";
import Fuse from "fuse.js";

type Params = {
  query: string;
};

const fuseOptions = {
  keys: ["id", "label"],
  includeScore: true,
  minMatchCharLength: 3,
  threshold: 0.2,
};

interface SearchItem {
  type: string;
  id: string;
  label: string;
}

interface SearchResult {
  score: number;
  item: SearchItem;
}

const findResults = async ({
  query,
  limit = 10,
}: {
  query: string;
  limit: number;
}) => {
  const members: SearchItem[] = await fetch(
    "https://beta.gouv.fr/api/v2.6/authors.json"
  )
    .then((r) => r.json())
    .then((r) =>
      r.map((author: any) => ({
        type: "member",
        id: author.id,
        label: author.fullname,
      }))
    );
  const startups: SearchItem[] = await fetch(
    "https://beta.gouv.fr/api/v2.6/startups.json"
  )
    .then((r) => r.json())
    .then((r) =>
      r.data.map((s: any) => ({
        type: "startup",
        id: s.id,
        label: s.attributes.name,
      }))
    );
  const fuseMembers = new Fuse(members, fuseOptions);
  const fuseStartups = new Fuse(startups, fuseOptions);
  const results = [...fuseMembers.search(query), ...fuseStartups.search(query)]
    .sort((a, b) => (a.score || 0) - (b.score || 0))
    .slice(0, limit);
  return results;
};

export default async function handler(
  request: NextApiRequest,
  res: NextApiResponse,
  context: { params: Params }
) {
  console.log("/api/mattermost/fiche", request.method);
  if (request.method === "POST") {
    const { text, token } = request.body;
    if (token === process.env.MATTERMOST_TOKEN) {
      console.log("search results", text);
      const results = await findResults({
        query: text,
        limit: 3,
      });
      if (results.length) {
        const result = results[0];
        const host = process.env.DOMAIN || "http://127.0.0.1:3000";
        const url = `${host}/api/${result.item.type}/${result.item.id}`;
        res.json({
          response_type: "ephemeral",
          text: `[![${result.item.id}](${url}.png =600)](${url})`,
        });
        return;
      }
      res.json({
        response_type: "ephemeral",
        text: `Désolé je ne trouve pas de fiche correspondante pour "${text}" 🤷‍♂️\n\n👉 Poses [une issue sur GitHub](https://github.com/betagouv/cards/issues/new) si c'est un bug.`,
      });
      return;
    }
  }

  res.status(401).json({});
}
