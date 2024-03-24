import type { NextApiRequest, NextApiResponse } from "next";
import yaml from "yaml";

import { Member } from "../../../components/MemberCard";
import { renderToString } from "react-dom/server";

type Params = {
  team: string;
};

export const getGitHubMemberData = (id: string) => {
  return fetch(
    `https://raw.githubusercontent.com/betagouv/beta.gouv.fr/master/content/_authors/${id}.md`
  )
    .then((r) => r.text())
    .then((r) => {
      const frontMatter = r
        .split("---")
        .map((s: string) => s.trim())
        .filter(Boolean)[0];
      return yaml.parse(frontMatter);
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
        const data = await getGitHubMemberData(id);
        if (data) {
          const svg = renderToString(<Member {...data} />);
          if (extension === "json") {
            res.setHeader("content-type", "application/json; charset=utf-8");
            return res.json(data);
          } else if (extension === "svg") {
            res.setHeader("content-type", "text/svg; charset=utf-8");
            return res.send(svg);
          } else {
            res.setHeader("content-type", "text/html; charset=utf-8");
            return res.send(
              renderToString(
                <html>
                  <head>
                    <title>{data.fullname}</title>
                  </head>
                  <body>
                    <Member {...data} />
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
