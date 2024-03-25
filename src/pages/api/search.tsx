import type { NextApiRequest, NextApiResponse } from "next";
import { renderToString } from "react-dom/server";
import Fuse from "fuse.js";

import { CardMember } from "../../components/CardMember";
import { CardStartup } from "../../components/CardStartup";

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
    // const Component = card.item.type==="startup"?CardStartup:CardMember;
    // const svg = renderToString(<Component {...data} />);
    // res.setHeader("content-type", "image/svg+xml; charset=utf-8");
    // return res.send(svg);

    // const rows = results.flatMap((result) => {
    //   const url = `${host}/api/${result.item.type}/${result.item.id}`;
    //   const card = `[![${result.item.id}](${url}.svg)](${url})`;
    //   const href = url;
    //   return [card, href];
    // });
    // res.json({
    //   markdown: rows.join("\n\n"),
    // });
  }
  res.json({
    markdown: "[![]()]()",
  });
}
