import type { NextApiRequest, NextApiResponse } from "next";
import yaml from "yaml";

import { CardMember } from "../../../components/CardMember";
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
          let avatar;
          if (data.github) {
            data.avatar = await fetch(
              `https://github.com/${data.github}.png?size=100`
            )
              .then((r) => r.blob())
              .then(async (blob) => {
                const buffer = Buffer.from(await blob.arrayBuffer());
                return `data:image/png;base64,${buffer.toString("base64")}`;
              });

            //.then((data) => data.text());
            //.then((t) => t.toString());
            // const buf = Buffer.from(avatar, "base64");
            // console.log("avatar", buf);
            // avatar =
          }
          const svg = renderToString(<CardMember {...data} />);
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
                    <title>{data.fullname}</title>
                  </head>
                  <body>
                    <CardMember {...data} />
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
