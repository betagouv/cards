import { ExternalLink } from "./ExternalLink";
import { LogoBeta } from "./LogoBeta";
import { LogoGitHub } from "./LogoGitHub";
import { LogoLinkedIn } from "./LogoLinkedIn";
import { LogoTwitter } from "./LogoTwitter";

const css = `
text {
  font: 300 14px 'Segoe UI', Ubuntu, Sans-Serif;
  fill: #777;
}
.header {
    font: 600 18px 'Segoe UI', Ubuntu, Sans-Serif;
    fill: #2f80ed;
    animation: fadeInAnimation 0.8s ease-in-out forwards;
}
.baseline {
    font: 300 14px 'Segoe UI', Ubuntu, Sans-Serif;
    fill: #777;
    animation: fadeInAnimation 0.8s ease-in-out forwards;
}
@supports(-moz-appearance: auto) {
    /* Selector detects Firefox */
    .header { font-size: 15.5px; }
}
        
@keyframes slideInAnimation {
    from {
    width: 0;
    }
    to {
    width: calc(100%-100px);
    }
}
@keyframes growWidthAnimation {
    from {
    width: 0;
    }
    to {
    width: 100%;
    }
}
.stat {
    font: 600 14px 'Segoe UI', Ubuntu, "Helvetica Neue", Sans-Serif; fill: #434d58;
}
@supports(-moz-appearance: auto) {
    /* Selector detects Firefox */
    .stat { font-size:12px; }
}
.bold { font-weight: 700 }
.lang-name {
    font: 400 11px "Segoe UI", Ubuntu, Sans-Serif;
    fill: #434d58;
}
.stagger {
    opacity: 0;
    animation: fadeInAnimation 0.3s ease-in-out forwards;
}
#rect-mask rect{
    animation: slideInAnimation 1s ease-in-out forwards;
}
.lang-progress{
    animation: growWidthAnimation 0.6s ease-in-out forwards;
}


/* Animations */
@keyframes scaleInAnimation {
    from {
        transform: translate(-5px, 5px) scale(0);
    }
    to {
        transform: translate(-5px, 5px) scale(1);
    }
}
@keyframes fadeInAnimation {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}
`;

const WIDTH = 450;

export const Member = ({
  fullname,
  role,
  link,
  github,
  competences = [],
  teams = [],
  missions = [],
  startups = [],
  previously = [],
}: {
  fullname: string;
  role: string;
  link?: string;
  github?: string;
  competences?: string[];
  missions?: { startups: string[] }[];
  startups?: string[];
  previously?: string[];
  teams: string[];
}) => {
  const logos = [];
  const url = link;
  if (link && link.toLowerCase().includes("linkedin")) {
    logos.push((props: any) => (
      <a target="_blank" href={link}>
        <LogoLinkedIn width={32} height={32} {...props} />
      </a>
    ));
  } else if (link && link.toLowerCase().includes("twitter")) {
    logos.push((props: any) => (
      <a target="_blank" href={link}>
        <LogoTwitter width={30} height={30} {...props} />
      </a>
    ));
  } else if (link) {
    logos.push((props: any) => (
      <a target="_blank" href={link}>
        <ExternalLink width={32} height={32} {...props} />
      </a>
    ));
  }
  if (github) {
    logos.push((props: any) => (
      <a target="_blank" href={`https://github.com/${github}`}>
        <LogoGitHub width={26} height={26} {...props} y={-18} />
      </a>
    ));
  }
  const CARD_MIN_HEIGHT = 120;

  const team = teams.length && teams[0].replace("/teams/", "");
  const allStartups = Array.from(
    new Set([
      ...missions.flatMap((m: any) => m.startups || []),
      ...startups,
      ...previously,
    ])
  ).sort() as string[];
  const computedHeight =
    70 +
    30 +
    Math.max(competences.length, allStartups.length + (team ? 1 : 0)) * 20;
  const cardHeight = Math.max(CARD_MIN_HEIGHT, computedHeight);
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
      <style>{css}</style>
      <rect
        data-testid="card-bg"
        x="0.5"
        y="0.5"
        rx="4.5"
        height="99%"
        stroke="#e4e2e2"
        width={WIDTH - 5}
        fill="#fffefe"
        stroke-opacity="1"
      />
      <g data-testid="card-title" transform="translate(25, 40)">
        <g transform="translate(0, -25)">
          <LogoBeta width={64} height={64} />
        </g>
        <g transform="translate(80, 0)">
          {logos.map((Logo, index) => {
            return <Logo key={index} x={index * 40} y={-20} />;
          })}
          <text
            x={logos.length * 40}
            y="0"
            className="header"
            data-testid="header"
          >
            {fullname}
          </text>
          <text x="4" y="30" className="baseline" data-testid="baseline">
            {role}
          </text>
        </g>
      </g>
      <g data-testid="main-card-body" transform="translate(25, 95)">
        {competences.map((competence: string, index: number) => (
          <g
            key={index}
            className="stagger"
            style={{ animationDelay: `${300 * (index + 1)}ms` }}
            transform={`translate(0, ${20 * index})`}
          >
            <circle cx="5" cy="6" r="5" fill="#f1e05a" />
            <text x="15" y="10" fill="#ddd">
              {competence}
            </text>
          </g>
        ))}
        <g
          transform={
            competences.length
              ? `translate(${(WIDTH - 20) / 2}, 0)`
              : "translate(0,0)"
          }
        >
          {team && (
            <g className="stagger" style={{ animationDelay: `${300}ms` }}>
              <circle cx="5" cy="6" r="5" fill="#4F5D95" />
              <text x="15" y="10" fill="#ddd">
                {team}
              </text>
            </g>
          )}
          {allStartups.map((startup, index) => (
            <g
              key={index}
              className="stagger"
              style={{ animationDelay: `${300 * (index + (team ? 2 : 1))}ms` }}
              transform={`translate(0, ${20 * (index + (team ? 1 : 0))})`}
            >
              <a href={`https://beta.gouv.fr/startups/${startup}.html`}>
                <circle cx="5" cy="6" r="5" fill="#3572A5" />
                <text x="15" y="10" fill="#ddd">
                  {startup}
                </text>
              </a>
            </g>
          ))}
        </g>
      </g>
    </svg>
  );
};
