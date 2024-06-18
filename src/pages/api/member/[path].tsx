import type { NextApiRequest, NextApiResponse } from "next";
import { renderToString } from "react-dom/server";
import yaml from "yaml";
import sharp from "sharp";

import { CardMember } from "../../../components/CardMember";

type Params = {
  team: string;
};

export const getGitHubMemberData = (id: string) => {
  return fetch(
    `https://raw.githubusercontent.com/betagouv/beta.gouv.fr/master/content/_authors/${id}.md`
  )
    .then((r) => r.text())
    .then(async (r) => {
      const frontMatter = r
        .split("---")
        .map((s: string) => s.trim())
        .filter(Boolean)[0];

      const githubData = yaml.parse(frontMatter);

      if (githubData.github) {
        githubData.avatar = await fetch(
          `https://github.com/${githubData.github}.png?size=100`
        )
          .then((r) => r.blob())
          .then(async (blob) => {
            // convert to JPEG for sharp PNG conversion
            const buffer = await sharp(await blob.arrayBuffer())
              .jpeg({
                quality: 95,
              })
              .toBuffer();
            return `data:image/jpeg;base64,${buffer.toString("base64")}`;
          });
      }
      return {
        id,
        ...githubData,
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
      const matches = path.match(/^(.*?)(\.(json|svg|png))?$/);
      if (matches) {
        const [_, id, dot, extension, ...args] = matches;
        const data = await getGitHubMemberData(id);
        if (data) {
          if (extension === "json") {
            res.setHeader("content-type", "application/json; charset=utf-8");
            return res.json(data);
          } else if (extension === "svg") {
            const svg = renderToString(<CardMember {...data} animate={true} />);
            res.setHeader("content-type", "image/svg+xml; charset=utf-8");
            return res.send(svg);
          } else if (extension === "png") {
            const svg = renderToString(<CardMember {...data} />);
            const png = await sharp(Buffer.from(svg))
              .resize(1000)
              .png({
                quality: 100,
                adaptiveFiltering: true,
                compressionLevel: 1,
              })
              .toBuffer();
            res.setHeader("content-type", "image/png");
            return res.send(png);
          } else {
            res.setHeader("content-type", "text/html; charset=utf-8");
            return res.send(
              renderToString(
                <html>
                  <head>
                    <title>{data.fullname}</title>
                  </head>
                  <body>
                    <div
                      style={{
                        textAlign: "center",
                        paddingTop: "20vh",
                        transform: "scale(2)",
                      }}
                    >
                      <CardMember {...data} animate={true} />
                    </div>
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
