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
          //text: `[![${result.item.id}](${url}.png =600)](${url})`,
          attachments: [
            {
              title: "Fiche beta.gouv.fr",
              title_link: url,
              // fallback: "test",
              // color: "#FF8000",
              // pretext:
              //   "This is optional pretext that shows above the attachment.",
              // text: "This is the text of the attachment. It should appear just above an image of the Mattermost logo. The left border of the attachment should be colored orange, and below the image it should include additional fields that are formatted in columns. At the top of the attachment, there should be an author name followed by a bolded title. Both the author name and the title should be hyperlinks.",
              // author_name: "Mattermost",
              // author_icon:
              //   "https://mattermost.com/wp-content/uploads/2022/02/icon_WS.png",
              // author_link: "https://mattermost.org/",
              // title: "Example Attachment",
              // title_link:
              //   "https://developers.mattermost.com/integrate/reference/message-attachments/",
              // fields: [
              //   {
              //     short: false,
              //     title: "Long Field",
              //     value:
              //       "Testing with a very long piece of text that will take up the whole width of the table. And then some more text to make it extra long.",
              //   },
              //   {
              //     short: true,
              //     title: "Column One",
              //     value: "Testing",
              //   },
              //   {
              //     short: true,
              //     title: "Column Two",
              //     value: "Testing",
              //   },
              //   {
              //     short: false,
              //     title: "Another Field",
              //     value: "Testing",
              //   },
              // ],
              image_url: `${url}.svg`,
            },
          ],
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
