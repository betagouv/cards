function Page() {
  const host = typeof document !== "undefined" && document.location.host;
  return (
    <div>
      <h1>Carte startup</h1>
      <pre style={{ padding: 3, background: "#ddd", display: "inline" }}>
        &lt;img src=&quot;/api/startup/codedutravail.svg&quot; /&gt;
      </pre>
      <br />
      <br />
      <img src="/api/startup/codedutravail.svg" />
      <h1>Carte membre</h1>
      <pre style={{ padding: 3, background: "#ddd", display: "inline" }}>
        &lt;img src=&quot;/api/member/julien.dauphant.svg&quot; /&gt;
      </pre>
      <br />
      <br />
      <img src="/api/member/julien.dauphant.svg" />
    </div>
  );
}

export default Page;
