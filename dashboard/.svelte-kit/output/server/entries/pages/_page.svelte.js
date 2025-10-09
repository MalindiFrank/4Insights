import { y as head } from "../../chunks/index.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    head($$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>4Insights Dashboard</title>`);
      });
      $$renderer3.push(`<meta name="description" content="Analytics dashboard for 4Insights"/>`);
    });
    $$renderer2.push(`<div class="dashboard svelte-1uha8ag"><h1 class="svelte-1uha8ag">4Insights Dashboard</h1> `);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p>Loading dashboard...</p>`);
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
export {
  _page as default
};
