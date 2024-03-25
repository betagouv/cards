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
    "http://127.0.0.1:4000/api/v2.6/authors.json"
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
    "http://127.0.0.1:4000/api/v2.6/startups.json"
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
  const query = Array.isArray(request.query.q)
    ? request.query.q[0]
    : request.query.q || "";
  const results = await findResults({
    query: decodeURIComponent(query),
    limit: 3,
  });
  if (results.length) {
    const result = results[0];
    const host = process.env.HOST || "http://127.0.0.1:3000";
    const url = `${host}/api/${result.item.type}/${result.item.id}.svg`;
    res.redirect(url);
    return;
  }
  res.json({
    markdown: "[![]()]()",
  });
}
