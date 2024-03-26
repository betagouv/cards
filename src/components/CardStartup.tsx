import { ExternalLink } from "./ExternalLink";
import { LogoBeta } from "./LogoBeta";
import { LogoGitHub } from "./LogoGitHub";
import { LogoEmail } from "./LogoEmail";

import { getCss } from "../css";
import { wrapTextMultiline } from "@/utils";

const WIDTH = 600;

const getLatestPhase = (phases: { start: string; name: string }[]) => {
  return phases.length
    ? phases
        .sort(
          (a: any, b: any) =>
            new Date(a.start).getTime() - new Date(b.start).getTime()
        )
        .reverse()[0].name
    : null;
};

export const CardStartup = ({
  id,
  title,
  mission,
  screenshot,
  sponsors,
  incubator,
  phases,
  link,
  contact,
  stats_url,
  repository,
  dashlord_url,
  accessibility_status,
  active_members,
  respopos,
  animate = false,
}: any) => {
  const logos = [];
  const url = link;

  if (link) {
    logos.push((props: any) => (
      <a target="_blank" href={link}>
        <ExternalLink width={32} height={32} {...props} />
      </a>
    ));
  }
  if (repository) {
    logos.push((props: any) => (
      <a target="_blank" href={repository}>
        <LogoGitHub width={26} height={26} {...props} y={-18} />
      </a>
    ));
  }
  if (contact) {
    logos.push((props: any) => (
      <a target="_blank" href={`mailto:${contact}`}>
        <LogoEmail width={26} height={26} {...props} y={-18} />
      </a>
    ));
  }
  const CARD_MIN_HEIGHT = 120;
  const isActive = (mission: any) =>
    mission.end ? new Date(mission.end) > new Date() : true;

  const pins = [];

  pins.push({
    label: `Phase: ${getLatestPhase(phases)}`,
    color: "#3572A5",
  });
  pins.push({
    label: "Fiche beta.gouv.fr",
    href: `https://beta.gouv.fr/startups/${id}.html`,
    color: "#3572A5",
  });
  pins.push({
    label: `Sponsor${sponsors.length > 1 ? "s" : ""}: ${sponsors
      .map((s: string) => s.replace("/organisations/", "").toUpperCase())
      .join(", ")}`,
    href: `#`,
    color: "#f1e05a",
  });

  pins.push({
    label: `Incubateur: ${incubator.toUpperCase()}`,
    href: `https://beta.gouv.fr/incubateurs/${incubator}.html`,
    color: "#f1e05a",
  });

  pins.push(
    accessibility_status
      ? {
          label: `Accessiblité: ${accessibility_status}`,
          href: `#`,
          color: "#33de9c",
        }
      : {
          label: "Pas de déclaration d'accessibilité",
          href: "#",
          color: "#ff0200",
        }
  );
  pins.push(
    stats_url
      ? {
          label: "Page de statistiques",
          href: stats_url,
          color: "#33de9c",
        }
      : {
          label: "Pas de page de statistiques",
          href: "#",
          color: "#ff0200",
        }
  );

  const computedHeight = Math.max(
    250,
    70 +
      30 +
      Math.max(pins.length, active_members.length + respopos.length) * 22
  );
  const cardHeight = Math.max(CARD_MIN_HEIGHT, computedHeight);
  const missionLines = wrapTextMultiline(mission, 65);

  return (
    <svg
      width={WIDTH}
      height={cardHeight}
      viewBox={`0 0 ${WIDTH} ${cardHeight}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby="descId"
    >
      <title id="titleId"></title>
      <desc id="descId"></desc>
      <style>{getCss({ animate })}</style>
      <rect
        x="0.5"
        y="0.5"
        rx="4.5"
        height="99%"
        stroke="#c2d1ff"
        width={WIDTH - 5}
        fill="#fffefe"
        strokeOpacity="1"
      />

      <g data-testid="card-title" transform="translate(25, 40)">
        <g className="anim-popin">
          {screenshot ? (
            <svg
              width="64"
              height="64"
              viewBox="0 0 64 64"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <mask id="m1">
                  <circle
                    cx={32}
                    cy={32}
                    r={30}
                    fill="white"
                    stroke="#000091"
                    strokeWidth={2}
                  />
                </mask>
              </defs>
              <circle
                cx={32}
                cy={32}
                r={32}
                fill="#c2d1ff"
                stroke=""
                strokeWidth={1}
              />
              <image
                x={1}
                y={1}
                width="62"
                height="62"
                href={screenshot}
                mask="url(#m1)"
              />
            </svg>
          ) : (
            <LogoBeta width={64} height={64} />
          )}
        </g>

        <g transform="translate(80, 0)">
          {logos.map((Logo, index) => {
            return (
              <Logo key={index} x={index * 40} y={-20} className="stagger" />
            );
          })}
          <a href={`https://beta.gouv.fr/startup/${id}.html`}>
            <text
              x={logos.length * 40}
              y="0"
              className="header"
              data-testid="header"
            >
              {title}
            </text>
          </a>
        </g>

        {missionLines.map((line: string, i: number) => {
          return (
            <text className="baseline" key={line} x="82" y={15 + (i + 1) * 15}>
              {line}
            </text>
          );
        })}
      </g>

      {pins.map((pin, i) => (
        <g
          key={pin.label}
          transform={`translate(25, ${105 + 20 * i})`}
          className="stagger"
          style={{ animationDelay: `${200 * (i + 1)}ms` }}
        >
          <a href={pin.href}>
            <circle cx="5" cy="6" r="5" fill={pin.color} />
            <text x="15" y="10" fill="#ddd">
              {pin.label}
            </text>
          </a>
        </g>
      ))}

      <g transform={`translate(250, 0)`}>
        {respopos.map(
          (
            member: { id: string; fullname: string; role: string },
            i: number
          ) => (
            <g
              key={member.id}
              transform={`translate(25, ${105 + 20 * i})`}
              className="stagger"
              style={{ animationDelay: `${200 * (i + 1)}ms` }}
            >
              <a href={`/api/member/${member.id}`}>
                <circle cx="5" cy="6" r="5" fill={"#438eff"} />
                <text x="15" y="10" fill="#ddd">
                  {member.fullname} (Respopo)
                </text>
              </a>
            </g>
          )
        )}
        {active_members.map(
          (
            member: { id: string; fullname: string; role: string },
            i: number
          ) => (
            <g
              key={member.id}
              transform={`translate(25, ${105 + 20 * (i + respopos.length)})`}
              className="stagger"
              style={{ animationDelay: `${200 * (i + 1 + respopos.length)}ms` }}
            >
              <a href={`/api/member/${member.id}`}>
                <circle cx="5" cy="6" r="5" fill={"#33de9c"} />
                <text x="15" y="10" fill="#ddd">
                  {member.fullname} ({member.role})
                </text>
              </a>
            </g>
          )
        )}
      </g>
    </svg>
  );
};
