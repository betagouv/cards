import Link from "next/link";

function Page() {
  const host = typeof document !== "undefined" && document.location.host;
  return (
    <div>
      <h1>Carte startup</h1>
      <pre style={{ padding: 3, background: "#ddd", display: "inline" }}>
        &lt;img src=&quot;/api/startup/codedutravail.[svg|png]&quot; /&gt;
      </pre>
      <br />
      <br />
      <img src="/api/startup/codedutravail.svg" />
      <h1>Carte membre</h1>
      <pre style={{ padding: 3, background: "#ddd", display: "inline" }}>
        &lt;img src=&quot;/api/member/julien.dauphant.[svg|png]&quot; /&gt;
      </pre>
      <br />
      <br />
      <img src="/api/member/julien.dauphant.svg" />
      <h1>Recherche</h1>
      <pre style={{ padding: 3, background: "#ddd", display: "inline" }}>
        &lt;img src=&quot;/api/search?q=julien dau&quot; /&gt;
      </pre>
      <br />
      <br />
      <img src="/api/search?q=julien%20dauph" />
      <br />
      <pre style={{ padding: 3, background: "#ddd", display: "inline" }}>
        &lt;img src=&quot;/api/search?q=code du travail&quot; /&gt;
      </pre>
      <br />
      <br />
      <img src="/api/search?q=code%20du%20travail" />
      <h1>Pages</h1>
      <Link href="/api/startup/domifa">/api/startup/domifa</Link>
      <br />
      <br />
      <Link href="/api/member/benjamin.doberset">
        /api/member/benjamin.doberset
      </Link>
      <br />
      <br />
      <br />
    </div>
  );
}

export default Page;
