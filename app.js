(async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  const getCookie = name =>
    document.cookie.split("; ").find(c => c.startsWith(name + "="))?.split("=")[1];

  const userId = getCookie("ds_user_id");
  if (!userId) {
    console.error("Not logged in");
    return;
  }

  async function fetchFollowing(after = null) {
    const vars = {
      id: userId,
      include_reel: false,
      fetch_mutual: false,
      first: 50,
      after
    };

    const url =
      "https://www.instagram.com/graphql/query/?" +
      new URLSearchParams({
        query_hash: "3dec7e2c57367ef3da3d987d89f9dbc8",
        variables: JSON.stringify(vars)
      });

    const res = await fetch(url);
    const json = await res.json();
    return json.data.user.edge_follow;
  }

  let after = null;
  let hasNext = true;
  const nonFollowers = [];

  console.log("Scanning…");

  while (hasNext) {
    const data = await fetchFollowing(after);

    data.edges.forEach(e => {
      if (!e.node.follows_viewer) {
        nonFollowers.push(e.node.username);
      }
    });

    hasNext = data.page_info.has_next_page;
    after = data.page_info.end_cursor;

    await sleep(1000); // gentle pacing
  }

  console.log("DONE");
  console.log("Does NOT follow you back:");
  console.log(nonFollowers.join("\n"));
})();
