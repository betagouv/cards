import type { NextApiRequest, NextApiResponse } from "next";
import yaml from "yaml";

import { CardStartup } from "../../../components/CardStartup";
import { renderToString } from "react-dom/server";

type Params = {
  team: string;
};

export const getGitHubStartupData = (id: string) => {
  return fetch(
    `https://raw.githubusercontent.com/betagouv/beta.gouv.fr/master/content/_startups/${id}.md`
  )
    .then((r) => r.text())
    .then(async (r) => {
      const frontMatter = r
        .split("---")
        .map((s: string) => s.trim())
        .filter(Boolean)[0];
      const details = await fetch(
        `https://beta.gouv.fr/api/v2.6/startups_details.json`
      )
        .then((r) => r.json())
        .then((r) => r[id]);
      const members = await fetch(`https://beta.gouv.fr/api/v2.6/authors.json`)
        .then((r) => r.json())
        .then((r) =>
          r
            .filter((m: { id: string }) =>
              details.active_members.includes(m.id)
            )
            .map((m: { id: string; fullname: string; role: string }) => ({
              id: m.id,
              fullname: m.fullname,
              role: m.role,
            }))
        );
      return {
        id,
        ...yaml.parse(frontMatter),
        active_members: members,
      };
    })
    .catch(() => null);
};

export default async function handler(
  request: NextApiRequest,
  res: NextApiResponse,
  context: { params: Params }
) {
  if (request.method === "GET") {
    const { path } = request.query;
    // todo: validate params
    if (path && !Array.isArray(path)) {
      const matches = path.match(/^(.*?)(\.(json|svg))?$/);
      if (matches) {
        const [_, id, dot, extension, ...args] = matches;
        const data = await getGitHubStartupData(id);
        if (data) {
          const svg = renderToString(<CardStartup {...data} />);
          if (extension === "json") {
            res.setHeader("content-type", "application/json; charset=utf-8");
            return res.json(data);
          } else if (extension === "svg") {
            res.setHeader("content-type", "image/svg+xml; charset=utf-8");
            return res.send(svg);
          } else {
            res.setHeader("content-type", "text/html; charset=utf-8");
            return res.send(
              renderToString(
                <html>
                  <head>
                    <title>{data.title}</title>
                  </head>
                  <body>
                    <CardStartup {...data} />
                  </body>
                </html>
              )
            );
          }
        }
      }
    }
  }
  return res.status(404).json({});
}
