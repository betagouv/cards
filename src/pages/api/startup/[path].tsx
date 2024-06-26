import type { NextApiRequest, NextApiResponse } from "next";
import { renderToString } from "react-dom/server";
import yaml from "yaml";
import sharp from "sharp";
import { CardStartup } from "../../../components/CardStartup";
import { respopos } from "../../../respopos";

type Params = {
  team: string;
};

export const getStartupData = (id: string) => {
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

      const allMembers = await fetch(
        `https://beta.gouv.fr/api/v2.6/authors.json`
      ).then((r) => r.json());

      const members = allMembers
        .filter((m: { id: string }) => details.active_members.includes(m.id))
        .map((m: { id: string; fullname: string; role: string }) => ({
          id: m.id,
          fullname: m.fullname,
          role: m.role,
        }));

      const data = yaml.parse(frontMatter);

      const startupRespopos =
        //@ts-ignore
        (respopos[data.incubator] || [])
          .map((r: any) => {
            const m = allMembers.find((m: any) => m.id === r);
            return (
              m && {
                id: m.id,
                fullname: m.fullname,
                role: m.role,
              }
            );
          })
          .filter(Boolean);

      return {
        id,
        ...data,
        active_members: members,
        respopos: startupRespopos,
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
        const data = await getStartupData(id);
        if (data) {
          if (extension === "json") {
            res.setHeader("content-type", "application/json; charset=utf-8");
            return res.json(data);
          } else if (extension === "svg") {
            const svg = renderToString(
              <CardStartup {...data} animate={true} />
            );
            res.setHeader("content-type", "image/svg+xml; charset=utf-8");
            return res.send(svg);
          } else if (extension === "png") {
            const svg = renderToString(<CardStartup {...data} />);
            const png = await sharp(Buffer.from(svg))
              .resize(1000)
              .png({
                quality: 95,
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
                    <title>{data.title}</title>
                  </head>
                  <body>
                    <div
                      style={{
                        textAlign: "center",
                        paddingTop: "20vh",
                        transform: "scale(2)",
                      }}
                    >
                      <CardStartup {...data} animate={true} />
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
